import { NextRequest, NextResponse } from 'next/server'
import { ejecutarAnalisisCompleto } from '@/lib/sentiment/analyzer'

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: '/api/analizar' })
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = process.env.ANALIZAR_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resultado = await ejecutarAnalisisCompleto()
  return NextResponse.json(resultado)
}
