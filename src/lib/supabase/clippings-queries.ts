import { createServiceClient } from './service'

export interface Clipping {
  id: number
  contenido: string
  modelo: string
  tokensUsados: number | null
  generadoAt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Clipping {
  return {
    id: row.id,
    contenido: row.contenido,
    modelo: row.modelo,
    tokensUsados: row.tokens_usados ?? null,
    generadoAt: row.generado_at,
  }
}

// Usamos service client → bypassa RLS, evita problemas de policies/sesión
export async function getUltimoClipping(): Promise<Clipping | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('clippings')
    .select('*')
    .order('generado_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error && error.code !== 'PGRST116') {
    console.error('[getUltimoClipping]', error.code, error.message)
  }
  return data ? mapRow(data) : null
}

export async function getHistorialClippings(limit = 7): Promise<Clipping[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('clippings')
    .select('id, contenido, modelo, tokens_usados, generado_at')
    .order('generado_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.error('[getHistorialClippings]', error.code, error.message)
    return []
  }
  return (data ?? []).map(mapRow)
}

export async function guardarClipping(
  contenido: string,
  modelo: string,
  tokensUsados?: number
): Promise<{ clipping: Clipping | null; error: string | null }> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('clippings')
    .insert({ contenido, modelo, tokens_usados: tokensUsados ?? null })
    .select()
    .single()

  if (error) {
    // 42P01 = relation does not exist · PGRST205 = table not in schema cache
    // PGRST204 = no row found · 42501 = insufficient privilege (RLS bloquea)
    const tablaNoExiste = error.code === '42P01' || error.code === 'PGRST205'
    if (tablaNoExiste) {
      return {
        clipping: null,
        error: 'La tabla "clippings" no existe en Supabase. Ejecutá el SQL que se muestra abajo en el SQL Editor.',
      }
    }
    return { clipping: null, error: `${error.code}: ${error.message}` }
  }
  return { clipping: data ? mapRow(data) : null, error: null }
}
