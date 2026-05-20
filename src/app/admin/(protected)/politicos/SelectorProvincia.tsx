'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

interface ProvinciaMin {
  id: number
  slug: string
  nombre: string
}

interface Props {
  provincias: ProvinciaMin[]
  provinciaActivaSlug: string
}

export function SelectorProvincia({ provincias, provinciaActivaSlug }: Props) {
  const router = useRouter()
  const activa = provincias.find(p => p.slug === provinciaActivaSlug)

  return (
    <div className="bg-gray-900 text-white rounded-xl p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#E31E24]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Editando provincia
            </p>
            <p className="text-lg font-black">{activa?.nombre ?? provinciaActivaSlug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-gray-400">Cambiar:</label>
          <select
            value={provinciaActivaSlug}
            onChange={e => router.push(`/admin/politicos?provincia=${e.target.value}`)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {provincias.map(p => (
              <option key={p.slug} value={p.slug}>{p.nombre}</option>
            ))}
          </select>

          {activa && (
            <Link
              href={`/tablero/${activa.slug}`}
              className="text-xs font-bold text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg"
            >
              Ver tablero →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
