import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchNewsForKeywords } from '@/lib/sources/googleNews'
import { fetchGoogleTrends } from '@/lib/sources/trends'
import { fetchFacebookPosts } from '@/lib/sources/facebook'

// =========================================================
// Análisis de imagen política con IA (Gemini / Groq / Claude)
// Recolecta datos reales (Google News, Trends, Facebook, DB menciones)
// y los pasa a la IA para un análisis contextualizado y diferenciado.
// =========================================================

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

// Genera keywords automáticamente desde el nombre y cargo
function autoKeywords(nombre: string, cargo: string, provincia: string | null): string[] {
  const partes = nombre.split(' ').filter(p => p.length > 2)
  const apellido = partes[partes.length - 1]
  const kws = new Set<string>([nombre, apellido])
  if (provincia) {
    kws.add(`${nombre} ${provincia.replace(/-/g, ' ')}`)
    kws.add(`${apellido} ${provincia.replace(/-/g, ' ')}`)
  }
  if (cargo) kws.add(`${cargo} ${apellido}`)
  return [...kws]
}

// =========================================================
// RECOLECCIÓN DE DATOS REALES
// =========================================================

interface DatosReales {
  noticias: Array<{ titulo: string; fuente: string; fecha: string }>
  mencionesDB: { positivas: number; negativas: number; neutras: number; total: number }
  trends: { interes: number; tendencia: string } | null
  facebook: { positivasPct: number; negativasPct: number; totalPosts: number } | null
  resumenTexto: string
}

async function recolectarDatosReales(
  politico: {
    id: number
    nombre: string
    cargo: string
    palabras_clave: string[] | null
    facebook_page_id: string | null
  }
): Promise<DatosReales> {
  const keywords = politico.palabras_clave?.length
    ? politico.palabras_clave
    : [politico.nombre, `${politico.nombre} ${politico.cargo}`]

  const supabase = createServiceClient()
  const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Ejecutar todas las fuentes en paralelo para no tardar más de lo necesario
  const [noticiasRaw, mencionesDB, trendsData, fbPosts] = await Promise.allSettled([
    // 1. Google News RSS (gratis, sin key)
    fetchNewsForKeywords(keywords),
    // 2. Menciones ya guardadas en la BD por el cron /api/analizar
    supabase
      .from('menciones')
      .select('sentimiento')
      .eq('politico_id', politico.id)
      .gte('publicado_at', hace30dias),
    // 3. Google Trends (gratis, sin key) — con timeout de 8s
    Promise.race([
      fetchGoogleTrends(politico.nombre, keywords),
      new Promise<null>(r => setTimeout(() => r(null), 8000)),
    ]),
    // 4. Facebook si tiene page configurada
    politico.facebook_page_id
      ? fetchFacebookPosts(politico.facebook_page_id)
      : Promise.resolve([]),
  ])

  // Procesar noticias Google News
  const noticias = noticiasRaw.status === 'fulfilled'
    ? noticiasRaw.value.slice(0, 10).map(n => ({
        titulo: n.titulo,
        fuente: n.fuente ?? 'google_news',
        fecha: n.publicadoAt ? new Date(n.publicadoAt).toLocaleDateString('es-AR') : '',
      }))
    : []

  // Procesar menciones de la BD
  const menciones = mencionesDB.status === 'fulfilled' && mencionesDB.value.data
    ? mencionesDB.value.data
    : []
  const mencionesConteo = {
    positivas: menciones.filter((m: { sentimiento: string }) => m.sentimiento === 'positivo').length,
    negativas: menciones.filter((m: { sentimiento: string }) => m.sentimiento === 'negativo').length,
    neutras: menciones.filter((m: { sentimiento: string }) => m.sentimiento === 'neutral').length,
    total: menciones.length,
  }

  // Google Trends
  const trends = trendsData.status === 'fulfilled' && trendsData.value
    ? { interes: trendsData.value.interesActual, tendencia: trendsData.value.tendencia }
    : null

  // Facebook
  let facebookResumen = null
  if (fbPosts.status === 'fulfilled' && fbPosts.value.length > 0) {
    const posts = fbPosts.value
    const pos = posts.filter(p => p.sentimientoFinal.sentimiento === 'positivo').length
    const neg = posts.filter(p => p.sentimientoFinal.sentimiento === 'negativo').length
    facebookResumen = {
      positivasPct: Math.round((pos / posts.length) * 100),
      negativasPct: Math.round((neg / posts.length) * 100),
      totalPosts: posts.length,
    }
  }

  // Construir resumen en texto para el prompt
  const partes: string[] = []

  if (noticias.length > 0) {
    partes.push(`NOTICIAS RECIENTES EN MEDIOS (últimos 7 días):\n` +
      noticias.map(n => `• [${n.fecha}] ${n.titulo} — ${n.fuente}`).join('\n'))
  } else {
    partes.push('NOTICIAS RECIENTES: Sin cobertura mediática detectada en los últimos 7 días.')
  }

  if (mencionesConteo.total > 0) {
    const pctPos = Math.round((mencionesConteo.positivas / mencionesConteo.total) * 100)
    const pctNeg = Math.round((mencionesConteo.negativas / mencionesConteo.total) * 100)
    partes.push(`MENCIONES EN MEDIOS LOCALES (últimos 30 días, ${mencionesConteo.total} menciones):\n` +
      `• Positivas: ${mencionesConteo.positivas} (${pctPos}%)\n` +
      `• Negativas: ${mencionesConteo.negativas} (${pctNeg}%)\n` +
      `• Neutras: ${mencionesConteo.neutras}`)
  } else {
    partes.push('MENCIONES EN MEDIOS LOCALES: Sin datos en el período reciente.')
  }

  if (trends) {
    partes.push(`GOOGLE TRENDS (interés de búsqueda, escala 0-100):\n` +
      `• Interés actual en Argentina: ${trends.interes}/100\n` +
      `• Tendencia: ${trends.tendencia}`)
  }

  if (facebookResumen) {
    partes.push(`FACEBOOK (${facebookResumen.totalPosts} posts recientes):\n` +
      `• Reacciones positivas: ${facebookResumen.positivasPct}%\n` +
      `• Reacciones negativas: ${facebookResumen.negativasPct}%`)
  }

  return {
    noticias,
    mencionesDB: mencionesConteo,
    trends,
    facebook: facebookResumen,
    resumenTexto: partes.join('\n\n'),
  }
}

