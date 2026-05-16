import { createClient } from './server'
import type { Encuesta } from '@/types/imagen'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEncuestaRow(row: any): Encuesta {
  return {
    id: row.id,
    politicoId: row.politico_id,
    fecha: row.fecha,
    intencionVoto: row.intencion_voto !== null ? Number(row.intencion_voto) : null,
    imagenPositiva: row.imagen_positiva !== null ? Number(row.imagen_positiva) : null,
    imagenNegativa: row.imagen_negativa !== null ? Number(row.imagen_negativa) : null,
    conocimiento: row.conocimiento !== null ? Number(row.conocimiento) : null,
    fuente: row.fuente,
    metodologia: row.metodologia ?? null,
    universo: row.universo ?? null,
    margenError: row.margen_error !== null ? Number(row.margen_error) : null,
    notas: row.notas ?? null,
    createdAt: row.created_at,
  }
}

export async function getEncuestasByPolitico(politicoId: number): Promise<Encuesta[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('encuestas')
    .select('*')
    .eq('politico_id', politicoId)
    .order('fecha', { ascending: false })
  return (data ?? []).map(mapEncuestaRow)
}

export async function getUltimaEncuesta(politicoId: number): Promise<Encuesta | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('encuestas')
    .select('*')
    .eq('politico_id', politicoId)
    .order('fecha', { ascending: false })
    .limit(1)
    .single()
  return data ? mapEncuestaRow(data) : null
}

export async function getAllUltimasEncuestas(): Promise<
  (Encuesta & { politicoNombre: string; politicoSlug: string })[]
> {
  const supabase = await createClient()
  const { data: politicos } = await supabase
    .from('politicos')
    .select('id, nombre, slug')
    .eq('activo', true)
    .order('nombre')
  if (!politicos) return []

  const results = await Promise.all(
    politicos.map(async (p) => {
      const { data } = await supabase
        .from('encuestas')
        .select('*')
        .eq('politico_id', p.id)
        .order('fecha', { ascending: false })
        .limit(1)
        .single()
      if (!data) return null
      return {
        ...mapEncuestaRow(data),
        politicoNombre: p.nombre,
        politicoSlug: p.slug,
      }
    })
  )
  return results.filter(Boolean) as (Encuesta & {
    politicoNombre: string
    politicoSlug: string
  })[]
}

export async function crearEncuesta(
  encuesta: Omit<Encuesta, 'id' | 'createdAt'>
): Promise<Encuesta | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('encuestas')
    .insert({
      politico_id: encuesta.politicoId,
      fecha: encuesta.fecha,
      intencion_voto: encuesta.intencionVoto,
      imagen_positiva: encuesta.imagenPositiva,
      imagen_negativa: encuesta.imagenNegativa,
      conocimiento: encuesta.conocimiento,
      fuente: encuesta.fuente,
      metodologia: encuesta.metodologia,
      universo: encuesta.universo,
      margen_error: encuesta.margenError,
      notas: encuesta.notas,
    })
    .select()
    .single()
  if (error || !data) return null
  return mapEncuestaRow(data)
}

export async function eliminarEncuesta(id: number): Promise<void> {
  const supabase = await createClient()
  await supabase.from('encuestas').delete().eq('id', id)
}
