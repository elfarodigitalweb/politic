// Scanner de problemáticas y noticias por localidad en Santa Cruz
// Estrategia: incluir TODA noticia de SC que mencione una localidad.
// Categoría y severidad son bonus — si no hay keywords de problema → "General/1"

import { fetchAllRSSFeeds, FUENTES_SC, medioToFeed } from './rss'
import { fetchNewsForKeywords } from './googleNews'
import { getMediosLocales } from '@/lib/supabase/medios-queries'

export interface ProblemaDetectado {
  localidadSlug: string
  localidadNombre: string
  categoria: string
  titulo: string
  fuenteNombre: string
  url: string | null
  severidad: 1 | 2 | 3
  publicadoAt: string
}

// ---------------------------------------------------------------
// Keywords por localidad
// ---------------------------------------------------------------
const LOCALIDADES_SC: Record<string, { nombre: string; keywords: string[] }> = {
  'rio-gallegos': {
    nombre: 'Río Gallegos',
    keywords: ['río gallegos', 'rio gallegos', 'gallegos', 'capital santacruceña', 'capital de santa cruz', 'capital provincial'],
  },
  'caleta-olivia': {
    nombre: 'Caleta Olivia',
    keywords: ['caleta olivia', 'caleta'],
  },
  'el-calafate': {
    nombre: 'El Calafate',
    keywords: ['calafate', 'el calafate'],
  },
  'puerto-deseado': {
    nombre: 'Puerto Deseado',
    keywords: ['puerto deseado', 'deseado'],
  },
  'las-heras-sc': {
    nombre: 'Las Heras',
    keywords: ['las heras'],
  },
  'pico-truncado': {
    nombre: 'Pico Truncado',
    keywords: ['pico truncado'],
  },
  'puerto-san-julian': {
    nombre: 'Puerto San Julián',
    keywords: ['san julián', 'san julian', 'puerto san julián'],
  },
  'gobernador-gregores': {
    nombre: 'Gobernador Gregores',
    keywords: ['gregores', 'gobernador gregores'],
  },
  'perito-moreno-sc': {
    nombre: 'Perito Moreno',
    keywords: ['perito moreno'],
  },
  'los-antiguos': {
    nombre: 'Los Antiguos',
    keywords: ['los antiguos'],
  },
  'el-chalten': {
    nombre: 'El Chaltén',
    keywords: ['chaltén', 'chalten', 'el chaltén'],
  },
  'piedra-buena': {
    nombre: 'Piedra Buena',
    keywords: ['piedra buena'],
  },
  'puerto-santa-cruz': {
    nombre: 'Puerto Santa Cruz',
    keywords: ['puerto santa cruz'],
  },
  '28-de-noviembre': {
    nombre: '28 de Noviembre',
    keywords: ['28 de noviembre'],
  },
  'tres-lagos': {
    nombre: 'Tres Lagos',
    keywords: ['tres lagos'],
  },
  'rio-turbio': {
    nombre: 'Río Turbio',
    keywords: ['río turbio', 'rio turbio'],
  },
}