// Clasificaciones para calibrar el rango de valores según perfil
function nivelExposicion(cargo: string): 'nacional' | 'provincial' | 'local' {
  const c = cargo.toLowerCase()
  if (c.includes('presidente') || c.includes('senador nacional') || c.includes('diputado nacional') || c.includes('ministro')) return 'nacional'
  if (c.includes('gobernador') || c.includes('vicegobernador') || c.includes('legislador') || c.includes('ministro provincial') || c.includes('secretario')) return 'provincial'
  return 'local'
}

function localidadSantaCruz(provincia: string | null): string {
  if (!provincia) return ''
  const mapa: Record<string, string> = {
    'santa-cruz': 'provincia de Santa Cruz (capital Río Gallegos)',
    'rio-gallegos': 'Río Gallegos, capital de Santa Cruz (100k hab.)',
    'caleta-olivia': 'Caleta Olivia, ciudad industrial y petrolera de Santa Cruz (60k hab.)',
    'las-heras': 'Las Heras, ciudad petrolera en el interior de Santa Cruz (12k hab.)',
    'pico-truncado': 'Pico Truncado, ciudad con base en petróleo y gas (15k hab.)',
    'el-calafate': 'El Calafate, ciudad turística patagónica de Santa Cruz (25k hab.)',
    'puerto-deseado': 'Puerto Deseado, ciudad costera pesquera de Santa Cruz (15k hab.)',
    'puerto-san-julian': 'Puerto San Julián, ciudad histórica y portuaria de Santa Cruz (10k hab.)',
    'gobernador-gregores': 'Gobernador Gregores, pequeño pueblo ganadero del interior de Santa Cruz (3k hab.)',
    'perito-moreno': 'Perito Moreno (Los Antiguos / 16 de Octubre), Santa Cruz (7k hab.)',
    'los-antiguos': 'Los Antiguos, ciudad de la cerezas en la frontera con Chile, Santa Cruz (3k hab.)',
    'el-chalten': 'El Chaltén, pueblo de montaña y turismo aventura, Santa Cruz (2k hab.)',
    'piedra-buena': 'Piedra Buena, ciudad costera sobre el Río Santa Cruz (7k hab.)',
    'puerto-santa-cruz': 'Puerto Santa Cruz, ciudad histórica y portuaria (3k hab.)',
    '28-de-noviembre': '28 de Noviembre / Río Turbio, zona carbonífera de Santa Cruz (15k hab.)',
    'rio-turbio': 'Río Turbio, ciudad minera del carbón, frontera con Chile, Santa Cruz (10k hab.)',
    'tres-lagos': 'Tres Lagos, pequeño pueblo ganadero de Santa Cruz (800 hab.)',
  }
  return mapa[provincia] ?? `${provincia.replace(/-/g, ' ')}`
}

