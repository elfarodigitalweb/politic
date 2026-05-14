import type { Sentimiento } from '@/types/imagen'

// Análisis de sentimiento por keywords en español político argentino
// Fallback robusto cuando la API de HuggingFace no está disponible

const KEYWORDS_POSITIVOS = [
  'anuncia', 'inauguró', 'inaugurar', 'obras', 'inversión', 'crecimiento',
  'acuerdo', 'logro', 'éxito', 'avance', 'mejora', 'beneficio', 'apoyo',
  'aprobó', 'ganó', 'victoria', 'récord', 'positivo', 'bien', 'mejor',
  'empleo', 'trabajo', 'salud', 'educación', 'vivienda', 'infraestructura',
  'desarrollo', 'progreso', 'aumento', 'histórico', 'plan', 'programa',
  'solución', 'ayuda', 'subsidio', 'bono', 'entregó', 'firmó convenio',
]

const KEYWORDS_NEGATIVOS = [
  'denuncia', 'escándalo', 'corrupción', 'detenido', 'procesado', 'acusado',
  'crisis', 'problema', 'conflicto', 'protesta', 'marcha', 'huelga',
  'renuncia', 'renunció', 'fracasó', 'fracaso', 'derrota', 'perdió',
  'polémica', 'cuestionado', 'criticado', 'rechazó', 'rechazo', 'muerte',
  'desempleo', 'inflación', 'deuda', 'déficit', 'ajuste', 'recorte',
  'corte', 'desabastecimiento', 'escasez', 'cierre', 'quiebra',
  'incidente', 'accidente', 'víctima', 'herido', 'muerto', 'crimen',
  'robo', 'fraude', 'irregularidad', 'suspendido', 'vetado',
]

export function analizarPorKeywords(
  texto: string
): { sentimiento: Sentimiento; score: number } {
  const lower = texto.toLowerCase()

  let positivos = 0
  let negativos = 0

  for (const kw of KEYWORDS_POSITIVOS) {
    if (lower.includes(kw)) positivos++
  }
  for (const kw of KEYWORDS_NEGATIVOS) {
    if (lower.includes(kw)) negativos++
  }

  const total = positivos + negativos
  if (total === 0) return { sentimiento: 'neutral', score: 0.5 }

  if (positivos > negativos) {
    return { sentimiento: 'positivo', score: positivos / total }
  }
  if (negativos > positivos) {
    return { sentimiento: 'negativo', score: negativos / total }
  }
  return { sentimiento: 'neutral', score: 0.5 }
}

// Mantenemos parseSentimentResponse para los tests existentes
interface HFLabel {
  label: string
  score: number
}

const LABEL_MAP: Record<string, Sentimiento> = {
  POS: 'positivo',
  NEG: 'negativo',
  NEU: 'neutral',
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

  // Intentar HuggingFace API si hay token
  if (token) {
    try {
      const res = await fetch(
        'https://api-inference.huggingface.co/models/cardiffnlp/twitter-xlm-roberta-base-sentiment',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: texto.slice(0, 512) }),
          signal: AbortSignal.timeout(5000),
        }
      )

      if (res.ok) {
        const data = await res.json() as HFLabel[][]
        if (Array.isArray(data) && data[0]?.length > 0) {
          return parseSentimentResponse(data)
        }
      }
    } catch {
      // API no disponible — usar análisis por keywords
    }
  }

  // Fallback: análisis por keywords en español
  return analizarPorKeywords(texto)
}
