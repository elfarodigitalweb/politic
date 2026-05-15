import { createClient } from './server'
import type { AvisoPolitico } from '@/lib/sources/adlibrary'

export interface AvisoDB extends AvisoPolitico {
  id: number
  politicoId: number
  analizadoAt: string
}

export async function guardarAvisos(
  politicoId: number,
  avisos: AvisoPolitico[]
): Promise<void> {
  if (avisos.length === 0) return
  const supabase = await createClient()

  // Evitar duplicados por aviso_id
  await supabase.from('avisos_politicos').upsert(
    avisos.map(a => ({
      politico_id: politicoId,
      plataforma: a.plataforma,
      aviso_id: a.avisoId,
      texto: a.texto,
      nombre_pagina: a.nombrePagina,
      gasto_min: a.gastoMin,
      gasto_max: a.gastoMax,
      impresiones_min: a.impresionesMin,
      impresiones_max: a.impresionesMax,
      fecha_inicio: a.fechaInicio,
      fecha_fin: a.fechaFin,
      url_preview: a.urlPreview,
    })),
    { onConflict: 'politico_id,aviso_id' }
  )
}

export async function getAvisosByPolitico(politicoId: number): Promise<AvisoDB[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('avisos_politicos')
    .select('*')
    .eq('politico_id', politicoId)
    .order('fecha_inicio', { ascending: false })
    .limit(20)

  return (data ?? []).map(row => ({
    id: row.id,
    politicoId: row.politico_id,
    avisoId: row.aviso_id,
    texto: row.texto,
    nombrePagina: row.nombre_pagina,
    gastoMin: row.gasto_min,
    gastoMax: row.gasto_max,
    impresionesMin: row.impresiones_min,
    impresionesMax: row.impresiones_max,
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    urlPreview: row.url_preview,
    plataforma: row.plataforma,
    analizadoAt: row.analizado_at,
  }))
}

export async function getGastoTotalPolitico(
  politicoId: number
): Promise<{ min: number; max: number; totalAvisos: number }> {
  const avisos = await getAvisosByPolitico(politicoId)
  const activos = avisos.filter(a => a.gastoMin !== null)
  return {
    min: activos.reduce((sum, a) => sum + (a.gastoMin ?? 0), 0),
    max: activos.reduce((sum, a) => sum + (a.gastoMax ?? 0), 0),
    totalAvisos: avisos.length,
  }
}