function construirPrompt(politico: {
  nombre: string
  cargo: string
  provincia: string | null
  partidoNombre: string | null
  localidad?: string | null
  coalicion?: string | null
  descripcion?: string | null
}, datosReales?: DatosReales) {
  const hoy = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const nivel = nivelExposicion(politico.cargo)
  // Priorizar localidad explícita, luego mapear por provincia_slug
  const localidad = politico.localidad ?? localidadSantaCruz(politico.provincia)

  // Rangos diferenciados según nivel: nacionales tienen más variación, locales más moderados
  const rangoPos = nivel === 'nacional' ? '20-80' : nivel === 'provincial' ? '22-78' : '30-70'
  const rangoNeg = nivel === 'nacional' ? '15-75' : nivel === 'provincial' ? '18-72' : '25-65'

  // Token único por político + tiempo: rompe el caché semántico de Gemini
  const tokenUnico = `[REQ-${politico.nombre.replace(/\s/g, '_').toUpperCase()}-${Date.now()}]`

  return `${tokenUnico} Sos un analista político argentino con especialización en política patagónica y santacruceña (${hoy} ${hora}).

CONTEXTO ACTUAL DE SANTA CRUZ (2025-2026):
- Gobernadora Claudio Vidal (de extracción sindical/petrolera, Se Viene Santa Cruz) — alianza táctica con Milei
- Tensión permanente con gremios docentes (ADOSAC) y estatales (ATE/UPCN)
- Impacto del ajuste nacional Milei en la provincia: recorte de obra pública, conflicto YCRT carbón
- Kirchnerismo local (FpV/UP) en oposición fuerte, especialmente en Río Gallegos y Caleta Olivia
- Crisis del sector pesquero en Puerto Deseado y San Julián
- Boom turístico en El Calafate pero inflación que golpea economías locales
- Las Heras: conflictos por condiciones laborales en yacimientos petroleros

ACTOR POLÍTICO A EVALUAR:
- Nombre: ${politico.nombre}
- Cargo exacto: ${politico.cargo}
- Localidad/ámbito: ${localidad || (politico.provincia ?? 'nacional')}
- Partido/espacio: ${politico.partidoNombre ?? 'no especificado'}${politico.coalicion ? `\n- Coalición/Frente: ${politico.coalicion}` : ''}${politico.descripcion ? `\n- Contexto adicional: ${politico.descripcion}` : ''}
- Nivel de exposición: ${nivel === 'nacional' ? 'NACIONAL (alta exposición mediática)' : nivel === 'provincial' ? 'PROVINCIAL (cobertura provincial)' : 'LOCAL (conocido principalmente en su municipio)'}

---
${datosReales?.resumenTexto
  ? `DATOS REALES RECOLECTADOS AUTOMÁTICAMENTE:\n${datosReales.resumenTexto}\n\nIMPORTANTE: Estos datos son REALES y deben ser tu fuente primaria. Si hay muchas noticias negativas, reflejalo en imagen_negativa alta. Si hay pocas menciones, usá valores más moderados por incertidumbre.`
  : 'DATOS EXTERNOS: No se pudo obtener información en tiempo real. Estimá basándote en el contexto político de SC descrito arriba.'}
---

INSTRUCCIONES PARA LA ESTIMACIÓN — MUY IMPORTANTE:
1. Imagen POSITIVA en rango ${rangoPos} — SÉ ESPECÍFICO, no uses valores genéricos como 50 o 55
2. Imagen NEGATIVA en rango ${rangoNeg} — debe diferenciarse de la positiva con lógica política real
3. La suma positiva + negativa debe ser entre 75 y 95 (el resto es NS/NC)
4. CADA POLÍTICO DEBE TENER VALORES ÚNICOS — analizá su caso concreto, no promedies
5. Considerá: ¿Está alineado con Milei o en contra? ¿Tiene conflictos sindicales? ¿Gestión visible?
6. Políticos K en SC: alta imagen positiva entre kirchneristas (base leal), pero negativa entre anti-K
7. Aliados de Milei: positiva en votantes LLA, negativa en sectores que reciben ajuste
8. Intendentes con obras visibles: positiva moderada-alta (55-70%), negativa baja-media
9. Políticos envueltos en escándalos o con denuncias: negativa alta (55-75%)
10. Figura muy conocida nacionalmente: puede tener polarización fuerte (ej: pos 65%, neg 60%)
11. Figura de pueblo pequeño (< 5k hab.): valores más acotados (40-60% pos, 30-50% neg)

REGLA ANTI-HOMOGENIZACIÓN — MUY IMPORTANTE:
Cada político tiene una historia, contexto y localidad DIFERENTE. Prohibido devolver valores iguales o similares a otro político.
Para diferenciar, pensá en estos factores únicos de ${politico.nombre}:
- ¿Cuántos años lleva en el cargo?
- ¿Tiene conflictos sindicales activos en ${localidad || 'su municipio'}?
- ¿Hay escándalos judiciales o administrativos en su gestión?
- ¿Qué obras concretas hizo o prometió?
- ¿Cómo lo tratan los medios locales de su zona?

FUNDAMENTOS: En el campo "fundamentos" mencioná al menos 2 hechos concretos y específicos de ${politico.nombre}, no genéricos.

Devolvé SOLO JSON válido (sin markdown, sin texto adicional, sin backticks):
{
  "imagen_positiva": <número decimal con un decimal, NUNCA igual a 42.1 u otro valor genérico, ej: ${(30 + Math.random() * 40).toFixed(1)}>,
  "imagen_negativa": <número decimal con un decimal, diferente al positivo, ej: ${(25 + Math.random() * 35).toFixed(1)}>,
  "tendencia": "<sube|baja|estable>",
  "fundamentos": "<2-3 oraciones concretas sobre ${politico.nombre} específicamente>",
  "keywords_sugeridas": ["${politico.nombre}", "keyword2", "keyword3"]
}`
}

