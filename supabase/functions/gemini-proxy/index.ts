import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { payload, model = "gemini-2.0-flash" } = await req.json()

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY secret")
      return new Response(
        JSON.stringify({ error: "Configuracion del servidor incompleta (API Key faltante)." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!payload || !payload.contents) {
      return new Response(
        JSON.stringify({ error: "Payload invalido o faltante." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const data = await geminiResponse.json()

    // Propagate the actual HTTP status from Gemini so the client can handle errors properly
    return new Response(
      JSON.stringify(data),
      {
        status: geminiResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error("Error in gemini-proxy edge function:", error)
    return new Response(
      JSON.stringify({ error: 'Fallo interno en el proxy de Gemini.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
