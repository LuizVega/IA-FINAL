import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SYSTEM_PROMPT = `
Eres MyMorez Bot (ADMIN MODE).
Tu rol es actuar como el DUEÑO/ADMINISTRADOR del sistema de inventario.
Hablas con el dueño real de la tienda (el usuario).

ESTILO:
- Directo, eficiente y al grano.
- NO actúes como vendedor ni uses frases de "atención al cliente".
- Si te piden "todos los productos", asume que quieren un reporte rápido.
- Si hay un error, repórtalo con detalles técnicos mínimos.

HERRAMIENTAS:
1. get_inventory(query): Busca productos. Si query es "todo" o "lista", trae los primeros 20.
2. update_stock(sku, quantity): Ajusta inventario.
`;

serve(async (req) => {
    // 1. WhatsApp Verification (GET)
    if (req.method === "GET") {
        const params = new URL(req.url).searchParams;
        if (params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === "mymorez_secure_token") {
            return new Response(params.get("hub.challenge"), { status: 200 });
        }
        return new Response("Verification Failed", { status: 403 });
    }

    try {
        // 2. Parse Incoming Message
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);
        const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        // If no message (status update, etc.), ignore.
        if (!message) return new Response("OK", { status: 200 });

        const from = message.from;
        const text = message.text?.body || "";

        // 3. Env Vars Verification
        const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
        const PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID");
        const WA_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_KEY || !PHONE_ID || !WA_TOKEN) {
            console.error("Missing Environment Variables");
            return new Response("Config Error", { status: 500 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        // 4. Call Gemini (Model 2.5 Flash)
        // NOTE: SafetySettings set to BLOCK_NONE to prevent "Coma" (medical) false positives.
        const model = "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;

        const tools = [{
            function_declarations: [
                {
                    name: "get_inventory",
                    description: "Search for products. If query implies 'all' or 'everything', pass 'ALL_ITEMS' as query.",
                    parameters: { type: "object", properties: { query: { type: "string", description: "Product name or 'ALL_ITEMS'" } }, required: ["query"] }
                },
                {
                    name: "update_stock",
                    description: "Updates the stock quantity for a product.",
                    parameters: {
                        type: "object",
                        properties: {
                            sku: { type: "string", description: "Exact SKU" },
                            quantity: { type: "number", description: "Amount to add/subtract" }
                        },
                        required: ["sku", "quantity"]
                    }
                }
            ]
        }];

        const payload1 = {
            contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\nUSER MESSAGE: ${text}` }] }],
            tools: tools,
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        };

        const res1 = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload1) });
        const json1 = await res1.json();

        if (json1.error) {
            console.error("Gemini 1 Error:", json1.error);
            const errMsg = `⚠️ Error de Cerebro (Gemini): ${json1.error.message || "Desconocido"}`;
            await sendWhatsApp(from, errMsg, PHONE_ID, WA_TOKEN);
            return new Response("Gemini Error", { status: 200 });
        }

        const candidate1 = json1.candidates?.[0];
        const call = candidate1?.content?.parts?.find(p => p.functionCall);
        let finalReply = candidate1?.content?.parts?.[0]?.text;

        // 5. Handle Tool Call
        if (call) {
            const fnName = call.functionCall.name;
            const args = call.functionCall.args;
            let toolResult = {};

            if (fnName === "get_inventory") {
                let queryBuilder = supabase.from('products').select('name, stock, price, sku');

                // Logic for "ALL"
                if (args.query === 'ALL_ITEMS' || args.query.toLowerCase().includes('todo')) {
                    queryBuilder = queryBuilder.limit(20);
                } else {
                    queryBuilder = queryBuilder.ilike('name', `%${args.query}%`).limit(5);
                }

                const { data, error } = await queryBuilder;

                if (error) toolResult = { error: error.message };
                else toolResult = { items: data || [] };
            }
            else if (fnName === "update_stock") {
                const { data: current } = await supabase.from('products').select('stock').eq('sku', args.sku).single();
                if (!current) {
                    toolResult = { error: "SKU no encontrado (Verifica el código exacto)" };
                } else {
                    const newStock = current.stock + args.quantity;
                    const { error } = await supabase.from('products').update({ stock: newStock }).eq('sku', args.sku);
                    if (error) toolResult = { error: error.message };
                    else toolResult = { success: true, new_stock: newStock, sku: args.sku };
                }
            }

            // 6. Call Gemini Again with Result
            const payload2 = {
                contents: [
                    { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\nUSER MESSAGE: ${text}` }] },
                    candidate1.content,
                    {
                        role: "function",
                        parts: [{
                            functionResponse: {
                                name: fnName,
                                response: { name: fnName, content: toolResult }
                            }
                        }]
                    }
                ],
                tools: tools,
                safetySettings: payload1.safetySettings // Keep safety disabled
            };

            const res2 = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload2) });
            const json2 = await res2.json();

            if (json2.error) {
                console.error("Gemini 2 Error:", json2.error);
                finalReply = `⚠️ Error generando respuesta final: ${json2.error.message}`;
            } else {
                finalReply = json2.candidates?.[0]?.content?.parts?.[0]?.text;
            }
        }

        // 7. Send Final Reply to WhatsApp
        if (finalReply) {
            await sendWhatsApp(from, finalReply, PHONE_ID, WA_TOKEN);
        }

        return new Response("OK", { status: 200 });

    } catch (err) {
        console.error("Critical Error:", err);
        return new Response("Internal Error", { status: 200 });
    }
});

async function sendWhatsApp(to, body, phoneId, token) {
    await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: to, text: { body: body } })
    });
}
