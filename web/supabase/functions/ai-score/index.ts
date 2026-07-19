import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const REQUESTY_API_KEY = Deno.env.get('REQUESTY_API_KEY') || ''
const REQUESTY_BASE_URL = Deno.env.get('REQUESTY_BASE_URL') || 'https://router.requesty.ai/v1'
const REQUESTY_MODEL = Deno.env.get('REQUESTY_MODEL') || 'gpt-3.5-turbo'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { prompt, workoutData, analysisType, model } = await req.json()

    const activeModel = model || REQUESTY_MODEL

    const systemPrompt = analysisType === 'score'
      ? `You are a fitness AI assistant. Analyze the workout data and return a JSON response with:
{
  "overall_rating": <number 0-100>,
  "endurance_score": <number 0-100>,
  "strength_score": <number 0-100>,
  "power_score": <number 0-100>,
  "muscle_groups": { "<muscle>": <number 0-100> },
  "summary": "<brief analysis>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}`
      : `You are a fitness AI assistant. Analyze the user's overall fitness data and provide recommendations.`

    const response = await fetch(`${REQUESTY_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REQUESTY_API_KEY}`,
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt || JSON.stringify(workoutData) },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Requesty API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      parsed = { raw_response: content, overall_rating: 50 }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      overall_rating: 50,
      muscle_groups: {},
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