// ---------------------------------------------------------------
// Categorías de problemas
// ---------------------------------------------------------------
const CATEGORIAS: Record<string, { nombre: string; emoji: string; keywords: string[]; alta: string[] }> = {
  salud: {
    nombre: 'Salud', emoji: '🏥',
    keywords: ['hospital', 'salud', 'médico', 'médicos', 'oxígeno', 'medicamento', 'ambulancia', 'guardia', 'clínica', 'enfermera', 'sanitario', 'internado', 'UCI'],
    alta: ['sin oxígeno', 'sin médicos', 'sin médico', 'cierra hospital', 'sin medicamentos', 'falta médicos', 'hospital cerrado'],
  },
  infraestructura: {
    nombre: 'Infraestructura', emoji: '🔧',
    keywords: ['ruta', 'corte de luz', 'sin agua', 'cloacas', 'bache', 'camino', 'obra pública', 'vialidad', 'puente', 'gas', 'calefacción', 'servicios básicos', 'electricidad', 'red de agua'],
    alta: ['sin agua potable', 'corte de luz', 'ruta cortada', 'sin gas', 'sin calefacción', 'colapso cloacal'],
  },
  protesta: {
    nombre: 'Protesta', emoji: '📢',
    keywords: ['reclamo', 'protesta', 'marcha', 'huelga', 'corte', 'manifestación', 'sindicato', 'ATE', 'UPCN', 'ADOSAC', 'docentes', 'municipales', 'trabajadores', 'paro', 'movilización', 'acampe'],
    alta: ['huelga', 'corte de ruta', 'paro provincial', 'paro docente', 'manifestación masiva'],
  },
  seguridad: {
    nombre: 'Seguridad', emoji: '🚨',
    keywords: ['robo', 'violencia', 'homicidio', 'crimen', 'inseguridad', 'asaltaron', 'delito', 'narcotráfico', 'femicidio', 'asalto'],
    alta: ['homicidio', 'asesinato', 'femicidio', 'tiroteo'],
  },
  economia: {
    nombre: 'Economía Local', emoji: '💰',
    keywords: ['desempleo', 'cierre', 'deuda', 'salarios', 'despidos', 'quiebra', 'sin trabajo', 'crisis laboral', 'atraso salarial'],
    alta: ['cierre masivo', 'despidos masivos', 'quiebra'],
  },
  ambiente: {
    nombre: 'Medio Ambiente', emoji: '🌿',
    keywords: ['incendio', 'contaminación', 'derrame', 'residuos', 'basura', 'viento', 'nieve', 'inundación', 'petrolero', 'hidrocarburo'],
    alta: ['incendio forestal', 'derrame de petróleo', 'emergencia ambiental'],
  },
  politica: {
    nombre: 'Política Local', emoji: '🗳️',
    keywords: ['intendente', 'municipio', 'concejo', 'gobernador', 'obras', 'inauguró', 'anunció', 'acuerdo', 'proyecto', 'presupuesto', 'gestión', 'vecinos'],
    alta: ['denuncia', 'escándalo', 'renuncia', 'corrupción'],
  },
}

export const CATEGORIA_EMOJIS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORIAS).map(([k, v]) => [k, v.emoji])
)
CATEGORIA_EMOJIS['General'] = '📌'

export const CATEGORIA_COLORES: Record<string, string> = {
  salud: 'bg-pink-100 text-pink-700',
  infraestructura: 'bg-orange-100 text-orange-700',
  protesta: 'bg-yellow-100 text-yellow-700',
  seguridad: 'bg-red-100 text-red-700',
  economia: 'bg-blue-100 text-blue-700',
  ambiente: 'bg-green-100 text-green-700',
  politica: 'bg-purple-100 text-purple-700',
  General: 'bg-gray-100 text-gray-600',
}

export const SEVERIDAD_COLORES: Record<number, string> = {
  1: 'bg-gray-100 text-gray-500',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-red-100 text-red-700',
}

export const SEVERIDAD_LABELS: Record<number, string> = {
  1: 'Info',
  2: 'Media',
  3: 'Alta',
}

// ---------------------------------------------------------------
// Detección
// ---------------------------------------------------------------
function detectarLocalidad(texto: string): { slug: string; nombre: string } | null {
  const lower = texto.toLowerCase()
  for (const [slug, { nombre, keywords }] of Object.entries(LOCALIDADES_SC)) {
    if (keywords.some(kw => lower.includes(kw))) return { slug, nombre }
  }
  return null
}

// Siempre devuelve algo — 'General' con severidad 1 si no hay match de problema
function detectarCategoria(texto: string): { categoria: string; severidad: 1 | 2 | 3 } {
  const lower = texto.toLowerCase()
  for (const [cat, { keywords, alta }] of Object.entries(CATEGORIAS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      const severidad: 1 | 2 | 3 = alta.some(kw => lower.includes(kw)) ? 3 : 2
      return { categoria: cat, severidad }
    }
  }
  return { categoria: 'General', severidad: 1 }
}

