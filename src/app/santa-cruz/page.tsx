import type { Metadata } from 'next'
import Link from 'next/link'
import { getCiudadesSantaCruz } from '@/lib/supabase/queries'
import { getProblematicasRecientes } from '@/lib/supabase/problematicas-queries'
import { getPoliticoBySlug, getUltimaImagen, getMencionesNegativasSC, getImagenesPoliticos } from '@/lib/supabase/politicos-queries'
import { getUltimaEncuesta } from '@/lib/supabase/encuestas-queries'
import { CATEGORIA_EMOJIS, CATEGORIA_COLORES, SEVERIDAD_COLORES, SEVERIDAD_LABELS, escanearProblematicas } from '@/lib/sources/problematicas-sc'
import { ALERTAS_SC_SEED, type AlertaSeed } from '@/lib/sources/alertas-sc-seed'
import { TrendingUp, TrendingDown, MapPin, AlertTriangle, CheckCircle, Newspaper, BarChart3, ExternalLink, ShieldAlert } from 'lucide-react'
import { timeAgo } from '@/lib/utils/date'
import RefreshAlertsButton from './RefreshAlertsButton'

export const metadata: Metadata = {
  title: 'Santa Cruz — Tablero Político Provincial',
  description: 'Monitoreo político completo de Santa Cruz: gobernador, municipios, intendentes y alertas locales.',
}

export const revalidate = 60
// En Vercel: subir el timeout por encima del default (10s) ya que el render
// dispara un escaneo en vivo de RSS externos.
export const maxDuration = 30

// Mapeo ciudad slug → intendente slug (para link al perfil)
const CIUDAD_INTENDENTE: Record<string, string> = {
  'rio-gallegos':        'pablo-grasso',
  'caleta-olivia':       'pablo-carrizo',
  'las-heras-sc':        'antonio-carambia',
  'pico-truncado':       'pablo-anabalon',
  'puerto-deseado':      'juan-martinez-sc',
  'puerto-san-julian':   'daniel-gardonio',
  'perito-moreno-sc':    'matias-treppo',
  'los-antiguos':        'zulma-neira',
  'gobernador-gregores': 'carina-bosso',
  'puerto-santa-cruz':   'juan-manuel-borquez',
  'piedra-buena':        'analia-farias',
  'el-calafate':         'javier-belloni',
  'el-chalten':          'nestor-tico',
  'rio-turbio':          'dario-menna',
  '28-de-noviembre':     'aldo-aravena',
  'tres-lagos':          'nayla-fernandez',
}

// Nombres de intendentes por ciudad (fallback si municipios DB no tiene el dato)
const CIUDAD_INTENDENTE_NOMBRE: Record<string, string> = {
  'rio-gallegos':        'Pablo Grasso',
  'caleta-olivia':       'Pablo Carrizo',
  'las-heras-sc':        'Antonio Carambia',
  'pico-truncado':       'Pablo Anabalón',
  'puerto-deseado':      'Juan Raúl Martínez',
  'puerto-san-julian':   'Daniel Gardonio',
  'perito-moreno-sc':    'Matías Treppo',
  'los-antiguos':        'Zulma Neira',
  'gobernador-gregores': 'Carina Bosso',
  'puerto-santa-cruz':   'Juan Manuel Bórquez',
  'piedra-buena':        'Analía Farías',
  'el-calafate':         'Javier Belloni',
  'el-chalten':          'Néstor Ticó',
  'rio-turbio':          'Darío Menna',
  '28-de-noviembre':     'Aldo Aravena',
  'tres-lagos':          'Nayla Fernández',
}

