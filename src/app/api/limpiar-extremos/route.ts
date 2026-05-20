import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Elimina del historial todos los valores extremos (≥95% o ≤5%) que son
// basura producida por el analyzer de keywords con pocas menciones.

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // 1. Eliminar filas con valores extremos en imagen_historico
  const { data: borradas, error: errImg } = await supabase
    .from('imagen_historico')
    .delete()
    .or('imagen_positiva.gte.95,imagen_positiva.lte.5,imagen_negativa.gte.95,imagen_negativa.lte.5')
    .select('id')

  if (errImg) {
    return NextResponse.json({ error: `imagen_historico: ${errImg.message}` }, { status: 500 })
  }

  // 2. Limpiar también filas con muy pocas menciones (1 o 2) — basura del analyzer
  const { data: borradasMenciones } = await supabase
    .from('imagen_historico')
    .delete()
    .gt('total_menciones', 0)
    .lt('total_menciones', 3)
    .select('id')

  // 3. Buscar políticos que se quedaron sin imagen tras la limpieza
  const { data: politicos } = await supabase
    .from('politicos')
    .select('id, nombre')
    .eq('activo', true)

  const { data: imagenesRestantes } = await supabase
    .from('imagen_historico')
    .select('politico_id')

  const idsConImagen = new Set((imagenesRestantes ?? []).map(i => i.politico_id))
  const sinImagen = (politicos ?? []).filter(p => !idsConImagen.has(p.id))

  return NextResponse.json({
    ok: true,
    borradasExtremos: borradas?.length ?? 0,
    borradasPocasMenciones: borradasMenciones?.length ?? 0,
    politicosSinImagen: sinImagen.map(p => ({ id: p.id, nombre: p.nombre })),
    cantSinImagen: sinImagen.length,
  })
}

export async function GET() {
  return NextResponse.json({ status: 'limpiar-extremos activo. POST para ejecutar.' })
}
