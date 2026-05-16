import { createClient } from './server'

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

export async function getUltimoClipping(): Promise<Clipping | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clippings')
    .select('*')
    .order('generado_at', { ascending: false })
    .limit(1)
    .single()
  return data ? mapRow(data) : null
}

export async function getHistorialClippings(limit = 7): Promise<Clipping[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clippings')
    .select('id, contenido, modelo, tokens_usados, generado_at')
    .order('generado_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map(mapRow)
}

export async function guardarClipping(
  contenido: string,
  modelo: string,
  tokensUsados?: number
): Promise<Clipping | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clippings')
    .insert({ contenido, modelo, tokens_usados: tokensUsados ?? null })
    .select()
    .single()
  return data ? mapRow(data) : null
}
