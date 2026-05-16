'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { BadgeCargo } from '@/components/imagen/BadgeCargo'

interface PoliticoResult {
  id: number
  nombre: string
  slug: string
  cargo: string
  provinciaSlug: string
  fotoUrl: string | null
  imagenPositiva: number | null
  imagenNegativa: number | null
}

interface Props {
  politicos: PoliticoResult[]
}

export function BuscarClient({ politicos }: Props) {
  const [query, setQuery] = useState('')

  const resultados = query.trim().length < 2
    ? politicos
    : politicos.filter((p) =>
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        p.cargo.toLowerCase().includes(query.toLowerCase()) ||
        p.provinciaSlug.replace(/-/g, ' ').includes(query.toLowerCase())
      )

  return (
    <div>
      {/* Input de búsqueda */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          autoFocus
          placeholder="Buscá por nombre, cargo o provincia..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 focus:border-[#E31E24] rounded-xl text-base focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Resultados */}
      <p className="text-xs text-gray-400 mb-3">
        {query.trim().length >= 2
          ? `${resultados.length} resultado${resultados.length !== 1 ? 's' : ''} para "${query}"`
          : `${politicos.length} políticos monitoreados`}
      </p>

      {resultados.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-10 text-center text-gray-400">
          <Search size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Sin resultados para &ldquo;{query}&rdquo;</p>
          <p className="text-sm mt-1">Probá con el apellido o con el cargo</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {resultados.map((p) => (
            <Link
              key={p.id}
              href={`/imagen/${p.slug}`}
              className="bg-white rounded-xl border border-gray-200 hover:border-[#E31E24] hover:shadow-md transition-all p-4 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {p.fotoUrl ? (
                  <Image
                    src={p.fotoUrl}
                    alt={p.nombre}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="font-black text-gray-400 text-lg">{p.nombre.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 group-hover:text-[#E31E24] transition-colors">
                  {p.nombre}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <BadgeCargo cargo={p.cargo} />
                  <span className="text-xs text-gray-400 capitalize">
                    {p.provinciaSlug.replace(/-/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                {p.imagenPositiva !== null ? (
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp size={12} />
                        <span className="text-sm font-black">{p.imagenPositiva.toFixed(0)}%</span>
                      </div>
                      <p className="text-[9px] text-gray-400">positiva</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-red-500">
                        <TrendingDown size={12} />
                        <span className="text-sm font-black">
                          {(p.imagenNegativa ?? 0).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-400">negativa</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Sin datos</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
