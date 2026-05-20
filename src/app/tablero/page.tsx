import type { Metadata } from 'next'
import Link from 'next/link'
import { getProvincias } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { MapPin, ArrowRight } from 'lucide-react'
import BuscadorProvincias, { type ProvinciaCard } from './BuscadorProvincias'

export const metadata: Metadata = {
  title: 'Tablero Político Provincial — Portal Político',
  description: 'Monitoreo político por provincia. 24 provincias + CABA.',
}

export const revalidate = 60

const PROVINCIA_DESTACADA = 'santa-cruz'

export default async function TableroIndexPage() {
  const supabase = await createClient()
  const limiteFecha = new Date(Date.now() - 10 * 86_400_000).toISOString()

  const [provincias, politicosRes, mediosRes, alertasRes] = await Promise.all([
    getProvincias().catch(() => []),
    supabase.from('politicos').select('provincia_slug').eq('activo', true),
    supabase.from('medios_locales').select('provincia_slug').eq('activo', true),
    supabase
      .from('problematicas_sc')
      .select('provincia_slug, severidad')
      .gte('publicado_at', limiteFecha),
  ])

  const politicosPorProv = (politicosRes.data ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.provincia_slug] = (acc[p.provincia_slug] ?? 0) + 1
    return acc
  }, {})
  const mediosPorProv = (mediosRes.data ?? []).reduce<Record<string, number>>((acc, m) => {
    acc[m.provincia_slug] = (acc[m.provincia_slug] ?? 0) + 1
    return acc
  }, {})
  const alertasPorProv: Record<string, { total: number; crisis: number }> = {}
  for (const a of alertasRes.data ?? []) {
    const slug = a.provincia_slug ?? 'santa-cruz'
    if (!alertasPorProv[slug]) alertasPorProv[slug] = { total: 0, crisis: 0 }
    alertasPorProv[slug].total += 1
    if (a.severidad === 3) alertasPorProv[slug].crisis += 1
  }

  const totalPoliticos = Object.values(politicosPorProv).reduce((a, b) => a + b, 0)
  const totalMedios = Object.values(mediosPorProv).reduce((a, b) => a + b, 0)
  const totalAlertas = Object.values(alertasPorProv).reduce((sum, v) => sum + v.total, 0)

  const cardsProvincias: ProvinciaCard[] = provincias
    .filter(p => p.slug !== PROVINCIA_DESTACADA)
    .map(p => ({
      slug: p.slug,
      nombre: p.nombre,
      gobernadorNombre: p.gobernadorNombre,
      partidoColor: p.partidoColor,
      cantPoliticos: politicosPorProv[p.slug] ?? 0,
      cantMedios: mediosPorProv[p.slug] ?? 0,
      cantAlertas: alertasPorProv[p.slug]?.total ?? 0,
      crisis: alertasPorProv[p.slug]?.crisis ?? 0,
    }))

  const sc = provincias.find(p => p.slug === PROVINCIA_DESTACADA)
  const scStats = sc ? alertasPorProv[sc.slug] : null

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
        {provincias.length} provincias · {totalPoliticos} políticos · {totalMedios} medios ·{' '}
        {totalAlertas} alertas últimos 10 días
      </p>

      {/* Provincia destacada */}
      {sc && (
        <Link
          href="/santa-cruz"
          className="block mb-6 bg-gray-900 hover:bg-black text-white rounded-2xl p-6 transition-colors group"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E31E24]">
                  Tablero completo destacado
                </span>
              </div>
              <h2 className="text-2xl font-black mb-1">{sc.nombre}</h2>
              <p className="text-sm text-gray-300">
                16 localidades · alertas en tiempo real · gobernador y 16 intendentes
                {scStats && scStats.total > 0 && ` · ${scStats.total} alertas activas`}
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
      )}

      <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide mb-3">
        Todas las provincias
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Buscá una provincia por nombre o gobernador. Las que no tienen datos cargados aparecen con badge ámbar.
        Click en cualquiera para abrir su tablero, refrescar alertas y configurarla.
      </p>

      <BuscadorProvincias provincias={cardsProvincias} />

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
        <p className="font-bold mb-1">📊 Cómo configurar una provincia nueva</p>
        <p>
          Entrá al tablero de la provincia, seguí el wizard de 4 pasos:
          (1) gobernador, (2) municipios e intendentes, (3) políticos a monitorear,
          (4) medios locales. El scanner empieza a traer alertas automáticamente.
        </p>
      </div>
    </div>
  )
}
