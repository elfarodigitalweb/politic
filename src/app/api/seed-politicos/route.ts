import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Políticos nacionales a insertar
const POLITICOS_NACIONALES = [
  {
    nombre: 'Javier Milei',
    slug: 'javier-milei',
    cargo: 'presidente',
    provincia_slug: 'nacional',
    partido_nombre: 'La Libertad Avanza',
    partido_color: '#9B30FF',
    palabras_clave: ['Javier Milei', 'Milei', 'presidente Argentina', 'La Libertad Avanza', 'LLA', 'presidente Milei'],
    foto_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Javier_Milei_2023_%28cropped%29.jpg/800px-Javier_Milei_2023_%28cropped%29.jpg',
    facebook_page_id: null,
    en_testeo: false,
    activo: true,
  },
]

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.ANALIZAR_SECRET ?? process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const resultados: Array<{ nombre: string; accion: string; id?: number; error?: string }> = []

  for (const politico of POLITICOS_NACIONALES) {
    // Verificar si ya existe
    const { data: existente } = await supabase
      .from('politicos')
      .select('id, nombre')
      .eq('slug', politico.slug)
      .single()

    if (existente) {
      resultados.push({ nombre: politico.nombre, accion: 'ya_existe', id: existente.id })
      continue
    }

    const { data: insertado, error } = await supabase
      .from('politicos')
      .insert(politico)
      .select('id, nombre')
      .single()

    if (error) {
      resultados.push({ nombre: politico.nombre, accion: 'error', error: error.message })
    } else {
      resultados.push({ nombre: politico.nombre, accion: 'insertado', id: insertado?.id })
    }
  }

  return NextResponse.json({ ok: true, resultados })
}
