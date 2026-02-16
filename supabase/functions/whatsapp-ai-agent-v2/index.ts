import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SYSTEM_PROMPT = `
Eres un GERENTE DE NEGOCIO UNIVERSAL (IA).
Tu trabajo es administrar la tienda del usuario y responder sus dudas.
Puedes hacer CUALQUIER ACCIÓN: agregar, borrar, editar productos, registrar ventas, cambiar nombre del negocio, etc.

TU SALIDA DEBE SER UN JSON CON LA INTENCIÓN DETECTADA.

ACCIONES (intents):
1. "add_product": Agregar nuevo producto.
2. "update_product": Cambiar precio, stock o nombre de un producto existente.
3. "delete_product": Eliminar/Borrar un producto.
4. "register_sale": Registrar una venta nueva.
5. "update_business": Cambiar nombre del negocio o info del perfil.
6. "search_product": Consultar inventario.
7. "sales_report": Consultar ventas.
8. "chat": Conversación normal, consejos, saludos.

ESTRUCTURA JSON OBLIGATORIA:
{
  "intent": "string",
  "data": {
    "name": "string (nombre producto)",
    "new_name": "string (para update)",
    "price": number,
    "stock": number,
    "category": "string",
    "amount": number (para venta),
    "company_name": "string (para negocio)"
  },
  "reply": "Respuesta al usuario para WhatsApp (CONFIRMA la acción o RESPONDE la duda)"
}

REGLAS:
- Si falta información CRÍTICA (ej: precio para agregar), tu intent es "chat" y en "reply" pides el dato.
- Si es "register_sale", asume que el "amount" es el total de la venta.
- Si el usuario dice "Cambia el nombre de mi tienda a X", es "update_business".
- Si el usuario dice "Vendí 50 soles", es "register_sale" con amount=50.
`;

