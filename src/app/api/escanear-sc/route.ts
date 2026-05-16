import { NextRequest, NextResponse } from 'next/server'
import { escanearProblematicas } from '@/lib/sources/problematicas-sc'
import { guardarProblematicas } from '@/lib/supabase/problematicas-queries'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-vercel-cron') === '1') {
    return POST(req)
  }
  return NextResponse.json({ status: 'ok', endpoint: '/api/escanear-sc' })
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  // Acepta ANALIZAR_SECRET (server) o NEXT_PUBLIC_ANALIZAR_SECRET (client), o el valor por defecto
  const secret = process.env.ANALIZAR_SECRET
    ?? process.env.NEXT_PUBLIC_ANALIZAR_SECRET
    ?? 'portal-politico-secret-2026'

  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const problemas = await escanearProblematicas()

    let guardados = 0
    let errorGuardado = ''
    try {
      guardados = await guardarProblematicas(problemas)
    } catch (e) {
      errorGuardado = String(e)
    }

    const porLocalidad = problemas.reduce<Record<string, number>>((acc, p) => {
      acc[p.localidadNombre] = (acc[p.localidadNombre] ?? 0) + 1
      return acc
    }, {})

    const porCategoria = problemas.reduce<Record<string, number>>((acc, p) => {
      acc[p.categoria] = (acc[p.categoria] ?? 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      detectados: problemas.length,
      guardados,
      porLocalidad,
      porCategoria,
      errorGuardado: errorGuardado || undefined,
      nota: errorGuardado
        ? 'Falta ejecutar la migración 008_problematicas_sc.sql en Supabase'
        : undefined,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