export default async function SantaCruzPage() {
  // Todos los slugs de intendentes + gobernador para traer sus imágenes de una vez
  const todosLosSlugsPoliticos = [
    'claudio-vidal',
    ...Object.values(CIUDAD_INTENDENTE),
  ]

  // Tope DURO: 10 días. Nada más viejo se muestra. Si la BD/scanner no tienen
  // novedades en los últimos 10 días, la página queda vacía con CTA a refrescar.
  const VENTANA_DIAS = 10
  const limiteMs = Date.now() - VENTANA_DIAS * 86_400_000
  const esReciente = (fechaISO: string) =>
    new Date(fechaISO).getTime() >= limiteMs

  // Timeout para el escaneo en vivo. En Vercel las Server Functions tienen
  // límite de 10s default — si los RSS externos tardan, el page entero falla.
  // Si timeout o error → caemos a BD solamente (que siempre tiene los datos
  // del último cron + del último botón "Refrescar").
  const escaneoConTimeout = Promise.race([
    escanearProblematicas(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('scan-timeout')), 6000)
    ),
  ]).catch(() => [] as Awaited<ReturnType<typeof escanearProblematicas>>)

  // En PARALELO: BD (10 días) + escaneo en vivo de RSS/Google News.
  const [
    ciudades,
    gobernador,
    imagenesMap,
    problemasDBRaw,
    mencionesNegRaw,
    alertasLive,
  ] = await Promise.all([
    getCiudadesSantaCruz().catch(() => []),
    getPoliticoBySlug('claudio-vidal').catch(() => null),
    getImagenesPoliticos(todosLosSlugsPoliticos).catch(() => new Map()),
    getProblematicasRecientes(VENTANA_DIAS, 200).catch(() => []),
    getMencionesNegativasSC(VENTANA_DIAS, 80).catch(() => []),
    escaneoConTimeout,
  ])

  // Filtro defensivo: solo items dentro de la ventana de 10 días.
  const mencionesNeg = mencionesNegRaw.filter(m => esReciente(m.publicadoAt))

  // Items nuevos del escaneo dentro de la ventana. No los guardamos en background
  // desde el render (en serverless las promises huérfanas se cortan). La
  // persistencia se hace desde el botón Refrescar y el cron.
  const liveRecientes = alertasLive.filter(p => esReciente(p.publicadoAt))

  // Combinar BD + live, dedupe por URL (y por título si no hay URL),
  // descartando todo lo que esté fuera de la ventana.
  type ProblemaCombinado = {
    id: number
    localidadSlug: string
    localidadNombre: string
    categoria: string
    titulo: string
    fuenteNombre: string
    url: string | null
    severidad: 1 | 2 | 3
    publicadoAt: string
  }

  const vistos = new Set<string>()
  const combinados: ProblemaCombinado[] = []
  let idSintetico = 100000

  // Primero los live (suelen ser los más frescos), luego BD
  for (const p of liveRecientes) {
    const key = p.url ?? `t:${p.titulo}`
    if (vistos.has(key)) continue
    vistos.add(key)
    combinados.push({ ...p, id: idSintetico++ })
  }
  for (const p of problemasDBRaw) {
    if (!esReciente(p.publicadoAt)) continue
    const key = p.url ?? `t:${p.titulo}`
    if (vistos.has(key)) continue
    vistos.add(key)
    combinados.push(p)
  }

  // Ordenar por fecha desc (lo más nuevo primero, siempre)
  combinados.sort((a, b) =>
    new Date(b.publicadoAt).getTime() - new Date(a.publicadoAt).getTime()
  )

  const problemasDB = combinados

  // Imagen del gobernador desde imagen_historico (misma fuente que el admin)
  const imagenGob = imagenesMap.get('claudio-vidal')
    ? { imagenPositiva: imagenesMap.get('claudio-vidal')!.imagenPositiva, imagenNegativa: imagenesMap.get('claudio-vidal')!.imagenNegativa }
    : gobernador ? await getUltimaImagen(gobernador.id).catch(() => null) : null
  const encuestaGob = gobernador ? await getUltimaEncuesta(gobernador.id).catch(() => null) : null

  // Solo datos reales recientes — sin fallback al seed con fechas viejas.
  // Si el seed tuviera items dentro de la ventana, se incluyen; si no, se descarta.
  const seedReciente = ALERTAS_SC_SEED.filter(p => esReciente(p.publicadoAt))

  const problemasRecientes: AlertaSeed[] = problemasDB.length > 0
    ? problemasDB.map(p => ({
        id: p.id,
        localidadSlug: p.localidadSlug,
        localidadNombre: p.localidadNombre,
        categoria: p.categoria,
        titulo: p.titulo,
        fuenteNombre: p.fuenteNombre,
        url: p.url,
        severidad: p.severidad,
        publicadoAt: p.publicadoAt,
      }))
    : seedReciente

  const usandoSeed = problemasDB.length === 0 && problemasRecientes.length > 0

  // Agrupar alertas por localidad
  const alertasPorLocalidad = problemasRecientes.reduce<Record<string, AlertaSeed[]>>((acc, p) => {
    if (!acc[p.localidadSlug]) acc[p.localidadSlug] = []
    acc[p.localidadSlug].push(p)
    return acc
  }, {})

  type MencionNeg = typeof mencionesNeg[number]
  // Agrupar noticias negativas por slug de intendente
  const negativasPorIntendente = mencionesNeg.reduce<Record<string, MencionNeg[]>>((acc, m) => {
    if (!acc[m.slug]) acc[m.slug] = []
    acc[m.slug].push(m)
    return acc
  }, {})

  // Localidades con alertas. Dentro de cada localidad: las alertas se muestran
  // por fecha desc (lo último primero). Para ordenar las localidades entre sí
  // combinamos severidad + recencia: una sev-3 reciente pesa más que una sev-3
  // vieja, así una localidad con noticias frescas siempre sube al tope.
  const ahora = Date.now()
  const scoreAlerta = (sev: number, fecha: string) => {
    const diasAtras = Math.max(0, (ahora - new Date(fecha).getTime()) / 86_400_000)
    const decaimiento = Math.max(0, 1 - diasAtras / VENTANA_DIAS) // 0 a 5 días
    return sev * 1000 * decaimiento + (sev * 10) // piso mínimo por severidad
  }

  const localidadesConAlertas = Object.entries(alertasPorLocalidad)
    .map(([slug, alertas]) => ({
      slug,
      alertas: alertas.sort((a, b) =>
        new Date(b.publicadoAt).getTime() - new Date(a.publicadoAt).getTime()
      ),
      severidadMax: Math.max(...alertas.map(a => a.severidad)) as 1 | 2 | 3,
      scoreMax: Math.max(...alertas.map(a => scoreAlerta(a.severidad, a.publicadoAt))),
      nombre: alertas[0]?.localidadNombre ?? slug,
    }))
    .sort((a, b) => b.scoreMax - a.scoreMax || b.alertas.length - a.alertas.length)

  const riesgoPorLocalidad = Object.fromEntries(
    Object.entries(alertasPorLocalidad).map(([slug, ps]) => [
      slug,
      Math.max(...ps.map(p => p.severidad)),
    ])
  )

  // Todas las localidades de SC (16 ciudades hardcodeadas si DB está vacía)
  const LOCALIDADES_ORDEN = [
    'rio-gallegos','caleta-olivia','el-calafate','puerto-deseado',
    'las-heras-sc','pico-truncado','puerto-san-julian','gobernador-gregores',
    'perito-moreno-sc','los-antiguos','el-chalten','piedra-buena',
    'puerto-santa-cruz','28-de-noviembre','tres-lagos','rio-turbio',
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-[#E31E24]" />
            <span className="text-xs font-bold text-[#E31E24] uppercase tracking-widest">
              Provincia de Santa Cruz
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">Tablero Político Provincial</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitoreo en tiempo real · 16 localidades · Últimos {VENTANA_DIAS} días
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <RefreshAlertsButton />
          <Link href="/mapa"
            className="flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-[#E31E24] border border-gray-200 hover:border-[#E31E24] px-3 py-2 rounded-lg transition-colors">
            <MapPin size={14} /> Ver mapa
          </Link>
          <Link href="/noticias?provincia=santa-cruz"
            className="flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-[#E31E24] border border-gray-200 hover:border-[#E31E24] px-3 py-2 rounded-lg transition-colors">
            <Newspaper size={14} /> Noticias SC
          </Link>
        </div>
      </div>

      {/* Gobernador */}
      {gobernador && (
        <div className="bg-gray-900 text-white rounded-2xl p-5 mb-6 flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-black text-gray-300 flex-shrink-0">
            {gobernador.nombre.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Gobernador de Santa Cruz</p>
            <Link href={`/imagen/${gobernador.slug}`} className="text-xl font-black hover:text-[#E31E24] transition-colors">
              {gobernador.nombre}
            </Link>
            {gobernador.partidoNombre && <p className="text-sm text-gray-400 mt-0.5">{gobernador.partidoNombre}</p>}
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            {imagenGob && (
              <>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp size={14} />
                    <span className="text-2xl font-black">{imagenGob.imagenPositiva.toFixed(0)}%</span>
                  </div>
                  <p className="text-[10px] text-gray-400">imagen positiva</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-red-400">
                    <TrendingDown size={14} />
                    <span className="text-2xl font-black">{imagenGob.imagenNegativa.toFixed(0)}%</span>
                  </div>
                  <p className="text-[10px] text-gray-400">imagen negativa</p>
                </div>
              </>
            )}
            {encuestaGob?.imagenPositiva != null && !imagenGob && (
              <div className="text-center">
                <div className="flex items-center gap-1 text-blue-400">
                  <BarChart3 size={14} />
                  <span className="text-2xl font-black">{encuestaGob.imagenPositiva}%</span>
                </div>
                <p className="text-[10px] text-gray-400">imagen positiva</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-black text-gray-900">{problemasRecientes.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Alertas últimos {VENTANA_DIAS} días
          </p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-black text-gray-900">{localidadesConAlertas.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Localidades con alertas</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm font-black text-gray-900 truncate">
            {localidadesConAlertas[0]?.nombre ?? '—'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Localidad más activa</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-black text-gray-900">
            {problemasRecientes.filter(p => p.severidad === 3).length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Crisis activas</p>
        </div>
      </div>

      {/* ALERTAS POR LOCALIDAD */}
      <div className="mb-10">
        <h2 className="text-base font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          Alertas por localidad
          {usandoSeed && (
            <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full normal-case tracking-normal ml-1">
              Datos verificados mayo 2026
            </span>
          )}
        </h2>

        {localidadesConAlertas.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-sm font-bold text-gray-700">
              Sin alertas en los últimos {VENTANA_DIAS} días
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tocá <span className="font-bold">Refrescar alertas</span> arriba para escanear medios locales y Google News.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {localidadesConAlertas.map(({ slug, nombre, alertas, severidadMax }) => {
            const intendenteSlug = CIUDAD_INTENDENTE[slug]
            const noticiasNeg = intendenteSlug ? (negativasPorIntendente[intendenteSlug] ?? []) : []

            const borderColor = severidadMax === 3 ? 'border-red-300' : severidadMax === 2 ? 'border-amber-300' : 'border-gray-200'
            const headerBg = severidadMax === 3 ? 'bg-red-50' : severidadMax === 2 ? 'bg-amber-50' : 'bg-gray-50'
            const dotColor = severidadMax === 3 ? 'bg-red-500' : severidadMax === 2 ? 'bg-amber-400' : 'bg-blue-400'

            return (
              <div key={slug} className={`border-2 ${borderColor} rounded-2xl overflow-hidden`}>
                <div className={`${headerBg} px-4 py-3 flex items-center justify-between gap-3`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${dotColor} flex-shrink-0`} />
                    <h3 className="font-black text-gray-900">{nombre}</h3>
                    {intendenteSlug && (
                      <Link href={`/imagen/${intendenteSlug}`}
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5">
                        → ver intendente
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${SEVERIDAD_COLORES[severidadMax]}`}>
                      {SEVERIDAD_LABELS[severidadMax]}
                    </span>
                    <span className="text-xs text-gray-500">{alertas.length} alertas</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {alertas.slice(0, 5).map((alerta) => (
                    <div key={alerta.id}
                      className="px-4 py-3 flex items-start gap-3 bg-white hover:bg-gray-50 transition-colors">
                      <span className="text-base flex-shrink-0 mt-0.5">{CATEGORIA_EMOJIS[alerta.categoria] ?? '📌'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORIA_COLORES[alerta.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
                            {alerta.categoria}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${SEVERIDAD_COLORES[alerta.severidad]}`}>
                            {SEVERIDAD_LABELS[alerta.severidad]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 leading-snug">{alerta.titulo}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {alerta.fuenteNombre} · {timeAgo(alerta.publicadoAt)}
                        </p>
                      </div>
                      {alerta.url && (
                        <a href={alerta.url} target="_blank" rel="noopener noreferrer"
                          className="flex-shrink-0 text-gray-300 hover:text-[#E31E24] transition-colors mt-1">
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  ))}

                  {noticiasNeg.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-red-50 flex items-center gap-2">
                        <ShieldAlert size={12} className="text-red-500 flex-shrink-0" />
                        <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide">
                          Noticias negativas — {noticiasNeg[0].nombre}
                        </p>
                      </div>
                      {noticiasNeg.slice(0, 2).map((n, i) => (
                        <div key={i} className="px-4 py-2.5 flex items-start gap-3 bg-red-50/40">
                          <span className="text-base flex-shrink-0 mt-0.5">📰</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 leading-snug">{n.titulo}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{n.fuente} · {timeAgo(n.publicadoAt)}</p>
                          </div>
                          {n.url && (
                            <a href={n.url} target="_blank" rel="noopener noreferrer"
                              className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors mt-1">
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* GRID TODAS LAS LOCALIDADES */}
      <div className="mb-8">
        <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide mb-4">
          Todas las localidades — estado actual
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LOCALIDADES_ORDEN.map((ciudadSlug) => {
            const ciudad = ciudades.find(c => c.slug === ciudadSlug)
            const alertas = alertasPorLocalidad[ciudadSlug] ?? []
            const riesgo = riesgoPorLocalidad[ciudadSlug] ?? 0
            const intendenteSlug = CIUDAD_INTENDENTE[ciudadSlug]
            const intendenteNombre = ciudad?.intendenteNombre || CIUDAD_INTENDENTE_NOMBRE[ciudadSlug] || null
            const noticiasNegCiudad = intendenteSlug ? (negativasPorIntendente[intendenteSlug] ?? []) : []

            const nombre = ciudad?.nombre ?? ciudadSlug.replace(/-/g, ' ')

            const semaforo = riesgo === 3 ? 'border-red-300 bg-red-50' :
              riesgo === 2 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'
            const semaforoCirculo = riesgo === 3 ? 'bg-red-500' :
              riesgo === 2 ? 'bg-amber-400' :
              noticiasNegCiudad.length > 0 ? 'bg-orange-300' : 'bg-green-400'

            return (
              <div key={ciudadSlug} className={`border-2 rounded-xl p-4 ${semaforo}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${semaforoCirculo}`} />
                      <h3 className="font-black text-gray-900 text-sm leading-tight">{nombre}</h3>
                    </div>
                    {ciudad?.partidoSlug && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: ciudad.partidoColor ?? '#94a3b8' }} />
                        <span className="text-[11px] text-gray-500 uppercase tracking-wide">
                          {ciudad.partidoSlug}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {alertas.length > 0 && (
                      <span className="text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-full">
                        {alertas.length}
                      </span>
                    )}
                    {noticiasNegCiudad.length > 0 && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                        {noticiasNegCiudad.length} neg
                      </span>
                    )}
                  </div>
                </div>

                {/* Intendente */}
                <div className="flex items-center gap-1.5 text-sm text-gray-700 mb-2">
                  <span className="text-gray-400 text-xs">👤</span>
                  {intendenteNombre ? (
                    intendenteSlug ? (
                      <Link href={`/imagen/${intendenteSlug}`}
                        className="font-semibold text-sm hover:text-indigo-600 transition-colors">
                        {intendenteNombre}
                      </Link>
                    ) : (
                      <span className="font-semibold text-sm">{intendenteNombre}</span>
                    )
                  ) : (
                    <span className="text-gray-400 italic text-xs">Sin datos</span>
                  )}
                </div>

                {/* Imagen política — desde imagen_historico (misma fuente que el admin) */}
                {(() => {
                  const imgPol = intendenteSlug ? imagenesMap.get(intendenteSlug) : null
                  const imgFallback = ciudad?.imagenPositiva != null
                    ? { imagenPositiva: ciudad.imagenPositiva, imagenNegativa: ciudad.imagenNegativa ?? 0 }
                    : null
                  const img = imgPol ?? imgFallback
                  if (!img) return null
                  return (
                    <div className="flex items-center gap-3 mb-2 text-xs">
                      <span className="flex items-center gap-0.5 text-green-600 font-bold">
                        <TrendingUp size={11} />{img.imagenPositiva.toFixed(1)}%
                      </span>
                      <span className="flex items-center gap-0.5 text-red-500 font-bold">
                        <TrendingDown size={11} />{img.imagenNegativa.toFixed(1)}%
                      </span>
                    </div>
                  )
                })()}

                {/* Última alerta */}
                {alertas[0] && (
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">
                      {CATEGORIA_EMOJIS[alertas[0].categoria]} {alertas[0].titulo}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(alertas[0].publicadoAt)}</p>
                  </div>
                )}

                {!alertas[0] && noticiasNegCiudad[0] && (
                  <div className="border-t border-red-100 pt-2 mt-2">
                    <p className="text-[11px] text-red-600 leading-snug line-clamp-2">
                      📰 {noticiasNegCiudad[0].titulo}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(noticiasNegCiudad[0].publicadoAt)}</p>
                  </div>
                )}

                {alertas.length === 0 && noticiasNegCiudad.length === 0 && (
                  <div className="border-t border-gray-100 pt-2 mt-2 flex items-center gap-1 text-[11px] text-gray-400">
                    <CheckCircle size={11} className="text-green-400" />
                    Sin conflictos registrados
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Nota metodológica */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs font-bold text-blue-700 mb-1">📊 Fuentes y metodología</p>
        <p className="text-xs text-blue-600">
          Alertas verificadas en medios locales: OPI Santa Cruz, La Opinión Austral, El Socavón,
          Tiempo Sur, El Patagónico, ZN Noticias, ATE Argentina, La Prensa de Santa Cruz, Noticias SC (gob.ar).
          Severidad: 🔴 Crisis (3) · 🟡 Problema serio (2) · 🟢 Informativo (1).
          {usandoSeed && ' Los datos del escáner automático se actualizan desde el panel admin.'}
        </p>
        <Link href="/admin/imagen"
          className="inline-block mt-2 text-xs font-bold text-blue-700 hover:underline">
          Actualizar con escáner automático →
        </Link>
      </div>
    </div>
  )
}
