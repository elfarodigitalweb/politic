// Google Trends — Completamente gratis, sin API key
// Usa el package google-trends-api (wrapper del endpoint público de Google)

// eslint-disable-next-line @typescript-eslint/no-require-imports
const googleTrends = require('google-trends-api')

export interface TrendData {
  keyword: string
  interesActual: number      // 0-100 (score de popularidad última semana)
  tendencia: 'subiendo' | 'bajando' | 'estable'
  porProvincia: Array<{ provinciaSlug: string; valor: number }>
}

const PROVINCE_GEO_MAP: Record<string, string> = {
  'buenos-aires': 'AR-B',
  'ciudad-autonoma': 'AR-C',
  'catamarca': 'AR-K',
  'chaco': 'AR-H',
  'chubut': 'AR-U',
  'cordoba': 'AR-X',
  'corrientes': 'AR-W',
  'entre-rios': 'AR-E',
  'formosa': 'AR-P',
  'jujuy': 'AR-Y',
  'la-pampa': 'AR-L',
  'la-rioja': 'AR-F',
  'mendoza': 'AR-M',
  'misiones': 'AR-N',
  'neuquen': 'AR-Q',
  'rio-negro': 'AR-R',
  'salta': 'AR-A',
  'san-juan': 'AR-J',
  'san-luis': 'AR-D',
  'santa-cruz': 'AR-Z',
  'santa-fe': 'AR-S',
  'santiago-del-estero': 'AR-G',
  'tierra-del-fuego': 'AR-V',
  'tucuman': 'AR-T',
}

async function getInterestOverTime(keyword: string): Promise<number> {
  try {
    const raw = await googleTrends.interestOverTime({
      keyword,
      geo: 'AR',
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    })
    const data = JSON.parse(raw)
    const points = data?.default?.timelineData ?? []
    if (points.length === 0) return 0
    const values = points.map((p: { value: number[] }) => p.value[0])
    return Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length)
  } catch {
    return 0
  }
}

async function getInterestByRegion(keyword: string): Promise<Array<{ provinciaSlug: string; valor: number }>> {
  try {
    const raw = await googleTrends.interestByRegion({
      keyword,
      geo: 'AR',
      resolution: 'REGION',
    })
    const data = JSON.parse(raw)
    const regions = data?.default?.geoMapData ?? []

    const result: Array<{ provinciaSlug: string; valor: number }> = []
    for (const [slug, geoCode] of Object.entries(PROVINCE_GEO_MAP)) {
      const region = regions.find((r: { geoCode: string; value: number[] }) => r.geoCode === geoCode)
      if (region) {
        result.push({ provinciaSlug: slug, valor: region.value[0] ?? 0 })
      }
    }
    return result.sort((a, b) => b.valor - a.valor)
  } catch {
    return []
  }
}

export async function fetchGoogleTrends(
  nombre: string,
  keywords: string[]
): Promise<TrendData | null> {
  // Usar el nombre + primera keyword para mejor precisión
  const keyword = keywords[0] ?? nombre

  const [interesActual, porProvincia] = await Promise.all([
    getInterestOverTime(keyword),
    getInterestByRegion(keyword),
  ])

  if (interesActual === 0 && porProvincia.length === 0) return null

  return {
    keyword,
    interesActual,
    tendencia: interesActual > 50 ? 'subiendo' : interesActual > 20 ? 'estable' : 'bajando',
    porProvincia,
  }
}
