import { createClient } from './server'
import type { ProblemaDetectado } from '@/lib/sources/problematicas-sc'
import type { ProblemaProvincial } from '@/lib/sources/problematicas-provincial'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): ProblemaDetectado & { id: number; provinciaSlug: string } {
  return {
    id: row.id,
    localidadSlug: row.localidad_slug,
    localidadNombre: row.localidad_nombre,
    categoria: row.categoria,
    titulo: row.titulo,
    fuenteNombre: row.fuente_nombre ?? '',
    url: row.url ?? null,
    severidad: row.severidad as 1 | 2 | 3,
    publicadoAt: row.publicado_at,
    provinciaSlug: row.provincia_slug ?? 'santa-cruz',
  }
}

// Versión "legacy" para SC — guarda con provincia_slug = 'santa-cruz' por default
export async function guardarProblematicas(
  problemas: ProblemaDetectado[]
): Promise<number> {
  if (problemas.length === 0) return 0
  const supabase = await createClient()

  const rows = problemas.map((p) => ({
    localidad_slug: p.localidadSlug,
    localidad_nombre: p.localidadNombre,
    categoria: p.categoria,
    titulo: p.titulo,
    fuente_nombre: p.fuenteNombre,
    url: p.url,
    severidad: p.severidad,
    publicado_at: p.publicadoAt,
    provincia_slug: 'santa-cruz',
  }))

  // Upsert por URL para no duplicar; si no hay URL, insertar siempre
  const conUrl = rows.filter((r) => r.url)
  const sinUrl = rows.filter((r) => !r.url)

  let insertados = 0

  if (conUrl.length > 0) {
    const { data } = await supabase
      .from('problematicas_sc')
      .upsert(conUrl, { onConflict: 'url', ignoreDuplicates: true })
      .select('id')
    insertados += data?.length ?? 0
  }

  if (sinUrl.length > 0) {
    const { data } = await supabase.from('problematicas_sc').insert(sinUrl).select('id')
    insertados += data?.length ?? 0
  }

  return insertados
}

export async function getProblematicasByLocalidad(
  localidadSlug: string,
  limit = 5
): Promise<(ProblemaDetectado & { id: number })[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('problematicas_sc')
    .select('*')
    .eq('localidad_slug', localidadSlug)
    .order('severidad', { ascending: false })
    .order('publicado_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map(mapRow)
}

export async function getProblematicasRecientes(
  dias = 7,
  limit = 50,
  provinciaSlug = 'santa-cruz'
): Promise<(ProblemaDetectado & { id: number; provinciaSlug: string })[]> {
  const supabase = await createClient()
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('problematicas_sc')
    .select('*')
    .eq('provincia_slug', provinciaSlug)
    .gte('publicado_at', desde)
    // Recencia primero, severidad como secundaria
    .order('publicado_at', { ascending: false })
    .order('severidad', { ascending: false })
    .limit(limit)
  return (data ?? []).map(mapRow)
}

// Versión genérica que guarda con cualquier provincia_slug
export async function guardarProblematicasProvincial(
  problemas: ProblemaProvincial[]
): Promise<number> {
  if (problemas.length === 0) return 0
  const supabase = await createClient()

  const rows = problemas.map((p) => ({
    localidad_slug: p.localidadSlug,
    localidad_nombre: p.localidadNombre,
    categoria: p.categoria,
    titulo: p.titulo,
    fuente_nombre: p.fuenteNombre,
    url: p.url,
    severidad: p.severidad,
    publicado_at: p.publicadoAt,
    provincia_slug: p.provinciaSlug,
  }))

  const conUrl = rows.filter(r => r.url)
  const sinUrl = rows.filter(r => !r.url)

  let insertados = 0
  if (conUrl.length > 0) {
    const { data } = await supabase
      .from('problematicas_sc')
      .upsert(conUrl, { onConflict: 'url', ignoreDuplicates: true })
      .select('id')
    insertados += data?.length ?? 0
  }
  if (sinUrl.length > 0) {
    const { data } = await supabase.from('problematicas_sc').insert(sinUrl).select('id')
    insertados += data?.length ?? 0
  }
  return insertados
}

export async function getResumenProblematicas(): Promise<{
  totalSemana: number
  porCategoria: Record<string, number>
  localidadMasAfectada: string | null
}> {
  const supabase = await createClient()
  const desde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('problematicas_sc')
    .select('categoria, localidad_nombre, localidad_slug, severidad')
    .gte('publicado_at', desde)

  if (!data || data.length === 0) {
    return { totalSemana: 0, porCategoria: {}, localidadMasAfectada: null }
  }

  const porCategoria: Record<string, number> = {}
  const porLocalidad: Record<string, number> = {}

  for (const row of data) {
    porCategoria[row.categoria] = (porCategoria[row.categoria] ?? 0) + 1
    porLocalidad[row.localidad_nombre] = (porLocalidad[row.localidad_nombre] ?? 0) + row.severidad
  }

  const localidadMasAfectada =
    Object.entries(porLocalidad).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return { totalSemana: data.length, porCategoria, localidadMasAfectada }
}
