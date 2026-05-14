import Link from 'next/link'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import type { PoliticoConImagen } from '@/types/imagen'
import { BadgeCargo } from './BadgeCargo'

interface Props {
  politico: PoliticoConImagen
  rank: number
}

export function CardPolitico({ politico, rank }: Props) {
  const img = politico.imagenActual
  return (
    <Link
      href={`/imagen/${politico.slug}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-[#E31E24] hover:shadow-md transition-all p-4 flex items-center gap-4"
    >
      <span className="text-2xl font-black text-gray-300 w-8 text-center flex-shrink-0">
        {rank}
      </span>
      <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400 font-black text-lg">
        {politico.nombre.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-gray-900 truncate group-hover:text-[#E31E24] transition-colors">
          {politico.nombre}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <BadgeCargo cargo={politico.cargo} />
          <span className="text-xs text-gray-400 truncate">
            {politico.provinciaSlug.replace(/-/g, ' ')}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        {img ? (
          <>
            <div className="flex items-center gap-3 justify-end">
              <div className="text-center">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={12} />
                  <span className="text-sm font-black">{img.imagenPositiva.toFixed(0)}%</span>
                </div>
                <p className="text-[9px] text-gray-400">positiva</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-red-500">
                  <TrendingDown size={12} />
                  <span className="text-sm font-black">{img.imagenNegativa.toFixed(0)}%</span>
                </div>
                <p className="text-[9px] text-gray-400">negativa</p>
              </div>
            </div>
            <p className="text-[9px] text-gray-400 mt-1">{img.totalMenciones} menciones</p>
          </>
        ) : (
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock size={12} />
            <span>Sin datos</span>
          </div>
        )}
      </div>
    </Link>
  )
}
