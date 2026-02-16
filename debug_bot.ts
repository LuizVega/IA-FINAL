
const FUNCTION_URL = "https://ebesrhejronqwewuwbsd.supabase.co/functions/v1/whatsapp-ai-agent-v2";

const payload = {
    entry: [
        {
            "changes": [
                {
                    "value": {
                        "messages": [
                            {
                                "from": "51906919246",
                                "text": {
                                    "body": "Consulta inventario de prueba"
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

try {
    const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    console.log("Response Status:", res.status);
    const text = await res.text();
    console.log("Response Body (Logs):");
    console.log(text);
} catch (e) {
    console.error("Fetch failed:", e);
}