// Cache de modelos disponibles (en memoria del proceso)
let modelosCache: { lista: string[]; expira: number } | null = null

async function obtenerModelosGemini(apiKey: string): Promise<string[]> {
  // Cache 10 min
  if (modelosCache && modelosCache.expira > Date.now()) return modelosCache.lista

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=200`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Gemini ListModels ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()

  // Filtrar solo modelos que soportan generateContent y no son legacy/embedding
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compatibles: string[] = (data.models ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((m: any) => String(m.name).replace(/^models\//, ''))
    // Solo modelos de TEXTO. Excluir: image, tts, audio, vision, embedding, aqa, preview
    .filter((n: string) =>
      !n.includes('embedding') &&
      !n.includes('aqa') &&
      !n.includes('image') &&
      !n.includes('tts') &&
      !n.includes('audio') &&
      !n.includes('vision') &&
      !n.includes('native') &&
      !n.includes('thinking')  // razonadores cuestan mucho más
    )

  // Priorizar flash sobre pro (más rápido/gratis), y nuevos sobre viejos
  const priorizado = compatibles.sort((a: string, b: string) => {
    const scoreA = (a.includes('flash') ? 100 : 0) + (a.includes('2.5') ? 50 : a.includes('2.0') ? 30 : a.includes('1.5') ? 10 : 0) - (a.includes('exp') ? 20 : 0)
    const scoreB = (b.includes('flash') ? 100 : 0) + (b.includes('2.5') ? 50 : b.includes('2.0') ? 30 : b.includes('1.5') ? 10 : 0) - (b.includes('exp') ? 20 : 0)
    return scoreB - scoreA
  })

  console.log('[Gemini] modelos disponibles (top 5):', priorizado.slice(0, 5))
  modelosCache = { lista: priorizado, expira: Date.now() + 10 * 60 * 1000 }
  return priorizado
}

async function llamarGemini(prompt: string, apiKey: string) {
  const modelos = await obtenerModelosGemini(apiKey)
  if (modelos.length === 0) {
    throw new Error('Tu API key no tiene acceso a ningún modelo de Gemini. Verificá la key en aistudio.google.com')
  }

  let ultimoError = ''
  let huboCuota = false
  // Intentar hasta 4 modelos en orden de prioridad
  for (const modelo of modelos.slice(0, 4)) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // temperature alta (0.85) para forzar variación entre políticos distintos
          // topP y topK para evitar que el modelo "default" al mismo valor
          generationConfig: { maxOutputTokens: 800, temperature: 0.85, topP: 0.95, topK: 40 },
        }),
      })
      if (!res.ok) {
        if (res.status === 429) huboCuota = true
        ultimoError = `${modelo} ${res.status}: ${(await res.text()).slice(0, 200)}`
        continue
      }
      const data = await res.json()
      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (texto) {
        console.log(`[Gemini] OK con modelo: ${modelo}`)
        return texto
      }
      ultimoError = `${modelo}: respuesta vacía`
    } catch (e) {
      ultimoError = `${modelo}: ${String(e)}`
    }
  }
  if (huboCuota) {
    throw new Error(`Cuota gratuita de Gemini agotada (15 req/min · 1500/día). Esperá 1 minuto o agregá GROQ_API_KEY como fallback (gratis): https://console.groq.com/keys`)
  }
  throw new Error(`Ningún modelo Gemini funcionó. Disponibles: ${modelos.slice(0, 4).join(', ')}. Último error: ${ultimoError}`)
}

