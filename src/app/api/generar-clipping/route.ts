import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { guardarClipping } from '@/lib/supabase/clippings-queries'

// =========================================================
// PROVEEDORES DE IA — orden de preferencia:
// 1. Google Gemini (gratis, 1500 req/día)  → GEMINI_API_KEY
// 2. Groq Llama 3.3 70B (gratis)           → GROQ_API_KEY
// 3. Anthropic Claude (pago)               → ANTHROPIC_API_KEY
// =========================================================

let modelosGeminiCache: { lista: string[]; expira: number } | null = null

async function listarModelosGemini(apiKey: string): Promise<string[]> {
  if (modelosGeminiCache && modelosGeminiCache.expira > Date.now()) return modelosGeminiCache.lista
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=200`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Gemini ListModels ${res.status}`)
  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lista = (data.models ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((m: any) => String(m.name).replace(/^models\//, ''))
    .filter((n: string) =>
      !n.includes('embedding') && !n.includes('aqa') &&
      !n.includes('image') && !n.includes('tts') &&
      !n.includes('audio') && !n.includes('vision') &&
      !n.includes('native') && !n.includes('thinking')
    )
    .sort((a: string, b: string) => {
      const sa = (a.includes('flash') ? 100 : 0) + (a.includes('2.5') ? 50 : a.includes('2.0') ? 30 : 10) - (a.includes('exp') ? 20 : 0)
      const sb = (b.includes('flash') ? 100 : 0) + (b.includes('2.5') ? 50 : b.includes('2.0') ? 30 : 10) - (b.includes('exp') ? 20 : 0)
      return sb - sa
    })
  modelosGeminiCache = { lista, expira: Date.now() + 10 * 60 * 1000 }
  return lista
}

async function generarConGemini(prompt: string, apiKey: string) {
  const modelos = await listarModelosGemini(apiKey)
  if (modelos.length === 0) throw new Error('API key sin acceso a modelos Gemini')

  let ultimoError = ''
  for (const modelo of modelos.slice(0, 4)) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
      }),
    })
    if (!res.ok) {
      const esQuota = res.status === 429
      ultimoError = `${modelo} ${res.status}`
      if (esQuota) {
        throw new Error(`Cuota Gemini agotada (429). Último modelo: ${modelo}`)
      }
      continue
    }
    const data = await res.json()
    const contenido = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const tokens = (data.usageMetadata?.promptTokenCount ?? 0) + (data.usageMetadata?.candidatesTokenCount ?? 0)
    if (contenido) {
      console.log(`[Gemini clipping] OK con ${modelo}`)
      return { contenido, tokens, modelo }
    }
  }
  throw new Error(`Gemini falló en todos los modelos. Último: ${ultimoError}`)
}