// ---------------------------------------------------------------
// Scanner principal
// ---------------------------------------------------------------
export async function escanearProblematicas(): Promise<ProblemaDetectado[]> {
  // Cargar medios que el admin agregó en /admin/medios (siempre actualizados)
  const mediosLocales = await getMediosLocales().catch(() => [])
  const extraFeeds = mediosLocales
    .filter(m => m.urlRss)
    .map(m => medioToFeed({ nombre: m.nombre, urlRss: m.urlRss, provinciaSlug: m.provinciaSlug }))

  // Agregar fuentes locales SC al set de detección prioritaria
  for (const m of mediosLocales) {
    FUENTES_SC.add(m.nombre)
  }

  const [rssItems, googleSC1, googleSC2] = await Promise.all([
    fetchAllRSSFeeds(extraFeeds).catch(() => []),
    fetchNewsForKeywords(['Santa Cruz Argentina noticias Río Gallegos']).catch(() => []),
    fetchNewsForKeywords(['Caleta Olivia Las Heras Pico Truncado El Calafate']).catch(() => []),
  ])

  const todasNoticias = [...rssItems, ...googleSC1, ...googleSC2]
  const problemas: ProblemaDetectado[] = []
  const urlsVistas = new Set<string>()

  for (const noticia of todasNoticias) {
    if (!noticia.titulo || noticia.titulo.length < 10) continue
    if (noticia.url && urlsVistas.has(noticia.url)) continue
    if (noticia.url) urlsVistas.add(noticia.url)

    // Fuentes locales SC: incluir TODO (no necesitan match de localidad en el título)
    const esFuenteLocal = FUENTES_SC.has(noticia.fuente)

    let localidad = detectarLocalidad(noticia.titulo)

    // Si es fuente SC y no detectó localidad → intentar detectar en descripción o asumir
    // como Río Gallegos (capital) solo si no tiene datos de otra ciudad
    if (!localidad && esFuenteLocal) {
      // Buscar keywords de SC más amplios
      const lower = noticia.titulo.toLowerCase()
      if (lower.includes('santa cruz') || lower.includes('provincia') || lower.includes('patagonia')) {
        localidad = { slug: 'rio-gallegos', nombre: 'Santa Cruz (general)' }
      }
    }

    // Fuentes nacionales: solo si mencionan una localidad específica
    if (!localidad) continue

    const { categoria, severidad } = detectarCategoria(noticia.titulo)

    problemas.push({
      localidadSlug: localidad.slug,
      localidadNombre: localidad.nombre,
      categoria,
      titulo: noticia.titulo,
      fuenteNombre: noticia.fuente,
      url: noticia.url,
      severidad,
      publicadoAt: noticia.publicadoAt,
    })
  }

  // Ordenar: severidad desc → fecha desc
  return problemas.sort((a, b) => {
    if (b.severidad !== a.severidad) return b.severidad - a.severidad
    return new Date(b.publicadoAt).getTime() - new Date(a.publicadoAt).getTime()
  })
}

// Score de riesgo por localidad (0-100)
export function calcularRiesgoLocalidad(problemas: ProblemaDetectado[]): Record<string, number> {
  const riesgo: Record<string, number> = {}
  const ahora = Date.now()
  const SEMANA = 7 * 24 * 60 * 60 * 1000

  for (const p of problemas) {
    const diasAtras = (ahora - new Date(p.publicadoAt).getTime()) / SEMANA
    const pesoTemporal = Math.max(0, 1 - diasAtras)
    const puntos = pesoTemporal * p.severidad * 33
    riesgo[p.localidadSlug] = (riesgo[p.localidadSlug] ?? 0) + puntos
  }

  const max = Math.max(...Object.values(riesgo), 1)
  for (const slug of Object.keys(riesgo)) {
    riesgo[slug] = Math.min(100, Math.round((riesgo[slug] / max) * 100))
  }
  return riesgo
}
