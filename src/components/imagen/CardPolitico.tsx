import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, TrendingDown, Clock, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import type { PoliticoConImagen } from '@/types/imagen'
import { BadgeCargo } from './BadgeCargo'

interface Props {
  politico: PoliticoConImagen
  rank: number
}

export function CardPolitico({ politico, rank }: Props) {
  const img = politico.imagenActual
  const delta = politico.deltaImagen

  return (
    <Link
      href={`/imagen/${politico.slug}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-[#E31E24] hover:shadow-md transition-all p-4 flex items-center gap-4"
    >
      <span className="text-2xl font-black text-gray-300 w-7 text-center flex-shrink-0">
        {rank}
      </span>

      {/* Foto o inicial */}
      <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {politico.fotoUrl ? (
          <Image
            src={politico.fotoUrl}
            alt={politico.nombre}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <span className="text-gray-400 font-black text-lg">{politico.nombre.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-black text-gray-900 truncate group-hover:text-[#E31E24] transition-colors">
            {politico.nombre}
          </p>
          {/* Delta badge */}
          {delta !== null && Math.abs(delta) >= 0.5 && (
            <span
              className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                delta > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {delta > 0 ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
              {Math.abs(delta).toFixed(1)}pp
            </span>
          )}
          {delta !== null && Math.abs(delta) < 0.5 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
              <Minus size={9} />
              estable
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <BadgeCargo cargo={politico.cargo} />
          <span className="text-xs text-gray-400 capitalize truncate">
            {politico.provinciaSlug.replace(/-/g, ' ')}
          </span>
        </div>
        {politico.partidoNombre && (
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: politico.partidoColor }}
            />
            <span className="text-[10px] text-gray-400 truncate">{politico.partidoNombre}</span>
          </div>
        )}
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
