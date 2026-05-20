import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getProvincias } from '@/lib/supabase/queries'
import { getMediosLocales } from '@/lib/supabase/medios-queries'
import { fetchTodasLasNoticias } from '@/lib/sources/aggregator'
import {
  MapPin, Users, Newspaper, ArrowLeft, Plus, Rss, Globe, AlertTriangle, ExternalLink,
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

  // Santa Cruz tiene su tablero completo aparte
  if (provinciaSlug === 'santa-cruz') redirect('/santa-cruz')

  const provincias = await getProvincias().catch(() => [])
  const provincia = provincias.find(p => p.slug === provinciaSlug)
  if (!provincia) notFound()

  const supabase = await createClient()
  const [politicosRes, mediosLocalesTodos, noticias] = await Promise.all([
    supabase
      .from('politicos')
      .select('id, nombre, slug, cargo, activo')
      .eq('provincia_slug', provinciaSlug)
      .eq('activo', true)
      .order('cargo')
      .limit(50),
    getMediosLocales().catch(() => []),
    fetchTodasLasNoticias([]).catch(() => []),
  ])

  const politicos = politicosRes.data ?? []
  const mediosProv = mediosLocalesTodos.filter(m => m.provinciaSlug === provinciaSlug)

  // Filtrar noticias a las que detectan esta provincia o vienen de un medio de la provincia
  const nombresMediosProv = new Set(mediosProv.map(m => m.nombre))
  const noticiasProv = noticias
    .filter(n => n.provinciaSlug === provinciaSlug || nombresMediosProv.has(n.fuente))
    .slice(0, 20)

  const sinDatos = politicos.length === 0 && mediosProv.length === 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/tablero"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={12} /> Volver al tablero nacional
      </Link>

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={14} className="text-[#E31E24]" />
        <span className="text-xs font-bold text-[#E31E24] uppercase tracking-widest">
          Provincia de
        </span>
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-1">{provincia.nombre}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {provincia.gobernadorNombre ? `Gobernador: ${provincia.gobernadorNombre}` : 'Sin gobernador cargado'}
      </p>

      {sinDatos && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900 mb-1">Provincia sin datos cargados</p>
            <p className="text-xs text-amber-800">
              Esta provincia todavía no tiene políticos ni medios cargados.
              Usá los botones de abajo para empezar a configurarla.
            </p>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Link
          href="/admin/politicos"
          className="bg-white border-2 border-gray-200 hover:border-[#E31E24] rounded-xl p-4 transition-colors block"
        >
          <Users size={16} className="text-gray-700 mb-2" />
          <p className="text-2xl font-black text-gray-900">{politicos.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Políticos cargados</p>
          <p className="text-[10px] text-[#E31E24] font-bold mt-1 uppercase">Configurar →</p>
        </Link>
        <Link
          href="/admin/medios"
          className="bg-white border-2 border-gray-200 hover:border-[#E31E24] rounded-xl p-4 transition-colors block"
        >
          <Newspaper size={16} className="text-gray-700 mb-2" />
          <p className="text-2xl font-black text-gray-900">{mediosProv.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Medios locales</p>
          <p className="text-[10px] text-[#E31E24] font-bold mt-1 uppercase">Configurar →</p>
        </Link>
        <Link
          href={`/noticias?provincia=${provinciaSlug}`}
          className="bg-white border-2 border-gray-200 hover:border-[#E31E24] rounded-xl p-4 transition-colors block"
        >
          <Newspaper size={16} className="text-gray-700 mb-2" />
          <p className="text-2xl font-black text-gray-900">{noticiasProv.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Noticias últimas</p>
          <p className="text-[10px] text-[#E31E24] font-bold mt-1 uppercase">Ver feed →</p>
        </Link>
        <Link
          href="/mapa"
          className="bg-white border-2 border-gray-200 hover:border-[#E31E24] rounded-xl p-4 transition-colors block"
        >
          <MapPin size={16} className="text-gray-700 mb-2" />
          <p className="text-sm font-black text-gray-900 truncate">Mapa</p>
          <p className="text-xs text-gray-500 mt-0.5">Ver en mapa</p>
          <p className="text-[10px] text-[#E31E24] font-bold mt-1 uppercase">Abrir →</p>
        </Link>
      </div>

      {/* Políticos cargados */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide">
            Políticos monitoreados
          </h2>
          <Link
            href="/admin/politicos"
            className="text-xs font-bold text-[#E31E24] hover:underline inline-flex items-center gap-1"
          >
            <Plus size={11} /> Agregar
          </Link>
        </div>
        {politicos.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500">
            Sin políticos cargados.{' '}
            <Link href="/admin/politicos" className="text-[#E31E24] font-bold hover:underline">
              Agregar gobernador e intendentes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {politicos.map(p => (
              <Link
                key={p.id}
                href={`/imagen/${p.slug}`}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 hover:border-[#E31E24] transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{p.nombre}</p>
                  {p.cargo && (
                    <p className="text-[11px] text-gray-500 truncate">{p.cargo}</p>
                  )}
                </div>
                <ExternalLink size={11} className="text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Medios configurados */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide">
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
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500">
            Sin medios configurados.{' '}
            <Link href="/admin/medios" className="text-[#E31E24] font-bold hover:underline">
              Agregar medios (con RSS o solo dominio)
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mediosProv.map(m => (
              <div
                key={m.id}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-2"
              >
                {m.urlRss ? (
                  <Rss size={12} className="text-orange-500 flex-shrink-0" />
                ) : (
                  <Globe size={12} className="text-blue-500 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-gray-900 truncate">{m.nombre}</p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {m.urlRss ? `RSS · ${m.urlRss}` : m.dominio ? `Google News · ${m.dominio}` : 'sin fuente'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Últimas noticias */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide">
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
            Sin noticias detectadas todavía. Asegurate de tener medios configurados arriba.
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
    </div>
  )
}
