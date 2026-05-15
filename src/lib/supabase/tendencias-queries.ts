import { createClient } from './server'

export interface TendenciaDB {
  id: number
  politicoId: number
  plataforma: string
  valor: number
  total: number
  calculadoAt: string
}

export async function guardarTendencia(
  politicoId: number,
  plataforma: string,
  valor: number,
  total: number
): Promise<void> {
  const supabase = await createClient()
  await supabase.from('tendencias').insert({
    politico_id: politicoId,
    plataforma,
    valor,
    total,
  })
}

export async function getUltimaTendencia(
  politicoId: number,
  plataforma: string
): Promise<TendenciaDB | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tendencias')
    .select('*')
    .eq('politico_id', politicoId)
    .eq('plataforma', plataforma)
    .order('calculado_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return null
  return {
    id: data.id,
    politicoId: data.politico_id,
    plataforma: data.plataforma,
    valor: Number(data.valor),
    total: data.total,
    calculadoAt: data.calculado_at,
  }
}

export async function getAllTendencias(politicoId: number): Promise<TendenciaDB[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tendencias')
    .select('*')
    .eq('politico_id', politicoId)
    .order('calculado_at', { ascending: false })
    .limit(10)

  return (data ?? []).map(row => ({
    id: row.id,
    politicoId: row.politico_id,
    plataforma: row.plataforma,
    valor: Number(row.valor),
    total: row.total,
    calculadoAt: row.calculado_at,
  }))
}

