import type { Metadata } from 'next'
import Link from 'next/link'
import { getProvincias } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Users, Newspaper, ArrowRight, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tablero Político Provincial — Portal Político',
  description: 'Monitoreo político por provincia. 24 provincias + CABA.',
}

export const revalidate = 120

// Provincia "destacada" que tiene tablero completo armado
const PROVINCIA_COMPLETA = 'santa-cruz'

export default async function TableroIndexPage() {
  const supabase = await createClient()

  const [provincias, politicosRes, mediosRes] = await Promise.all([
    getProvincias().catch(() => []),
    supabase.from('politicos').select('provincia_slug').eq('activo', true),
    supabase.from('medios_locales').select('provincia_slug').eq('activo', true),
  ])

  // Conteos por provincia
  const politicosPorProv = (politicosRes.data ?? []).reduce<Record<string, number>>(
    (acc, p) => {
      acc[p.provincia_slug] = (acc[p.provincia_slug] ?? 0) + 1
      return acc
    },
    {}
  )
  const mediosPorProv = (mediosRes.data ?? []).reduce<Record<string, number>>(
    (acc, m) => {
      acc[m.provincia_slug] = (acc[m.provincia_slug] ?? 0) + 1
      return acc
    },
    {}
  )

  // Total nacional
  const totalPoliticos = Object.values(politicosPorProv).reduce((a, b) => a + b, 0)
  const totalMedios = Object.values(mediosPorProv).reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={16} className="text-[#E31E24]" />
        <span className="text-xs font-bold text-[#E31E24] uppercase tracking-widest">
          Tablero Nacional
        </span>
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-1">Tablero Político Provincial</h1>
      <p className="text-sm text-gray-500 mb-6">
        Monitoreo provincia por provincia · {provincias.length} provincias configuradas ·{' '}
        {totalPoliticos} políticos · {totalMedios} medios
      </p>

      {/* Provincia destacada con tablero completo */}
      {(() => {
        const sc = provincias.find(p => p.slug === PROVINCIA_COMPLETA)
        if (!sc) return null
        return (
          <Link
            href="/santa-cruz"
            className="block mb-6 bg-gray-900 hover:bg-black text-white rounded-2xl p-6 transition-colors group"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#E31E24]">
                    Tablero completo
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    · Destacada
                  </span>
                </div>
                <h2 className="text-2xl font-black mb-1">{sc.nombre}</h2>
                <p className="text-sm text-gray-300">
                  16 localidades · alertas en tiempo real · gobernador y 16 intendentes
                </p>
                {sc.gobernadorNombre && (
                  <p className="text-xs text-gray-400 mt-1">Gob. {sc.gobernadorNombre}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold group-hover:translate-x-1 transition-transform">
                Abrir tablero <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        )
      })()}

      <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide mb-3">
        Todas las provincias
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Hacé click en una provincia para ver políticos cargados, medios configurados y empezar
        a monitorearla. Las que tienen badge ámbar todavía no tienen datos cargados.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {provincias
          .filter(p => p.slug !== PROVINCIA_COMPLETA)
          .map(p => {
            const cantPoliticos = politicosPorProv[p.slug] ?? 0
            const cantMedios = mediosPorProv[p.slug] ?? 0
            const sinDatos = cantPoliticos === 0 && cantMedios === 0
            return (
              <Link
                key={p.slug}
                href={`/tablero/${p.slug}`}
                className={`border-2 rounded-xl p-4 transition-colors block hover:shadow-md ${
                  sinDatos
                    ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400'
                    : 'border-gray-200 bg-white hover:border-[#E31E24]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.partidoColor }}
                      />
                      <h3 className="font-black text-gray-900 text-sm leading-tight truncate">
                        {p.nombre}
                      </h3>
                    </div>
                    {p.gobernadorNombre && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Gob. {p.gobernadorNombre}
                      </p>
                    )}
                  </div>
                  {sinDatos && (
                    <span title="Sin datos cargados">
                      <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-1" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-600 border-t border-gray-100 pt-2 mt-2">
                  <span className="flex items-center gap-1">
                    <Users size={11} className="text-gray-400" />
                    <span className="font-bold text-gray-900">{cantPoliticos}</span> políticos
                  </span>
                  <span className="flex items-center gap-1">
                    <Newspaper size={11} className="text-gray-400" />
                    <span className="font-bold text-gray-900">{cantMedios}</span> medios
                  </span>
                </div>
              </Link>
            )
          })}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
        <p className="font-bold mb-1">📊 Cómo cargar una nueva provincia</p>
        <p>
          1. Entrá a <Link href="/admin/politicos" className="underline font-bold">/admin/politicos</Link> y agregá gobernador + intendentes principales.{' '}
          2. En <Link href="/admin/medios" className="underline font-bold">/admin/medios</Link> sumá los medios locales (RSS o solo dominio).{' '}
          3. El scanner empieza a traer alertas automáticamente cada 4 hs.
        </p>
      </div>
    </div>
  )
}
