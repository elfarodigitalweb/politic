import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getProvincias, getMunicipiosByProvincia } from '@/lib/supabase/queries'
import { getMediosLocales } from '@/lib/supabase/medios-queries'
import { getProblematicasRecientes, guardarProblematicasProvincial } from '@/lib/supabase/problematicas-queries'
import { escanearProvincia } from '@/lib/sources/problematicas-provincial'
import { CATEGORIA_EMOJIS, CATEGORIA_COLORES, SEVERIDAD_COLORES, SEVERIDAD_LABELS } from '@/lib/sources/problematicas-sc'
import { timeAgo } from '@/lib/utils/date'
import RefreshTableroButton from '@/components/RefreshTableroButton'
import {
  MapPin, AlertTriangle, ArrowLeft, ExternalLink, Newspaper, Building2,
  Plus, Rss, Globe, Code, CheckCircle2, Users, CheckCircle,
} from 'lucide-react'

export const revalidate = 60
export const maxDuration = 30

type Params = Promise<{ provincia: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { provincia } = await params
  return { title: `Tablero ${provincia} — Portal Político` }
}

export default async function TableroProvinciaPage({ params }: { params: Params }) {
  const { provincia: provinciaSlug } = await params

  // Santa Cruz tiene una versión rica con imagen política del gobernador,
  // mapeo de intendentes, etc. Redirigimos para no duplicar UI.
  if (provinciaSlug === 'santa-cruz') redirect('/santa-cruz')

  const provincias = await getProvincias().catch(() => [])
  const provincia = provincias.find(p => p.slug === provinciaSlug)
  if (!provincia) notFound()

  const VENTANA_DIAS = 10
  const limiteMs = Date.now() - VENTANA_DIAS * 86_400_000
  const esReciente = (iso: string) => new Date(iso).getTime() >= limiteMs

  // Scanner en vivo con timeout de 6s — si tarda, caemos a BD only
  const escaneoConTimeout = Promise.race([
    escanearProvincia(provinciaSlug),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('scan-timeout')), 6000)
    ),
  ]).catch(() => [] as Awaited<ReturnType<typeof escanearProvincia>>)

  const supabase = await createClient()
  const [municipios, mediosLocalesTodos, problemasDBRaw, politicosRes, alertasLive] = await Promise.all([
    getMunicipiosByProvincia(provinciaSlug).catch(() => []),
    getMediosLocales().catch(() => []),
    getProblematicasRecientes(VENTANA_DIAS, 200, provinciaSlug).catch(() => []),
    supabase
      .from('politicos')
      .select('id, nombre, slug, cargo, activo')
      .eq('provincia_slug', provinciaSlug)
      .eq('activo', true)
      .order('cargo')
      .limit(100),
    escaneoConTimeout,
  ])

  const politicos = politicosRes.data ?? []
  const mediosProv = mediosLocalesTodos.filter(m => m.provinciaSlug === provinciaSlug)

  // Persistir en background los items recientes del live scan
  const liveRecientes = alertasLive.filter(p => esReciente(p.publicadoAt))
  if (liveRecientes.length > 0) {
    guardarProblematicasProvincial(liveRecientes).catch(() => {})
  }

  // Combinar BD + live, dedup por URL, dentro de ventana
  type Combinado = {
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
  const combinados: Combinado[] = []
  let idSint = 200000

  for (const p of liveRecientes) {
    const key = p.url ?? `t:${p.titulo}`
    if (vistos.has(key)) continue
    vistos.add(key)
    combinados.push({
      id: idSint++,
      localidadSlug: p.localidadSlug,
      localidadNombre: p.localidadNombre,
      categoria: p.categoria,
      titulo: p.titulo,
      fuenteNombre: p.fuenteNombre,
      url: p.url,
      severidad: p.severidad,
      publicadoAt: p.publicadoAt,
    })
  }
  for (const p of problemasDBRaw) {
    if (!esReciente(p.publicadoAt)) continue
    const key = p.url ?? `t:${p.titulo}`
    if (vistos.has(key)) continue
    vistos.add(key)
    combinados.push(p)
  }
  combinados.sort(
    (a, b) => new Date(b.publicadoAt).getTime() - new Date(a.publicadoAt).getTime()
  )

  // Agrupar por localidad
  const alertasPorLocalidad = combinados.reduce<Record<string, Combinado[]>>((acc, p) => {
    if (!acc[p.localidadSlug]) acc[p.localidadSlug] = []
    acc[p.localidadSlug].push(p)
    return acc
  }, {})

  const ahora = Date.now()
  const scoreAlerta = (sev: number, fecha: string) => {
    const diasAtras = Math.max(0, (ahora - new Date(fecha).getTime()) / 86_400_000)
    const decaimiento = Math.max(0, 1 - diasAtras / VENTANA_DIAS)
    return sev * 1000 * decaimiento + sev * 10
  }

  const localidadesConAlertas = Object.entries(alertasPorLocalidad)
    .map(([slug, alertas]) => ({
      slug,
      alertas: alertas.sort(
        (a, b) => new Date(b.publicadoAt).getTime() - new Date(a.publicadoAt).getTime()
      ),
      severidadMax: Math.max(...alertas.map(a => a.severidad)) as 1 | 2 | 3,
      scoreMax: Math.max(...alertas.map(a => scoreAlerta(a.severidad, a.publicadoAt))),
      nombre: alertas[0]?.localidadNombre ?? slug,
    }))
    .sort((a, b) => b.scoreMax - a.scoreMax || b.alertas.length - a.alertas.length)

  // Stats de progreso
  const tieneGobernador = !!provincia.gobernadorNombre
  const tieneMunicipios = municipios.length > 0
  const tienePoliticos = politicos.length > 0
  const tieneMedios = mediosProv.length > 0
  const pasosCompletos =
    Number(tieneGobernador) + Number(tieneMunicipios) + Number(tienePoliticos) + Number(tieneMedios)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/tablero"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={12} /> Volver al tablero nacional
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: provincia.partidoColor }} />
            <span className="text-xs font-bold text-[#E31E24] uppercase tracking-widest">
              Provincia de
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">{provincia.nombre}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitoreo · {municipios.length} municipios · Últimos {VENTANA_DIAS} días
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <RefreshTableroButton provinciaSlug={provinciaSlug} />
          <Link
            href={`/admin/politicos?provincia=${provinciaSlug}`}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-[#E31E24] border border-gray-200 hover:border-[#E31E24] px-3 py-2 rounded-lg transition-colors"
          >
            Configurar
          </Link>
        </div>
      </div>

      {/* Gobernador */}
      {tieneGobernador && (
        <div className="bg-gray-900 text-white rounded-2xl p-5 mb-6 flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-black text-gray-300 flex-shrink-0">
            {(provincia.gobernadorNombre ?? '?').charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Gobernador de {provincia.nombre}
            </p>
            <p className="text-xl font-black">{provincia.gobernadorNombre}</p>
            {provincia.partidoSlug && (
              <p className="text-sm text-gray-400 mt-0.5 uppercase tracking-wide">
                {provincia.partidoSlug}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Wizard de progreso */}
      {pasosCompletos < 4 && (
        <div className="mb-6 rounded-xl p-4 border-2 bg-amber-50 border-amber-200">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h2 className="text-xs font-black uppercase tracking-wide text-amber-900 flex items-center gap-2">
              <AlertTriangle size={12} /> Configuración pendiente
            </h2>
            <span className="text-[10px] font-bold text-amber-700">{pasosCompletos}/4 pasos</span>
          </div>
          <ol className="space-y-1 text-xs">
            {[
              { ok: tieneGobernador, label: 'Cargar gobernador', href: `/admin/politicos?provincia=${provinciaSlug}` },
              { ok: tieneMunicipios, label: `Cargar municipios e intendentes${tieneMunicipios ? ` (${municipios.length})` : ''}`, href: `/admin/politicos?provincia=${provinciaSlug}` },
              { ok: tienePoliticos, label: `Cargar políticos a monitorear${tienePoliticos ? ` (${politicos.length})` : ''}`, href: `/admin/politicos?provincia=${provinciaSlug}` },
              { ok: tieneMedios, label: `Cargar medios locales${tieneMedios ? ` (${mediosProv.length})` : ''}`, href: '/admin/medios' },
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-2">
                {step.ok
                  ? <CheckCircle2 size={12} className="text-green-600 flex-shrink-0" />
                  : <span className="w-3 h-3 rounded-full border border-amber-400 flex-shrink-0" />}
                <span className={step.ok ? 'text-amber-700 line-through' : 'text-amber-900'}>
                  {i + 1}. {step.label}
                </span>
                {!step.ok && (
                  <Link href={step.href} className="text-xs text-[#E31E24] font-bold hover:underline">
                    → cargar
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-black text-gray-900">{combinados.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Alertas últimos {VENTANA_DIAS} días</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-black text-gray-900">{localidadesConAlertas.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Localidades con alertas</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm font-black text-gray-900 truncate">
            {localidadesConAlertas[0]?.nombre ?? '—'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Más activa</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-black text-gray-900">
            {combinados.filter(p => p.severidad === 3).length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Crisis activas</p>
        </div>
      </div>

      {/* ALERTAS POR LOCALIDAD */}
      <div className="mb-10">
        <h2 className="text-base font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          Alertas por localidad
        </h2>

        {localidadesConAlertas.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-sm font-bold text-gray-700">
              Sin alertas en los últimos {VENTANA_DIAS} días
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {tieneMedios
                ? <>Tocá <span className="font-bold">Refrescar alertas</span> para escanear medios locales.</>
                : <>Cargá medios locales para que el scanner detecte noticias.</>}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {localidadesConAlertas.map(({ slug, nombre, alertas, severidadMax }) => {
              const borderColor = severidadMax === 3 ? 'border-red-300' : severidadMax === 2 ? 'border-amber-300' : 'border-gray-200'
              const headerBg = severidadMax === 3 ? 'bg-red-50' : severidadMax === 2 ? 'bg-amber-50' : 'bg-gray-50'
              const dotColor = severidadMax === 3 ? 'bg-red-500' : severidadMax === 2 ? 'bg-amber-400' : 'bg-blue-400'

              return (
                <div key={slug} className={`border-2 ${borderColor} rounded-2xl overflow-hidden`}>
                  <div className={`${headerBg} px-4 py-3 flex items-center justify-between gap-3`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${dotColor} flex-shrink-0`} />
                      <h3 className="font-black text-gray-900">{nombre}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${SEVERIDAD_COLORES[severidadMax]}`}>
                        {SEVERIDAD_LABELS[severidadMax]}
                      </span>
                      <span className="text-xs text-gray-500">{alertas.length} alertas</span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {alertas.slice(0, 5).map(alerta => (
                      <div key={alerta.id} className="px-4 py-3 flex items-start gap-3 bg-white hover:bg-gray-50">
                        <span className="text-base flex-shrink-0 mt-0.5">
                          {CATEGORIA_EMOJIS[alerta.categoria] ?? '📌'}
                        </span>
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
                            className="flex-shrink-0 text-gray-300 hover:text-[#E31E24] mt-1">
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MUNICIPIOS */}
      {municipios.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Building2 size={14} /> Municipios e intendentes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {municipios.map(m => {
              const cantAlertas = alertasPorLocalidad[m.slug]?.length ?? 0
              const sevMax = cantAlertas > 0
                ? Math.max(...alertasPorLocalidad[m.slug].map(a => a.severidad))
                : 0
              const semaforo = sevMax === 3 ? 'border-red-300 bg-red-50'
                : sevMax === 2 ? 'border-amber-200 bg-amber-50'
                : 'border-gray-200 bg-white'
              return (
                <div key={m.id} className={`border-2 rounded-xl p-4 ${semaforo}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.partidoColor }} />
                    <h3 className="font-black text-gray-900 text-sm">{m.nombre}</h3>
                    {cantAlertas > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-full">
                        {cantAlertas}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-700">
                    <span className="text-gray-400">👤</span>{' '}
                    {m.intendenteNombre ?? <span className="italic text-gray-400">Sin intendente</span>}
                  </div>
                  {cantAlertas === 0 && (
                    <div className="border-t border-gray-100 mt-2 pt-2 flex items-center gap-1 text-[11px] text-gray-400">
                      <CheckCircle size={11} className="text-green-400" />
                      Sin conflictos
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* MEDIOS */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <Rss size={14} /> Medios locales ({mediosProv.length})
          </h2>
          <Link href="/admin/medios" className="text-xs font-bold text-[#E31E24] hover:underline">
            <Plus size={11} className="inline" /> Agregar
          </Link>
        </div>
        {mediosProv.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
            Sin medios. Sin medios el scanner no puede detectar noticias.{' '}
            <Link href="/admin/medios" className="font-bold underline">Cargar medios</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mediosProv.map(m => {
              const Icon = m.urlRss ? Rss : m.dominio ? Globe : Code
              const color = m.urlRss ? 'text-orange-500' : m.dominio ? 'text-blue-500' : 'text-purple-500'
              return (
                <div key={m.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Icon size={12} className={`${color} flex-shrink-0`} />
                  <span className="font-bold text-sm text-gray-900 truncate">{m.nombre}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* POLÍTICOS */}
      {politicos.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Users size={14} /> Políticos monitoreados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {politicos.slice(0, 12).map(p => (
              <Link key={p.id} href={`/imagen/${p.slug}`}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-[#E31E24] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{p.nombre}</p>
                  {p.cargo && <p className="text-[11px] text-gray-500 truncate">{p.cargo}</p>}
                </div>
                <ExternalLink size={11} className="text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Acceso rápido */}
      <div className="flex gap-2 flex-wrap justify-center">
        <Link href={`/noticias?provincia=${provinciaSlug}`}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#E31E24] border border-gray-200 hover:border-[#E31E24] px-3 py-1.5 rounded-lg">
          <Newspaper size={12} /> Noticias de {provincia.nombre}
        </Link>
        <Link href="/mapa"
          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#E31E24] border border-gray-200 hover:border-[#E31E24] px-3 py-1.5 rounded-lg">
          <MapPin size={12} /> Ver en mapa
        </Link>
      </div>
    </div>
  )
}
