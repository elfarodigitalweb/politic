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
  const total = pos + neg
  if (total === 0) return null
  return {
    politicoId,
    imagenPositiva: Math.round((pos / total) * 10000) / 100,
    imagenNegativa: Math.round((neg / total) * 10000) / 100,
    totalMenciones: menciones.length,
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
  dias = 30
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
  const politicos = await getPoliticos()
  const results = await Promise.all(
    politicos.map(async p => ({
      ...p,
      imagenActual: await getUltimaImagen(p.id),
    }))
  )
  return results.sort(
    (a, b) => (b.imagenActual?.imagenPositiva ?? -1) - (a.imagenActual?.imagenPositiva ?? -1)
  )
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
