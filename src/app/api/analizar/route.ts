import { NextRequest, NextResponse } from 'next/server'
import { ejecutarAnalisisCompleto } from '@/lib/sentiment/analyzer'

export async function GET(req: NextRequest) {
  // Vercel Cron llama con GET + header x-vercel-cron: 1
  if (req.headers.get('x-vercel-cron') === '1') {
    return POST(req)
  }
  return NextResponse.json({ status: 'ok', endpoint: '/api/analizar' })
}

export async function POST(req: NextRequest) {
  const isCron = req.headers.get('x-vercel-cron') === '1'
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.ANALIZAR_SECRET
    ?? process.env.NEXT_PUBLIC_ANALIZAR_SECRET
    ?? 'portal-politico-secret-2026'

  if (!isCron && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resultado = await ejecutarAnalisisCompleto()
  return NextResponse.json({
    ...resultado,
    resumen: resultado.detalle
      .filter(d => d.menciones > 0)
      .map(d => `${d.nombre}: ${d.menciones}`)
      .join(' | '),
  })
}
