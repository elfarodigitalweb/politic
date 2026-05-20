'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Users, Newspaper, AlertTriangle, AlertCircle } from 'lucide-react'

export type ProvinciaCard = {
  slug: string
  nombre: string
  gobernadorNombre: string | null
  partidoColor: string
  cantPoliticos: number
  cantMedios: number
  cantAlertas: number
  crisis: number
}

export default function BuscadorProvincias({ provincias }: { provincias: ProvinciaCard[] }) {
  const [q, setQ] = useState('')

  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return provincias
    return provincias.filter(
      p =>
        p.nombre.toLowerCase().includes(term) ||
        p.slug.includes(term) ||
        (p.gobernadorNombre && p.gobernadorNombre.toLowerCase().includes(term))
    )
  }, [q, provincias])

  return (
    <>
      <div className="mb-4 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar provincia (ej: córdoba, mendoza, jujuy)..."
          className="w-full border-2 border-gray-200 focus:border-[#E31E24] rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none transition-colors"
        />
        {q && (
          <button
            onClick={() => setQ('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
          >
            limpiar
          </button>
        )}
      </div>

      {filtradas.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
          Ninguna provincia matchea &quot;{q}&quot;
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtradas.map(p => {
            const sinDatos = p.cantPoliticos === 0 && p.cantMedios === 0
            return (
              <Link
                key={p.slug}
                href={`/tablero/${p.slug}`}
                className={`border-2 rounded-xl p-4 transition-colors block hover:shadow-md ${
                  sinDatos
                    ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400'
                    : p.crisis > 0
                      ? 'border-red-200 bg-red-50/40 hover:border-red-400'
                      : 'border-gray-200 bg-white hover:border-[#E31E24]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.partidoColor }} />
                      <h3 className="font-black text-gray-900 text-sm leading-tight truncate">
                        {p.nombre}
                      </h3>
                    </div>
                    {p.gobernadorNombre ? (
                      <p className="text-xs text-gray-500 mt-1 truncate">Gob. {p.gobernadorNombre}</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1 italic">Sin gobernador cargado</p>
                    )}
                  </div>
                  {p.crisis > 0 ? (
                    <span title={`${p.crisis} crisis activas`} className="flex items-center gap-0.5 text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full">
                      <AlertCircle size={10} /> {p.crisis}
                    </span>
                  ) : sinDatos ? (
                    <span title="Sin datos cargados">
                      <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-1" />
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-600 border-t border-gray-100 pt-2 mt-2">
                  <span className="flex items-center gap-1">
                    <Users size={11} className="text-gray-400" />
                    <span className="font-bold text-gray-900">{p.cantPoliticos}</span> políticos
                  </span>
                  <span className="flex items-center gap-1">
                    <Newspaper size={11} className="text-gray-400" />
                    <span className="font-bold text-gray-900">{p.cantMedios}</span> medios
                  </span>
                  {p.cantAlertas > 0 && (
                    <span className="flex items-center gap-1 ml-auto">
                      <span className="font-bold text-gray-900">{p.cantAlertas}</span> alertas
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