async function llamarGroq(prompt: string, apiKey: string) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 800,
      temperature: 0.85,
    }),
  })
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

interface AnalisisIA {
  imagen_positiva: number
  imagen_negativa: number
  tendencia: 'sube' | 'baja' | 'estable'
  fundamentos: string
  keywords_sugeridas: string[]
}

function parsearRespuesta(raw: string): AnalisisIA | null {
  if (!raw) return null

  // Extraer JSON robusto: busca el primer { hasta el último }
  // Maneja: ```json\n{...}\n```, texto antes/después, JSON puro
  let candidato = raw.trim()

  // Quitar wrappers de código markdown (cualquier variante)
  candidato = candidato.replace(/^```[a-zA-Z]*\s*/m, '').replace(/\s*```\s*$/m, '').trim()

  // Extraer primer bloque {...} — greedy para capturar objetos anidados
  const inicio = candidato.indexOf('{')
  const fin = candidato.lastIndexOf('}')
  if (inicio !== -1 && fin !== -1 && fin > inicio) {
    candidato = candidato.slice(inicio, fin + 1)
  }

  try {
    const parsed = JSON.parse(candidato)
    const pos = Number(parsed.imagen_positiva ?? parsed.imagenPositiva ?? parsed.positiva ?? parsed.positive)
    const neg = Number(parsed.imagen_negativa ?? parsed.imagenNegativa ?? parsed.negativa ?? parsed.negative)
    if (isNaN(pos) || isNaN(neg)) return null
    return {
      imagen_positiva: pos,
      imagen_negativa: neg,
      tendencia: parsed.tendencia ?? parsed.trend ?? 'estable',
      fundamentos: String(parsed.fundamentos ?? parsed.reasoning ?? parsed.analysis ?? ''),
      keywords_sugeridas: Array.isArray(parsed.keywords_sugeridas) ? parsed.keywords_sugeridas
        : Array.isArray(parsed.keywords) ? parsed.keywords : [],
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { politicoId, slug } = body
  console.log('[analizar-politico-ia] body:', { politicoId, slug })
  if (!politicoId && !slug) {
    return NextResponse.json({ error: 'Falta politicoId o slug' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 1. Buscar político
  const query = supabase.from('politicos').select('*')
  const { data: politico, error: errPol } = await (politicoId
    ? query.eq('id', politicoId).single()
    : query.eq('slug', slug).single())

  if (errPol || !politico) {
    console.error('[analizar-politico-ia] político no encontrado:', errPol)
    return NextResponse.json({ error: `Político no encontrado: ${errPol?.message ?? 'desconocido'}` }, { status: 404 })
  }
  console.log('[analizar-politico-ia] político:', politico.nombre)

  // 2. Verificar API keys
  const geminiKey = process.env.GEMINI_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  console.log('[analizar-politico-ia] keys:', { gemini: !!geminiKey, groq: !!groqKey })
  if (!geminiKey && !groqKey) {
    return NextResponse.json({
      error: 'GEMINI_API_KEY no configurada en .env. Obtené gratis en https://aistudio.google.com/apikey y agregala como GEMINI_API_KEY=AIza... Luego reiniciá npm run dev.',
    }, { status: 500 })
  }

  // 3. Recolectar datos reales de múltiples fuentes en paralelo
  console.log('[analizar-politico-ia] recolectando datos reales...')
  const datosReales = await recolectarDatosReales({
    id: politico.id,
    nombre: politico.nombre,
    cargo: politico.cargo,
    palabras_clave: politico.palabras_clave ?? null,
    facebook_page_id: politico.facebook_page_id ?? null,
  })
  console.log('[analizar-politico-ia] datos reales:', {
    noticias: datosReales.noticias.length,
    menciones: datosReales.mencionesDB.total,
    trends: datosReales.trends?.interes ?? 'n/a',
    facebook: datosReales.facebook?.totalPosts ?? 'n/a',
  })

  // 4. Construir prompt con datos reales y llamar a IA
  const prompt = construirPrompt({
    nombre: politico.nombre,
    cargo: politico.cargo,
    provincia: politico.provincia_slug,
    partidoNombre: politico.partido_nombre,
    localidad: politico.localidad ?? null,
    coalicion: politico.coalicion ?? null,
    descripcion: politico.descripcion ?? null,
  }, datosReales)

  let respuestaRaw: string
  let modelo: string
  try {
    if (geminiKey) {
      try {
        respuestaRaw = await llamarGemini(prompt, geminiKey)
        modelo = 'gemini-2.5-flash'
      } catch (geminiErr) {
        const msg = String(geminiErr)
        const esQuota = msg.includes('Cuota') || msg.includes('429') || msg.includes('quota')
        if (groqKey && esQuota) {
          console.warn('[analizar-politico-ia] Gemini cuota agotada, usando Groq como fallback')
          respuestaRaw = await llamarGroq(prompt, groqKey)
          modelo = 'llama-3.3-70b (fallback)'
        } else {
          throw geminiErr
        }
      }
    } else {
      respuestaRaw = await llamarGroq(prompt, groqKey!)
      modelo = 'llama-3.3-70b'
    }
  } catch (e) {
    console.error('[analizar-politico-ia] llamada IA falló:', e)
    return NextResponse.json({ error: `Error IA: ${String(e)}` }, { status: 500 })
  }

  console.log('[analizar-politico-ia] IA respondió, parseando...')
  const analisis = parsearRespuesta(respuestaRaw)
  if (!analisis) {
    console.error('[analizar-politico-ia] no se pudo parsear:', respuestaRaw.slice(0, 500))
    return NextResponse.json({
      error: 'IA devolvió respuesta no parseable. Revisá la terminal del servidor.',
      raw: respuestaRaw.slice(0, 400),
    }, { status: 500 })
  }
  console.log('[analizar-politico-ia] parsed:', analisis)

  // 4. SAFETY: acotar para evitar 0/100 pero con rango amplio para reflejar realidad política
  // Nacionales/provinciales pueden tener más polarización que locales
  const nivel = nivelExposicion(politico.cargo)
  const minVal = nivel === 'nacional' ? 15 : nivel === 'provincial' ? 18 : 25
  const maxVal = nivel === 'nacional' ? 85 : nivel === 'provincial' ? 82 : 75
  const pos = clamp(analisis.imagen_positiva, minVal, maxVal)
  const neg = clamp(analisis.imagen_negativa, minVal, maxVal)

  // 5. Si faltan keywords en el político, generarlas automáticamente
  if (!politico.palabras_clave || politico.palabras_clave.length === 0) {
    const kws = analisis.keywords_sugeridas.length > 0
      ? analisis.keywords_sugeridas
      : autoKeywords(politico.nombre, politico.cargo, politico.provincia_slug)
    await supabase
      .from('politicos')
      .update({ palabras_clave: kws })
      .eq('id', politico.id)
  }

  // 6. Guardar en imagen_historico con total de menciones reales encontradas
  const { data: imgInsertada, error: errImg } = await supabase
    .from('imagen_historico')
    .insert({
      politico_id: politico.id,
      imagen_positiva: pos,
      imagen_negativa: neg,
      total_menciones: datosReales.mencionesDB.total + datosReales.noticias.length,
    })
    .select()
    .single()

  if (errImg) {
    return NextResponse.json({
      error: `No se pudo guardar imagen_historico: ${errImg.code} ${errImg.message}`,
      analisis_obtenido: { imagen_positiva: pos, imagen_negativa: neg, tendencia: analisis.tendencia },
    }, { status: 500 })
  }

  // 7. Guardar en encuestas como estimación IA (no crítico si falla)
  const tieneDatosReales = datosReales.noticias.length > 0 || datosReales.mencionesDB.total > 0
  const fuenteLabel = tieneDatosReales
    ? `IA + Datos reales · ${modelo}`
    : `Estimación IA · ${modelo}`
  const metodologiaLabel = tieneDatosReales
    ? `Análisis IA sobre ${datosReales.noticias.length} noticias recientes + ${datosReales.mencionesDB.total} menciones en medios locales${datosReales.trends ? ` + Google Trends (${datosReales.trends.interes}/100)` : ''}${datosReales.facebook ? ` + ${datosReales.facebook.totalPosts} posts Facebook` : ''}`
    : 'Estimación IA basada en contexto político regional (sin cobertura mediática reciente detectada)'

  await supabase.from('encuestas').insert({
    politico_id: politico.id,
    fecha: new Date().toISOString().split('T')[0],
    imagen_positiva: pos,
    imagen_negativa: neg,
    fuente: fuenteLabel,
    metodologia: metodologiaLabel,
    notas: analisis.fundamentos,
  }).then(({ error }) => {
    if (error) console.warn('[encuestas insert]', error.message)
  })

  return NextResponse.json({
    ok: true,
    politico: politico.nombre,
    modelo,
    imagen_positiva: pos,
    imagen_negativa: neg,
    tendencia: analisis.tendencia,
    fundamentos: analisis.fundamentos,
    imagen_id: imgInsertada?.id,
    datos_reales: {
      noticias_encontradas: datosReales.noticias.length,
      menciones_db: datosReales.mencionesDB.total,
      google_trends: datosReales.trends?.interes ?? null,
      facebook_posts: datosReales.facebook?.totalPosts ?? null,
    },
  })
  } catch (err) {
    console.error('[analizar-politico-ia] EXCEPCIÓN:', err)
    return NextResponse.json({
      error: `Excepción interna: ${err instanceof Error ? err.message : String(err)}`,
      stack: err instanceof Error ? err.stack?.slice(0, 500) : undefined,
    }, { status: 500 })
  }
}

// GET = diagnóstico de configuración
export async function GET() {
  const tieneGemini = !!process.env.GEMINI_API_KEY
  const tieneGroq = !!process.env.GROQ_API_KEY
  const tieneAnthropic = !!process.env.ANTHROPIC_API_KEY
  const tieneServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const tieneSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  return NextResponse.json({
    status: 'ok',
    config: {
      gemini_api_key: tieneGemini ? '✓ configurada' : '✗ FALTA (gratis: aistudio.google.com/apikey)',
      groq_api_key: tieneGroq ? '✓ configurada' : '○ opcional',
      anthropic_api_key: tieneAnthropic ? '✓ configurada' : '○ opcional',
      supabase_url: tieneSupabaseUrl ? '✓ configurada' : '✗ FALTA',
      supabase_service_key: tieneServiceKey ? '✓ configurada' : '✗ FALTA (necesaria)',
    },
    listo_para_usar: tieneSupabaseUrl && tieneServiceKey && (tieneGemini || tieneGroq || tieneAnthropic),
  })
}
