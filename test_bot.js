
const FUNCTION_URL = "https://ebesrhejronqwewuwbsd.supabase.co/functions/v1/whatsapp-ai-agent-v2";

const payload = {
    entry: [
        {
            "changes": [
                {
                    "value": {
                        "messages": [
                            {
                                "from": "51940656460",
                                "text": {
                                    "body": "Hola bot, me das un resumen de ventas?"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ]
};

console.log("Sending payload to:", FUNCTION_URL);

async function test() {
    try {
        const res = await fetch(FUNCTION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        console.log("Response Status:", res.status);
        const json = await res.json();
        console.log("Response Body (JSON):");
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

test();
