import { supabase } from './supabase'

export interface AIScoreRequest {
  prompt?: string
  workoutData?: any
  analysisType?: 'score' | 'recommendation'
  model?: string
}

export async function getAIScore(params: AIScoreRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No active session')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-score`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      }
    )

    if (!response.ok) {
      throw new Error(`AI Score API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('AI Score error:', error)
    return null
  }
}