async function generarConGroq(prompt: string, apiKey: string) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  })
  if (!res.ok) throw new Error(`Groq API error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const contenido = data.choices?.[0]?.message?.content ?? ''
  const tokens = data.usage?.total_tokens ?? 0
  return { contenido, tokens, modelo: 'llama-3.3-70b' }
}

async function generarConAnthropic(prompt: string, apiKey: string) {
  const anthropic = new Anthropic({ apiKey })
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })
  const contenido = response.content[0].type === 'text' ? response.content[0].text : ''
  const tokens = response.usage.input_tokens + response.usage.output_tokens
  return { contenido, tokens, modelo: 'claude-sonnet-4-6' }
}

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

type TipoClipping = 'matutino' | 'tarde' | 'nocturno' | 'general'

function detectarTipo(req: NextRequest): TipoClipping {
  const url = new URL(req.url)
  const tipoParam = url.searchParams.get('tipo')
  if (tipoParam === 'matutino' || tipoParam === 'tarde' || tipoParam === 'nocturno') return tipoParam
  // Auto-detectar por hora si no se especifica (zona Argentina UTC-3)
  const horaArg = (new Date().getUTCHours() - 3 + 24) % 24
  if (horaArg >= 5 && horaArg < 12) return 'matutino'
  if (horaArg >= 12 && horaArg < 19) return 'tarde'
  return 'nocturno'
}

function instruccionPorTipo(tipo: TipoClipping): string {
  switch (tipo) {
    case 'matutino':
      return `Es un CLIPPING MATUTINO. Foco: resumen de la noche + agenda política del día.
        Tono: anticipatorio, "qué esperar hoy". Identificá ALERTAS TEMPRANAS de conflictos
        que pueden estallar en las próximas horas (paros, manifestaciones, comunicados pendientes).`
    case 'tarde':
      return `Es un CLIPPING DEL MEDIODÍA / TARDE. Foco: qué pasó en la mañana, conflictos activos
        en este momento, declaraciones y movimientos políticos del día.
        Tono: actualizado, dinámico. Marcá qué evoluciona y qué se está enfriando.`
    case 'nocturno':
      return `Es un CLIPPING NOCTURNO / CIERRE DE DÍA. Foco: balance del día + proyección a mañana.
        Tono: analítico, retrospectivo. Cerrá identificando qué se viene mañana
        y qué actores tienen pendiente declarar o moverse.`
    default:
      return ''
  }
}

function construirPrompt(ctx: Awaited<ReturnType<typeof recolectarContexto>>, tipo: TipoClipping = 'general'): string {
  const fecha = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })
  const tipoLabel = tipo === 'matutino' ? '☀️ MATUTINO' : tipo === 'tarde' ? '🌤️ MEDIODÍA' : tipo === 'nocturno' ? '🌙 NOCTURNO' : ''
  const instruccionTipo = instruccionPorTipo(tipo)

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
Redactá un CLIPPING POLÍTICO PROFESIONAL ${tipoLabel} para ${fecha} a las ${hora} (hora Argentina).

${instruccionTipo}

Usá este tono: directo, analítico, sin adornos, pensado para que el cliente tome decisiones de campaña
y SE ADELANTE a conflictos antes de que escalen públicamente.

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

# 📋 CLIPPING ${tipoLabel} — Santa Cruz
## ${fecha} · ${hora}

---

### 🏛️ SITUACIÓN PROVINCIAL
[1 párrafo: cómo está el gobierno provincial, Vidal, clima político general en este momento del día]

### 🚨 ALERTAS POR LOCALIDAD
[Listá cada localidad de SC con conflictos activos. Para cada una, una línea con la alerta principal.
Priorizá las 16 localidades: Río Gallegos, Caleta Olivia, Las Heras, Pico Truncado, El Calafate,
Puerto Deseado, Puerto San Julián, Gobernador Gregores, Perito Moreno, Los Antiguos, El Chaltén,
Piedra Buena, Puerto Santa Cruz, 28 de Noviembre, Tres Lagos, Río Turbio.
Si una localidad no tiene alerta, omitirla. Si tiene varias, la más grave primero.]

### ⚠️ QUÉ ANTICIPAR
[2-3 párrafos: qué conflictos pueden escalar en las próximas horas/días.
Identificá ALERTAS TEMPRANAS antes de que estallen públicamente.
Movimientos sindicales que se están armando, declaraciones pendientes, fechas críticas.]

### 📊 IMAGEN POLÍTICA — RANKING
[1 párrafo: quién sube, quién baja. Mencioná los 3 con mejor imagen y los 3 con peor]

### 🎯 RECOMENDACIONES OPERATIVAS
[Lista de 4-5 bullet points concretos: qué hacer hoy, a quién monitorear más de cerca,
qué declaraciones públicas conviene/no conviene hacer]

---
*Generado automáticamente · Rumbo Estratégico · ${tipoLabel}*

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

  const geminiKey = process.env.GEMINI_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!geminiKey && !groqKey && !anthropicKey) {
    return NextResponse.json(
      {
        error: 'Ninguna API key configurada. Agregá una de estas a .env (local) o Vercel Settings:\n' +
          '  · GEMINI_API_KEY (gratis, recomendado) → https://aistudio.google.com/apikey\n' +
          '  · GROQ_API_KEY (gratis) → https://console.groq.com/keys\n' +
          '  · ANTHROPIC_API_KEY (pago) → https://console.anthropic.com/settings/keys',
      },
      { status: 500 }
    )
  }

  const tipo = detectarTipo(req)

  try {
    const ctx = await recolectarContexto()
    const prompt = construirPrompt(ctx, tipo)

    // Preferir Gemini (gratis y mejor calidad) → Groq (gratis) → Anthropic (pago)
    // Con fallback automático si Gemini tiene cuota agotada
    let resultado
    if (geminiKey) {
      try {
        resultado = await generarConGemini(prompt, geminiKey)
      } catch (geminiErr) {
        const esQuota = String(geminiErr).includes('429') || String(geminiErr).includes('quota') || String(geminiErr).includes('Cuota')
        if (groqKey && esQuota) {
          console.warn('[generar-clipping] Gemini cuota agotada, usando Groq como fallback')
          resultado = await generarConGroq(prompt, groqKey)
        } else if (anthropicKey && esQuota) {
          console.warn('[generar-clipping] Gemini cuota agotada, usando Anthropic como fallback')
          resultado = await generarConAnthropic(prompt, anthropicKey)
        } else {
          throw geminiErr
        }
      }
    } else if (groqKey) {
      resultado = await generarConGroq(prompt, groqKey)
    } else {
      resultado = await generarConAnthropic(prompt, anthropicKey!)
    }

    const { contenido, tokens, modelo } = resultado
    const { clipping, error: saveError } = await guardarClipping(contenido, modelo, tokens)

    if (saveError) {
      return NextResponse.json({ error: saveError }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      id: clipping?.id,
      modelo,
      tipo,
      tokensUsados: tokens,
      preview: contenido.slice(0, 200) + '...',
    })
  } catch (e) {
    console.error('[generar-clipping]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
