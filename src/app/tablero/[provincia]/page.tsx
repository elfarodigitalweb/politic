import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getProvincias, getMunicipiosByProvincia } from '@/lib/supabase/queries'
import { getMediosLocales } from '@/lib/supabase/medios-queries'
import { fetchTodasLasNoticias } from '@/lib/sources/aggregator'
import {
  MapPin, Users, Newspaper, ArrowLeft, Plus, Rss, Globe, Code,
  AlertTriangle, ExternalLink, Building2, CheckCircle2,
} from 'lucide-react'
import { timeAgo } from '@/lib/utils/date'

export const revalidate = 120

type Params = Promise<{ provincia: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { provincia } = await params
  return {
    title: `Tablero ${provincia} — Portal Político`,
  }
}

export default async function TableroProvinciaPage({ params }: { params: Params }) {
  const { provincia: provinciaSlug } = await params

  // Santa Cruz tiene su tablero completo con alertas en tiempo real
  if (provinciaSlug === 'santa-cruz') redirect('/santa-cruz')

  const provincias = await getProvincias().catch(() => [])
  const provincia = provincias.find(p => p.slug === provinciaSlug)
  if (!provincia) notFound()

  const supabase = await createClient()
  const [politicosRes, municipios, mediosLocalesTodos, noticias] = await Promise.all([
    supabase
      .from('politicos')
      .select('id, nombre, slug, cargo, activo')
      .eq('provincia_slug', provinciaSlug)
      .eq('activo', true)
      .order('cargo')
      .limit(100),
    getMunicipiosByProvincia(provinciaSlug).catch(() => []),
    getMediosLocales().catch(() => []),
    fetchTodasLasNoticias([]).catch(() => []),
  ])

  const politicos = politicosRes.data ?? []
  const mediosProv = mediosLocalesTodos.filter(m => m.provinciaSlug === provinciaSlug)

  // Filtrar noticias a las que detectan esta provincia o vienen de un medio de la provincia
  const nombresMediosProv = new Set(mediosProv.map(m => m.nombre))
  const noticiasProv = noticias
    .filter(n => n.provinciaSlug === provinciaSlug || nombresMediosProv.has(n.fuente))
    .slice(0, 15)

  // Stats de progreso
  const tieneGobernador = !!provincia.gobernadorNombre
  const tieneMunicipios = municipios.length > 0
  const tienePoliticos = politicos.length > 0
  const tieneMedios = mediosProv.length > 0
  const totalPasos = 4
  const pasosCompletos =
    Number(tieneGobernador) +
    Number(tieneMunicipios) +
    Number(tienePoliticos) +
    Number(tieneMedios)
  const sinDatos = pasosCompletos === 0

  // Separar políticos por categoría
  const politicosPorCargo: Record<string, typeof politicos> = {}
  for (const p of politicos) {
    const k = p.cargo ?? 'Otros'
    if (!politicosPorCargo[k]) politicosPorCargo[k] = []
    politicosPorCargo[k].push(p)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/tablero"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={12} /> Volver al tablero nacional
      </Link>

      {/* Header con color del partido gobernante */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: provincia.partidoColor }}
          />
          <span className="text-xs font-bold text-[#E31E24] uppercase tracking-widest">
            Provincia de
          </span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-1">{provincia.nombre}</h1>
        <p className="text-sm text-gray-500">
          {tieneGobernador ? (
            <>Gobernador: <span className="font-bold text-gray-900">{provincia.gobernadorNombre}</span></>
          ) : (
            <span className="italic text-amber-600">Sin gobernador cargado</span>
          )}
          {' · '}
          INDEC {provincia.codigoIndec}
        </p>
      </div>

      {/* Wizard de configuración */}
      <div className={`mb-6 rounded-xl p-5 border-2 ${
        pasosCompletos === totalPasos
          ? 'bg-green-50 border-green-200'
          : sinDatos
            ? 'bg-amber-50 border-amber-300'
            : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-black uppercase tracking-wide text-gray-800 flex items-center gap-2">
            {pasosCompletos === totalPasos ? (
              <><CheckCircle2 size={14} className="text-green-600" /> Provincia configurada</>
            ) : (
              <><AlertTriangle size={14} className="text-amber-600" /> Configuración pendiente</>
            )}
          </h2>
          <span className="text-xs font-bold text-gray-600">
            {pasosCompletos}/{totalPasos} pasos completos
          </span>
        </div>

        <ol className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            {tieneGobernador
              ? <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
              : <span className="w-3.5 h-3.5 rounded-full border border-gray-400 flex-shrink-0" />}
            <span className={tieneGobernador ? 'text-gray-600 line-through' : 'text-gray-900'}>
              1. Cargar gobernador
            </span>
            {!tieneGobernador && (
              <Link href={`/admin/politicos?provincia=${provinciaSlug}`} className="text-xs text-[#E31E24] font-bold hover:underline">
                → cargar
              </Link>
            )}
          </li>
          <li className="flex items-center gap-2">
            {tieneMunicipios
              ? <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
              : <span className="w-3.5 h-3.5 rounded-full border border-gray-400 flex-shrink-0" />}
            <span className={tieneMunicipios ? 'text-gray-600 line-through' : 'text-gray-900'}>
              2. Cargar municipios con sus intendentes {tieneMunicipios && `(${municipios.length})`}
            </span>
            {!tieneMunicipios && (
              <Link href={`/admin/politicos?provincia=${provinciaSlug}`} className="text-xs text-[#E31E24] font-bold hover:underline">
                → cargar
              </Link>
            )}
          </li>
          <li className="flex items-center gap-2">
            {tienePoliticos
              ? <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
              : <span className="w-3.5 h-3.5 rounded-full border border-gray-400 flex-shrink-0" />}
            <span className={tienePoliticos ? 'text-gray-600 line-through' : 'text-gray-900'}>
              3. Cargar políticos a monitorear {tienePoliticos && `(${politicos.length})`}
            </span>
            {!tienePoliticos && (
              <Link href={`/admin/politicos?provincia=${provinciaSlug}`} className="text-xs text-[#E31E24] font-bold hover:underline">
                → cargar
              </Link>
            )}
          </li>
          <li className="flex items-center gap-2">
            {tieneMedios
              ? <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
              : <span className="w-3.5 h-3.5 rounded-full border border-gray-400 flex-shrink-0" />}
            <span className={tieneMedios ? 'text-gray-600 line-through' : 'text-gray-900'}>
              4. Cargar medios locales (RSS, dominio o scraping) {tieneMedios && `(${mediosProv.length})`}
            </span>
            {!tieneMedios && (
              <Link href="/admin/medios" className="text-xs text-[#E31E24] font-bold hover:underline">
                → cargar
              </Link>
            )}
          </li>
        </ol>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white border rounded-xl p-4">
          <Building2 size={14} className="text-gray-400 mb-2" />
          <p className="text-2xl font-black text-gray-900">{municipios.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Municipios</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <Users size={14} className="text-gray-400 mb-2" />
          <p className="text-2xl font-black text-gray-900">{politicos.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Políticos cargados</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <Rss size={14} className="text-gray-400 mb-2" />
          <p className="text-2xl font-black text-gray-900">{mediosProv.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Medios locales</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <Newspaper size={14} className="text-gray-400 mb-2" />
          <p className="text-2xl font-black text-gray-900">{noticiasProv.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Noticias recientes</p>
        </div>
      </div>

      {/* MUNICIPIOS — grid estilo Santa Cruz */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <Building2 size={14} className="text-gray-500" />
            Municipios e intendentes
          </h2>
          <Link
            href={`/admin/politicos?provincia=${provinciaSlug}`}
            className="text-xs font-bold text-[#E31E24] hover:underline inline-flex items-center gap-1"
          >
            <Plus size={11} /> Agregar municipio
          </Link>
        </div>

        {municipios.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-sm font-bold text-amber-900 mb-1">Sin municipios cargados</p>
            <p className="text-xs text-amber-800 mb-3">
              Cargá los municipios principales de {provincia.nombre} con sus intendentes y partido.
            </p>
            <Link
              href={`/admin/politicos?provincia=${provinciaSlug}`}
              className="inline-flex items-center gap-1.5 bg-[#E31E24] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700"
            >
              <Plus size={11} /> Configurar municipios
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {municipios.map(m => (
              <div
                key={m.id}
                className="border-2 border-gray-200 bg-white rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: m.partidoColor }}
                  />
                  <h3 className="font-black text-gray-900 text-sm leading-tight truncate">
                    {m.nombre}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-700">
                  <span className="text-gray-400">👤</span>
                  {m.intendenteNombre ? (
                    <span className="font-semibold">{m.intendenteNombre}</span>
                  ) : (
                    <span className="italic text-gray-400">Sin intendente</span>
                  )}
                </div>
                {m.partidoSlug && (
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">
                    {m.partidoSlug}
                  </p>
                )}
                {(m.imagenPositiva != null || m.imagenNegativa != null) && (
                  <div className="flex items-center gap-3 text-[11px] mt-2 pt-2 border-t border-gray-100">
                    {m.imagenPositiva != null && (
                      <span className="text-green-600 font-bold">↑ {m.imagenPositiva.toFixed(1)}%</span>
                    )}
                    {m.imagenNegativa != null && (
                      <span className="text-red-500 font-bold">↓ {m.imagenNegativa.toFixed(1)}%</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* POLÍTICOS por cargo */}
      {politicos.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Users size={14} className="text-gray-500" />
              Políticos monitoreados
            </h2>
            <Link
              href={`/admin/politicos?provincia=${provinciaSlug}`}
              className="text-xs font-bold text-[#E31E24] hover:underline inline-flex items-center gap-1"
            >
              <Plus size={11} /> Agregar
            </Link>
          </div>
          <div className="space-y-3">
            {Object.entries(politicosPorCargo).map(([cargo, lista]) => (
              <div key={cargo}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  {cargo}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lista.map(p => (
                    <Link
                      key={p.id}
                      href={`/imagen/${p.slug}`}
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-[#E31E24] transition-colors flex items-center justify-between gap-2"
                    >
                      <p className="font-bold text-sm text-gray-900 truncate">{p.nombre}</p>
                      <ExternalLink size={11} className="text-gray-300 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MEDIOS */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <Rss size={14} className="text-gray-500" />
            Medios locales configurados
          </h2>
          <Link
            href="/admin/medios"
            className="text-xs font-bold text-[#E31E24] hover:underline inline-flex items-center gap-1"
          >
            <Plus size={11} /> Agregar
          </Link>
        </div>
        {mediosProv.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-sm font-bold text-amber-900 mb-1">Sin medios configurados</p>
            <p className="text-xs text-amber-800 mb-3">
              Cargá medios locales con RSS, dominio (Google News) o URL de scraping.
              Sin esto el scanner no detecta noticias de la provincia.
            </p>
            <Link
              href="/admin/medios"
              className="inline-flex items-center gap-1.5 bg-[#E31E24] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700"
            >
              <Plus size={11} /> Agregar medio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mediosProv.map(m => {
              const tipo = m.urlRss ? 'rss' : m.dominio ? 'gnews' : 'scraping'
              const TipoIcon = tipo === 'rss' ? Rss : tipo === 'gnews' ? Globe : Code
              const color = tipo === 'rss'
                ? 'text-orange-500'
                : tipo === 'gnews' ? 'text-blue-500' : 'text-purple-500'
              return (
                <div key={m.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
                  <TipoIcon size={12} className={`${color} flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-900 truncate">{m.nombre}</p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {tipo === 'rss' ? 'RSS' : tipo === 'gnews' ? 'Google News' : 'Scraping HTML'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* NOTICIAS RECIENTES */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <Newspaper size={14} className="text-gray-500" />
            Últimas noticias detectadas
          </h2>
          <Link
            href={`/noticias?provincia=${provinciaSlug}`}
            className="text-xs font-bold text-[#E31E24] hover:underline"
          >
            Ver todo →
          </Link>
        </div>
        {noticiasProv.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500">
            {tieneMedios ? (
              <>Sin noticias detectadas todavía. El scanner corre cada 4 horas.</>
            ) : (
              <>Agregá medios locales arriba para que el scanner empiece a detectar noticias.</>
            )}
          </div>
        ) : (
          <div className="bg-white border rounded-xl divide-y divide-gray-100">
            {noticiasProv.slice(0, 10).map(n => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
              >
                <Newspaper size={12} className="text-gray-400 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-snug">{n.titulo}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {n.fuente} · {timeAgo(n.publicadoAt)}
                  </p>
                </div>
                <ExternalLink size={11} className="text-gray-300 flex-shrink-0 mt-1.5" />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Acceso rápido al mapa */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/mapa"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#E31E24] border border-gray-200 hover:border-[#E31E24] px-4 py-2 rounded-lg transition-colors"
        >
          <MapPin size={12} /> Ver {provincia.nombre} en el mapa
        </Link>
      </div>
    </div>
  )
}
