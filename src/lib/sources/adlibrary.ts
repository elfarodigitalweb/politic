// Facebook Ad Library API — Gratis, oficial, sin business verification
// Requiere: User Access Token de graph.facebook.com/tools/explorer

const FB_API_VERSION = 'v19.0'

export interface AvisoPolitico {
  avisoId: string
  texto: string
  nombrePagina: string
  gastoMin: number | null
  gastoMax: number | null
  impresionesMin: number | null
  impresionesMax: number | null
  fechaInicio: string | null
  fechaFin: string | null
  urlPreview: string | null
  plataforma: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseAviso(item: any): AvisoPolitico {
  const spend = item.spend ?? {}
  const impressions = item.impressions ?? {}
  return {
    avisoId: item.id ?? '',
    texto: item.ad_creative_bodies?.[0] ?? item.ad_creative_link_titles?.[0] ?? '',
    nombrePagina: item.page_name ?? '',
    gastoMin: spend.lower_bound ? Number(spend.lower_bound) : null,
    gastoMax: spend.upper_bound ? Number(spend.upper_bound) : null,
    impresionesMin: impressions.lower_bound ? Number(impressions.lower_bound) : null,
    impresionesMax: impressions.upper_bound ? Number(impressions.upper_bound) : null,
    fechaInicio: item.ad_delivery_start_time ?? null,
    fechaFin: item.ad_delivery_stop_time ?? null,
    urlPreview: item.ad_snapshot_url ?? null,
    plataforma: 'facebook',
  }
}

export async function fetchAvisosPoliticos(
  nombrePolitico: string
): Promise<AvisoPolitico[]> {
  const token = process.env.FACEBOOK_USER_TOKEN
  if (!token) return []

  const params = new URLSearchParams({
    access_token: token,
    search_terms: nombrePolitico,
    ad_type: 'POLITICAL_AND_ISSUE_ADS',
    ad_reached_countries: 'AR',
    fields: 'id,ad_creative_bodies,ad_creative_link_titles,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,spend,impressions,page_name',
    limit: '20',
  })

  try {
    const res = await fetch(
      `https://graph.facebook.com/${FB_API_VERSION}/ads_archive?${params}`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) return []
    const data = await res.json() as { data?: unknown[] }
    if (!Array.isArray(data.data)) return []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.data.map((item: any) => parseAviso(item)).filter(a => a.texto.length > 0)
  } catch {
    return []
  }
}
