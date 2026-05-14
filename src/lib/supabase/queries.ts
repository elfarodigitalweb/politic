import { createClient } from './server'
import { getColorPartido } from '@/lib/partidos'
import type { Provincia, Municipio } from '@/types/mapa'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProvinciasToMap(row: any): Provincia {
  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    codigoIndec: row.codigo_indec ?? '',
    gobernadorNombre: row.gobernador_nombre ?? null,
    partidoSlug: row.partidos?.slug ?? null,
    partidoColor: row.partidos?.color ?? getColorPartido(null),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapMunicipiosToMap(row: any): Municipio {
  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    provinciaSlug: row.provincias?.slug ?? '',
    intendenteNombre: row.intendente_nombre ?? null,
    partidoSlug: row.partidos?.slug ?? null,
    partidoColor: row.partidos?.color ?? getColorPartido(null),
    imagenPositiva: row.imagen_positiva ?? null,
    imagenNegativa: row.imagen_negativa ?? null,
  }
}

export async function getProvincias(): Promise<Provincia[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('provincias')
    .select('*, partidos(slug, color)')
    .order('nombre')
  if (error) throw new Error(`getProvincias: ${error.message}`)
  return (data ?? []).map(mapProvinciasToMap)
}

export async function getMunicipiosByProvincia(provinciaSlug: string): Promise<Municipio[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('municipios')
    .select('*, partidos(slug, color), provincias!inner(slug)')
    .eq('provincias.slug', provinciaSlug)
    .order('nombre')
  if (error) throw new Error(`getMunicipiosByProvincia: ${error.message}`)
  return (data ?? []).map(mapMunicipiosToMap)
}

export async function getMunicipioBySlug(slug: string): Promise<Municipio | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('municipios')
    .select('*, partidos(slug, color), provincias(slug)')
    .eq('slug', slug)
    .single()
  if (error) return null
  return mapMunicipiosToMap(data)
}
