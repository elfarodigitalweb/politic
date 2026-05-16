import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { guardarClipping } from '@/lib/supabase/clippings-queries'

function esVercelCron(req: NextRequest): boolean {
  return req.headers.get('x-vercel-cron') === '1'
}

function esAutorizado(req: NextRequest): boolean {
  if (esVercelCron(req)) return true
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.ANALIZAR_SECRET
    ?? process.env.NEXT_PUBLIC_ANALIZAR_SECRET
    ?? 'portal-politico-secret-2026'
  return auth === `Bearer ${secret}`
}

async function recolectarContexto() {
  const supabase = createServiceClient()
  const hace14dias = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: alertas }, { data: politicos }, { data: menciones }] = await Promise.all([
    supabase
      .from('problematicas_sc')
      .select('localidad_nombre, categoria, titulo, severidad, publicado_at, fuente_nombre')
      .gte('publicado_at', hace14dias)
      .order('severidad', { ascending: false })
      .limit(30),
    supabase
      .from('politicos')
      .select('nombre, cargo, palabras_clave')
      .eq('activo', true)
      .order('nombre'),
    supabase
      .from('menciones')
      .select('titulo, sentimiento, fuente, publicado_at')
      .gte('publicado_at', hace14dias)
      .eq('sentimiento', 'negativo')
      .order('publicado_at', { ascending: false })
      .limit(20),
  ])

  // Obtener última imagen de cada político
  const imagenes: Record<string, { pos: number; neg: number }> = {}
  if (politicos) {
    const { data: politicosConId } = await supabase
      .from('politicos')
      .select('id, nombre, cargo')
      .eq('activo', true)

    if (politicosConId) {
      const { data: imgs } = await supabase
        .from('imagen_historico')
        .select('politico_id, imagen_positiva, imagen_negativa, calculado_at')
        .in('politico_id', politicosConId.map(p => p.id))
        .order('calculado_at', { ascending: false })

      const seen = new Set<number>()
      for (const img of imgs ?? []) {
        if (!seen.has(img.politico_id)) {
          seen.add(img.politico_id)
          const pol = politicosConId.find(p => p.id === img.politico_id)
          if (pol) imagenes[pol.nombre] = { pos: img.imagen_positiva, neg: img.imagen_negativa }
        }
      }
    }
  }

  return { alertas: alertas ?? [], imagenes, menciones: menciones ?? [] }
}

function construirPrompt(ctx: Awaited<ReturnType<typeof recolectarContexto>>): string {
  const fecha = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const alertasTexto = ctx.alertas
    .map(a => `[${a.severidad === 3 ? 'CRISIS' : a.severidad === 2 ? 'PROBLEMA' : 'INFO'}] ${a.localidad_nombre} — ${a.categoria.toUpperCase()}: ${a.titulo} (${a.fuente_nombre})`)
    .join('\n')

  const imagenTexto = Object.entries(ctx.imagenes)
    .map(([nombre, { pos, neg }]) => `${nombre}: ${pos.toFixed(1)}% positiva / ${neg.toFixed(1)}% negativa`)
    .join('\n')

  const negativasTexto = ctx.menciones
    .slice(0, 10)
    .map(m => `• ${m.titulo} (${m.fuente})`)
    .join('\n')

  return `Sos un analista político senior de Santa Cruz, Argentina, trabajando para una consultora política.
Redactá un CLIPPING POLÍTICO PROFESIONAL para la fecha ${fecha}.

Usá este tono: directo, analítico, sin adornos, pensado para que el cliente tome decisiones de campaña.

---
DATOS DE ALERTAS Y NOTICIAS RECIENTES:
${alertasTexto || 'Sin alertas registradas en el sistema.'}

---
IMAGEN POLÍTICA ACTUAL (% positiva / negativa):
${imagenTexto || 'Sin datos de imagen disponibles.'}

---
NOTICIAS NEGATIVAS DESTACADAS EN MEDIOS:
${negativasTexto || 'Sin menciones negativas recientes.'}
---

Redactá el clipping con exactamente estas secciones y este formato Markdown:

# 📋 CLIPPING POLÍTICO — Santa Cruz
## ${fecha}

---

### 🏛️ SITUACIÓN PROVINCIAL
[1 párrafo: cómo está el gobierno provincial, Vidal, clima político general]

### 🚨 ALERTAS CRÍTICAS
[1-2 párrafos: los conflictos más graves de la semana, priorizá severidad 3 y 2]

### 📊 IMAGEN POLÍTICA — RANKING
[1 párrafo: quién sube, quién baja, datos concretos de %. Mencioná los 3 más altos y los 3 más bajos]

### 🏙️ MUNICIPIOS EN FOCO
[1 párrafo: las 2-3 localidades más complicadas esta semana y por qué]

### 🎯 PARA TENER EN CUENTA
[Lista de 4-5 bullet points concretos: alertas tempranas, riesgos, oportunidades para el cliente]

---
*Generado automáticamente · Portal Político Santa Cruz · Datos verificados en medios locales*

Sé preciso, usá los datos que te di. Si alguna sección no tiene datos suficientes, indicalo brevemente en lugar de inventar.`
}

export async function GET(req: NextRequest) {
  if (!esVercelCron(req)) {
    return NextResponse.json({ status: 'generar-clipping endpoint activo. Usar POST para generar.' })
  }
  return POST(req)
}

export async function POST(req: NextRequest) {
  if (!esAutorizado(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY no configurada. Agregala en Variables de Entorno de Vercel.' },
      { status: 500 }
    )
  }

  try {
    const ctx = await recolectarContexto()
    const prompt = construirPrompt(ctx)

    const anthropic = new Anthropic({ apiKey })
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const contenido = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    const tokensUsados = response.usage.input_tokens + response.usage.output_tokens

    const clipping = await guardarClipping(contenido, 'claude-sonnet-4-6', tokensUsados)

    return NextResponse.json({
      ok: true,
      id: clipping?.id,
      tokensUsados,
      preview: contenido.slice(0, 200) + '...',
    })
  } catch (e) {
    console.error('[generar-clipping]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
