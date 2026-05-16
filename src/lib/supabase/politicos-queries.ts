import { createClient } from './server'
import type { Politico, Mencion, ImagenHistorico, ImagenActual, PoliticoConImagen } from '@/types/imagen'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPoliticoRow(row: any): Politico {
  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    cargo: row.cargo,
    provinciaSlug: row.provincia_slug,
    palabrasClave: row.palabras_clave ?? [],
    enTesteo: row.en_testeo ?? false,
    activo: row.activo ?? true,
    partidoNombre: row.partido_nombre ?? null,
    partidoColor: row.partido_color ?? '#94a3b8',
    fotoUrl: row.foto_url ?? null,
    facebookPageId: row.facebook_page_id ?? null,
    instagramUsername: row.instagram_username ?? null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapImagenRow(row: any): ImagenHistorico {
  return {
    id: row.id,
    politicoId: row.politico_id,
    imagenPositiva: Number(row.imagen_positiva),
    imagenNegativa: Number(row.imagen_negativa),
    totalMenciones: row.total_menciones,
    calculadoAt: row.calculado_at,
  }
}

export function calcularImagenActual(
  politicoId: number,
  menciones: Pick<Mencion, 'sentimiento'>[]
): ImagenActual | null {
  const pos = menciones.filter(m => m.sentimiento === 'positivo').length
  const neg = menciones.filter(m => m.sentimiento === 'negativo').length
  const neu = menciones.filter(m => m.sentimiento === 'neutral').length
  const total = pos + neg + neu

  // Requiere mínimo 5 menciones con sentimiento definido para evitar 100%/0%
  if (pos + neg < 5) return null

  // Los neutros se distribuyen proporcionalmente
  const totalPosNeg = pos + neg
  const posConNeutros = pos + (neu * pos) / totalPosNeg
  const negConNeutros = neg + (neu * neg) / totalPosNeg

  // Suavizado bayesiano: agregar 3 "neutros" sintéticos para evitar extremos
  const PRIOR = 3
  const posSmooth = posConNeutros + PRIOR / 2
  const negSmooth = negConNeutros + PRIOR / 2
  const totalSmooth = posSmooth + negSmooth

  const imagenPositiva = Math.round((posSmooth / totalSmooth) * 10000) / 100
  const imagenNegativa = Math.round((negSmooth / totalSmooth) * 10000) / 100

  return {
    politicoId,
    imagenPositiva,
    imagenNegativa,
    totalMenciones: total,
    calculadoAt: new Date().toISOString(),
  }
}

export async function getPoliticos(soloActivos = true): Promise<Politico[]> {
  const supabase = await createClient()
  let query = supabase.from('politicos').select('*').order('nombre')
  if (soloActivos) query = query.eq('activo', true)
  const { data, error } = await query
  if (error) throw new Error(`getPoliticos: ${error.message}`)
  return (data ?? []).map(mapPoliticoRow)
}

export async function getPoliticoBySlug(slug: string): Promise<Politico | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('politicos').select('*').eq('slug', slug).single()
  if (error) return null
  return mapPoliticoRow(data)
}

export async function getUltimaImagen(politicoId: number): Promise<ImagenHistorico | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('imagen_historico').select('*')
    .eq('politico_id', politicoId)
    .order('calculado_at', { ascending: false })
    .limit(1).single()
  return data ? mapImagenRow(data) : null
}

export async function getHistorialImagen(
  politicoId: number,
  dias = 730
): Promise<ImagenHistorico[]> {
  const supabase = await createClient()
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('imagen_historico').select('*')
    .eq('politico_id', politicoId)
    .gte('calculado_at', desde)
    .order('calculado_at', { ascending: true })
  return (data ?? []).map(mapImagenRow)
}

export async function getPoliticosConImagen(): Promise<PoliticoConImagen[]> {
  const [politicos, supabase] = await Promise.all([getPoliticos(), createClient()])
  const results = await Promise.all(
    politicos.map(async (p) => {
      const { data } = await supabase
        .from('imagen_historico')
        .select('*')
        .eq('politico_id', p.id)
        .order('calculado_at', { ascending: false })
        .limit(2)
      const imagenActual = data?.[0] ? mapImagenRow(data[0]) : null
      const imagenAnterior = data?.[1] ? mapImagenRow(data[1]) : null
      const deltaImagen =
        imagenActual && imagenAnterior
          ? Math.round((imagenActual.imagenPositiva - imagenAnterior.imagenPositiva) * 10) / 10
          : null
      return { ...p, imagenActual, deltaImagen }
    })
  )
  return results.sort(
    (a, b) => (b.imagenActual?.imagenPositiva ?? -1) - (a.imagenActual?.imagenPositiva ?? -1)
  )
}

export async function getMencionesByPolitico(
  politicoId: number,
  limit = 20
): Promise<Mencion[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('menciones')
    .select('*')
    .eq('politico_id', politicoId)
    .order('publicado_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map((row) => ({
    id: row.id,
    politicoId: row.politico_id,
    fuente: row.fuente,
    titulo: row.titulo,
    sentimiento: row.sentimiento,
    score: row.score,
    publicadoAt: row.publicado_at,
    url: row.url,
  }))
}

export async function guardarMenciones(
  menciones: Omit<Mencion, 'id'>[]
): Promise<void> {
  if (menciones.length === 0) return
  const supabase = await createClient()
  await supabase.from('menciones').insert(
    menciones.map(m => ({
      politico_id: m.politicoId,
      fuente: m.fuente,
      url: m.url,
      titulo: m.titulo,
      sentimiento: m.sentimiento,
      score: m.score,
      publicado_at: m.publicadoAt,
    }))
  )
}

export async function getMencionesNegativasSC(
  dias = 7,
  limit = 60
): Promise<{ politicoId: number; nombre: string; slug: string; cargo: string; titulo: string; fuente: string; url: string | null; score: number; publicadoAt: string }[]> {
  const supabase = await createClient()
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString()
  // Solo fuentes de noticias reales, excluir redes sociales y comentarios
  const FUENTES_NOTICIAS = ['rss', 'google_news']
  const { data: menciones } = await supabase
    .from('menciones')
    .select('politico_id, titulo, fuente, url, score, publicado_at')
    .eq('sentimiento', 'negativo')
    .gte('publicado_at', desde)
    .in('fuente', FUENTES_NOTICIAS)
    .order('score', { ascending: true })
    .limit(limit)

  if (!menciones || menciones.length === 0) return []

  const politicoIds = [...new Set(menciones.map(m => m.politico_id))]
  const { data: politicos } = await supabase
    .from('politicos')
    .select('id, nombre, slug, cargo, provincia_slug')
    .in('id', politicoIds)
    .eq('provincia_slug', 'santa-cruz')

  const politicoMap = new Map((politicos ?? []).map(p => [p.id, p]))

  return menciones
    .filter(m => politicoMap.has(m.politico_id))
    .map(m => {
      const p = politicoMap.get(m.politico_id)!
      return {
        politicoId: m.politico_id,
        nombre: p.nombre,
        slug: p.slug,
        cargo: p.cargo,
        titulo: m.titulo,
        fuente: m.fuente,
        url: m.url,
        score: m.score,
        publicadoAt: m.publicado_at,
      }
    })
}

export async function guardarImagenHistorico(
  imagen: Omit<ImagenHistorico, 'id'>
): Promise<void> {
  const supabase = await createClient()
  await supabase.from('imagen_historico').insert({
    politico_id: imagen.politicoId,
    imagen_positiva: imagen.imagenPositiva,
    imagen_negativa: imagen.imagenNegativa,
    total_menciones: imagen.totalMenciones,
  })
}
