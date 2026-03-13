import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Configure CORS for web client requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { payload, model = "gemini-2.0-flash" } = await req.json()

    // Retrieve the securely stored API key
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY secret")
      return new Response(
        JSON.stringify({ error: "Configuración del servidor incompleta (API Key faltante)." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!payload || !payload.contents) {
      return new Response(
        JSON.stringify({ error: "Payload inválido o faltante." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Proxy request to Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    })

    const data = await geminiResponse.json()

    // Pass Gemini response back to the client directly
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("Error in gemini-proxy edge function:", error)
    return new Response(
      JSON.stringify({ error: 'Fallo interno en el proxy de Gemini.', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