serve(async (req) => {
    const logs: string[] = [];
    const log = (msg: string, data?: any) => {
        const line = data ? `${msg} ${typeof data === 'object' ? JSON.stringify(data, Object.getOwnPropertyNames(data)) : data}` : msg;
        console.log(line);
        logs.push(line);
    };

    try {
        // Validation for Webhook Setup
        if (req.method === "GET") {
            const params = new URL(req.url).searchParams;
            const mode = params.get("hub.mode");
            const token = params.get("hub.verify_token");
            const challenge = params.get("hub.challenge");

            if (mode === "subscribe" && token === "mymorez_secure_token") {
                log("Webhook verified successfully.");
                return new Response(challenge, { status: 200 });
            }
            return new Response("Forbidden", { status: 403 });
        }

        const rawBody = await req.text();
        const body = JSON.parse(rawBody);

        // Check if it's a WhatsApp message
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (!message) {
            log("No message found in request body.");
            return new Response("OK", { status: 200 });
        }

        const from = message.from;
        const text = message.text?.body || "";
        log(`Incoming message from ${from}: "${text}"`);

        const PHONE_ID = value?.metadata?.phone_number_id || Deno.env.get("WHATSAPP_PHONE_ID");
        const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
        const WA_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
        const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

        if (!GEMINI_KEY || !WA_TOKEN || !PHONE_ID) {
            log("CRITICAL: Missing environment variables (GEMINI_KEY, WA_TOKEN, or PHONE_ID).");
            return new Response("Configuration Error", { status: 500 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        // 1. Identity (SMART MATCH)
        let { data: profile, error: profileErr } = await supabase.from('profiles').select('id, display_name').eq('whatsapp_number', from).maybeSingle();

        if (profileErr) log("Supabase Profile Error:", profileErr);

        if (!profile && from.length >= 9) {
            const suffix = from.slice(-9);
            const { data: suffixMatch } = await supabase.from('profiles').select('id, display_name').ilike('whatsapp_number', `%${suffix}`).maybeSingle();
            profile = suffixMatch;
        }

        if (!profile) {
            const unlinkedReply = `¡Hola! Tu número (${from}) no está vinculado a ninguna cuenta de MyMorez. Por favor, regístrate en nuestra plataforma web para comenzar a gestionar tu inventario por WhatsApp.`;
            log(`Number ${from} is not linked. Sending enrollment notice.`);
            await sendWhatsApp(from, unlinkedReply, PHONE_ID, WA_TOKEN, log);
            return new Response(JSON.stringify({ status: "OK_UNLINKED_REPLIED", from, logs }), { status: 200 });
        }

        const OWNER_ID = profile.id;
        log(`Authenticated user: ${profile.display_name} (ID: ${OWNER_ID})`);

        // 2. Gemini AI Processing
        const modelName = "gemini-2.0-flash-lite"; // Valid active model for 2026
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_KEY}`;

        log(`Calling Gemini (${modelName})...`);
        const geminiRes = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\nUSUARIO: ${text}` }] }],
                generationConfig: {
                    responseMimeType: "application/json"
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const geminiJson = await geminiRes.json();

        if (geminiJson.error) {
            log("GEMINI API ERROR:", geminiJson.error);
            let errorReply = "Lo siento, tuve un problema técnico. Por favor intenta más tarde.";

            if (geminiJson.error.code === 429) {
                errorReply = "💤 Mis neuronas de IA están agotadas por hoy (Límite de cuota excedido). Por favor contacta al administrador para recargar.";
                log("Quota exceeded (429).");
            } else if (geminiJson.error.code === 404) {
                errorReply = "🔧 Error de configuración: El modelo de IA seleccionado no está disponible.";
                log("Model not found (404).");
            }

            await sendWhatsApp(from, errorReply, PHONE_ID, WA_TOKEN, log);
            return new Response("Gemini Error Handled", { status: 200 });
        }

        const candidate = geminiJson.candidates?.[0];
        let rawResponse = candidate?.content?.parts?.[0]?.text;

        if (!rawResponse) {
            log("Gemini response empty. Finish Reason:", candidate?.finishReason);
            await sendWhatsApp(from, "No pude procesar esa solicitud por razones de seguridad o falta de claridad. ¿Podrías intentar de otra forma?", PHONE_ID, WA_TOKEN, log);
            return new Response("Empty Gemini Response", { status: 200 });
        }

        let parsed = { intent: "chat", data: {}, reply: "" };
        try {
            parsed = JSON.parse(rawResponse);
        } catch (e) {
            log("JSON Parse Error on Gemini output:", { error: e.message, rawResponse });
            parsed.intent = "chat";
            parsed.reply = rawResponse;
        }

        log("Detected Intent:", parsed.intent);
        let finalReply = parsed.reply;

        // 3. Action Execution
        try {
            if (parsed.intent === "add_product") {
                const { name, price, stock, category } = parsed.data as any;
                if (name && price && stock) {
                    const { error } = await supabase.from('products').insert([{
                        user_id: OWNER_ID,
                        name, price, stock, category: category || "General",
                        sku: `WA-${Date.now()}`
                    }]);
                    if (error) throw error;
                    log(`Product added: ${name}`);
                }
            }
            else if (parsed.intent === "update_product") {
                const { name, price, stock } = parsed.data as any;
                const updateData: any = {};
                if (price !== undefined) updateData.price = price;
                if (stock !== undefined) updateData.stock = stock;

                const { error } = await supabase.from('products')
                    .update(updateData)
                    .eq('user_id', OWNER_ID)
                    .ilike('name', name);
                if (error) throw error;
                log(`Product updated: ${name}`);
            }
            else if (parsed.intent === "delete_product") {
                const { name } = parsed.data as any;
                const { error } = await supabase.from('products')
                    .delete()
                    .eq('user_id', OWNER_ID)
                    .ilike('name', name);
                if (error) throw error;
                log(`Product deleted: ${name}`);
            }
            else if (parsed.intent === "update_business") {
                const { company_name } = parsed.data as any;
                if (company_name) {
                    const { error } = await supabase.from('profiles')
                        .update({ company_name })
                        .eq('id', OWNER_ID);
                    if (error) throw error;
                    log(`Business name updated to: ${company_name}`);
                }
            }
            else if (parsed.intent === "register_sale") {
                const { amount } = parsed.data as any;
                if (amount) {
                    const { error } = await supabase.from('orders').insert([{
                        user_id: OWNER_ID,
                        total_amount: amount,
                        status: 'completed',
                        customer_name: 'Venta Directa (WhatsApp)',
                        created_at: new Date().toISOString()
                    }]);
                    if (error) throw error;
                    log(`Sale registered: ${amount}`);
                }
            }
            else if (parsed.intent === "search_product") {
                const { name } = parsed.data as any;
                if (name) {
                    const { data } = await supabase.from('products').select('*').eq('user_id', OWNER_ID).ilike('name', `%${name}%`).limit(5);
                    if (data?.length) {
                        const itemsList = data.map((p: any) => `- ${p.name}: $${p.price} (${p.stock} unid)`).join("\n");
                        finalReply += "\n\n" + itemsList;
                    } else {
                        finalReply = `No encontré ningún producto que coincida con "${name}" en tu inventario.`;
                    }
                }
            }
            else if (parsed.intent === "sales_report") {
                const { data } = await supabase.from('orders').select('total_amount').eq('user_id', OWNER_ID).eq('status', 'completed');
                const total = data?.reduce((a, c) => a + Number(c.total_amount), 0) || 0;
                finalReply = `💰 *Resumen de Ventas*\n\nTotal acumulado: $${total.toFixed(2)}`;
            }

        } catch (dbErr) {
            log("Database Execution Error:", dbErr);
            finalReply = `Lo siento, no pude completar la acción en la base de datos: ${dbErr.message}`;
        }

        // 4. Final WhatsApp Response
        await sendWhatsApp(from, finalReply || "Mensaje procesado correctamente.", PHONE_ID, WA_TOKEN, log);

        return new Response(JSON.stringify({ status: "SUCCESS", logs, reply: finalReply }), { status: 200 });

    } catch (err) {
        log("CRITICAL SYSTEM ERROR:", err);
        return new Response(JSON.stringify({ status: "CRASH", error: err.message, logs }), { status: 200 });
    }
});

async function sendWhatsApp(to: string, body: string, phoneId: string, token: string, log: Function) {
    try {
        log(`Sending WhatsApp message to ${to}...`);
        const res = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to,
                text: { body }
            })
        });

        const resJson = await res.json();
        if (!res.ok) {
            log("WhatsApp API Error Response:", resJson);
        } else {
            log("WhatsApp message sent successfully. ID:", resJson.messages?.[0]?.id);
        }
    } catch (e) {
        log("Failed to send WhatsApp message via Fetch:", e.message);
    }
}
