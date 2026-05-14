import type { Sentimiento } from '@/types/imagen'

const HF_MODEL = 'pysentimiento/robertuito-sentiment-analysis'
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`

const LABEL_MAP: Record<string, Sentimiento> = {
  POS: 'positivo',
  NEG: 'negativo',
  NEU: 'neutral',
}

interface HFLabel {
  label: string
  score: number
}

export function parseSentimentResponse(
  response: HFLabel[][]
): { sentimiento: Sentimiento; score: number } {
  const labels = response[0] ?? []
  if (labels.length === 0) return { sentimiento: 'neutral', score: 0 }
  const top = labels.reduce(
    (best, curr) => (curr.score > best.score ? curr : best),
    { label: 'NEU', score: 0 }
  )
  return {
    sentimiento: LABEL_MAP[top.label] ?? 'neutral',
    score: top.score,
  }
}

export async function analyzeSentiment(
  texto: string
): Promise<{ sentimiento: Sentimiento; score: number }> {
  if (!texto.trim()) return { sentimiento: 'neutral', score: 0 }

  const token = process.env.HUGGINGFACE_API_TOKEN
  if (!token) return { sentimiento: 'neutral', score: 0 }

  try {
    const res = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: texto.slice(0, 512) }),
    })

    if (!res.ok) return { sentimiento: 'neutral', score: 0 }

    const data = await res.json() as HFLabel[][]
    return parseSentimentResponse(data)
  } catch {
    return { sentimiento: 'neutral', score: 0 }
  }
}
