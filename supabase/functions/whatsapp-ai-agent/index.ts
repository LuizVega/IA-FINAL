import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SYSTEM_PROMPT = `
Eres MyMorez Bot (ADMIN MODE).
Tu rol es actuar como el DUEÑO/ADMINISTRADOR del sistema de inventario.

ESTILO:
- Directo, eficiente y al grano.
- NO actúes como vendedor. Hablas con el dueño del negocio.
- Responde siempre basado en los datos de las herramientas.

CAPACIDADES ESPECIALES:
- Puedes ver inventario, ajustar stock y generar reportes de ventas.
- Si te mandan una foto, analízala para identificar productos o leer recibos.
`;

serve(async (req) => {
    if (req.method === "GET") {
        const params = new URL(req.url).searchParams;
        if (params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === "mymorez_secure_token") {
            return new Response(params.get("hub.challenge"), { status: 200 });
        }
        return new Response("Verification Failed", { status: 403 });
    }

    try {
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (!message) return new Response("OK", { status: 200 });

        const from = message.from;
        let text = message.text?.body || "";
        const image = message.image;

        // Env Vars
        const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
        const PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID");
        const WA_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_KEY || !PHONE_ID || !WA_TOKEN) {
            return new Response("Config Error", { status: 500 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        // 1. Identity Awareness
        const { data: profile } = await supabase.from('profiles').select('display_name, company_name').eq('whatsapp_number', from).single();
        const ownerName = profile?.display_name || "Admin";
        const companyName = profile?.company_name || "MyMorez";

        const dynamicSystemPrompt = `${SYSTEM_PROMPT}\nUsuario actual: ${ownerName} de la empresa ${companyName}.`;

        // 2. Prepare for Multimodal (Vision) if image exists
        let mediaData = null;
        if (image) {
            // Get Image URL from WhatsApp
            const imgMetaRes = await fetch(`https://graph.facebook.com/v17.0/${image.id}`, {
                headers: { "Authorization": `Bearer ${WA_TOKEN}` }
            });
            const imgMeta = await imgMetaRes.json();
            if (imgMeta.url) {
                const imgRes = await fetch(imgMeta.url, { headers: { "Authorization": `Bearer ${WA_TOKEN}` } });
                const blob = await imgRes.blob();
                const buffer = await blob.arrayBuffer();
                mediaData = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                text = text || "Analiza esta imagen.";
            }
        }

        // 3. Define Tools
        const tools = [{
            function_declarations: [
                {
                    name: "get_inventory",
                    description: "Busca productos. Usa 'ALL_ITEMS' para ver todo.",
                    parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
                },
                {
                    name: "update_stock",
                    description: "Actualiza stock (ej: +5 por llegada, -2 por venta manual).",
                    parameters: { type: "object", properties: { sku: { type: "string" }, quantity: { type: "number" } }, required: ["sku", "quantity"] }
                },
                {
                    name: "get_sales_report",
                    description: "Resumen de ventas totales.",
                    parameters: { type: "object", properties: { period: { type: "string", enum: ["today", "week", "month"] } }, required: ["period"] }
                },
                {
                    name: "get_orders_summary",
                    description: "Resumen de pedidos pendientes y completados.",
                    parameters: { type: "object", properties: {}, required: [] }
                }
            ]
        }];

        // 4. Gemini Call
        const model = "gemini-2.0-flash-exp"; // Using 2.0 or 2.5
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;

        const contentParts = [{ text: `${dynamicSystemPrompt}\nUSER: ${text}` }];
        if (mediaData) {
            contentParts.push({ inline_data: { mime_type: "image/jpeg", data: mediaData } } as any);
        }

        const payload1 = {
            contents: [{ role: "user", parts: contentParts }],
            tools: tools,
            safetySettings: [{ category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }, { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }, { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }, { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }]
        };

        const res1 = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload1) });
        const json1 = await res1.json();

        if (json1.error) {
            await sendWhatsApp(from, `⚠️ Error Gemini: ${json1.error.message}`, PHONE_ID, WA_TOKEN);
            return new Response("Error", { status: 200 });
        }

        const candidate1 = json1.candidates?.[0];
        const calls = candidate1?.content?.parts?.filter(p => p.functionCall);
        let finalReply = candidate1?.content?.parts?.[0]?.text;

        if (calls && calls.length > 0) {
            const toolResults = [];

            for (const call of calls) {
                const fnName = call.functionCall.name;
                const args = call.functionCall.args;
                let result = {};

                if (fnName === "get_inventory") {
                    let q = supabase.from('products').select('name, stock, price, sku');
                    if (args.query === 'ALL_ITEMS' || args.query.toLowerCase().includes('todo')) q = q.limit(20);
                    else q = q.ilike('name', `%${args.query}%`).limit(5);
                    const { data } = await q;
                    result = { items: data || [] };
                }
                else if (fnName === "update_stock") {
                    const { data: item } = await supabase.from('products').select('stock').eq('sku', args.sku).single();
                    if (item) {
                        const newStock = item.stock + args.quantity;
                        await supabase.from('products').update({ stock: newStock }).eq('sku', args.sku);
                        result = { success: true, sku: args.sku, new_stock: newStock };
                    } else result = { error: "SKU no encontrado" };
                }
                else if (fnName === "get_sales_report") {
                    const { data } = await supabase.from('orders').select('total_amount').eq('status', 'completed');
                    const total = data?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
                    result = { total_sales: total, currency: "PEN", period: args.period };
                }
                else if (fnName === "get_orders_summary") {
                    const { data } = await supabase.from('orders').select('status');
                    const pending = data?.filter(o => o.status === 'pending').length || 0;
                    const completed = data?.filter(o => o.status === 'completed').length || 0;
                    result = { pending, completed, total: data?.length || 0 };
                }

                toolResults.push({
                    role: "function",
                    parts: [{ functionResponse: { name: fnName, response: { name: fnName, content: result } } }]
                });
            }

            const payload2 = {
                contents: [
                    { role: "user", parts: contentParts },
                    candidate1.content,
                    ...toolResults
                ],
                tools: tools,
                safetySettings: payload1.safetySettings
            };

            const res2 = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload2) });
            const json2 = await res2.json();
            finalReply = json2.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;
        }

        if (finalReply) await sendWhatsApp(from, finalReply, PHONE_ID, WA_TOKEN);
        return new Response("OK", { status: 200 });

    } catch (err) {
        console.error(err);
        return new Response("Error", { status: 200 });
    }
});

async function sendWhatsApp(to: string, body: string, phoneId: string, token: string) {
    await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to, text: { body } })
    });
}

