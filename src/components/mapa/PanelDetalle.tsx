'use client'

import { X, User, TrendingUp, TrendingDown } from 'lucide-react'
import type { Municipio } from '@/types/mapa'

interface Props {
  municipio: Municipio
  onClose: () => void
}

export function PanelDetalle({ municipio, onClose }: Props) {
  const tieneImagen =
    municipio.imagenPositiva !== null && municipio.imagenNegativa !== null

  return (
    <div className="absolute top-4 right-4 z-[1000] w-72 bg-white rounded-xl shadow-xl p-4 sm:w-80">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-gray-900 text-lg leading-tight truncate">
            {municipio.nombre}
          </h2>
          {municipio.partidoSlug && (
            <span
              className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded mt-1 inline-block"
              style={{
                backgroundColor: municipio.partidoColor + '25',
                color: municipio.partidoColor,
              }}
            >
              {municipio.partidoSlug.replace(/-/g, ' ')}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition-colors ml-2 flex-shrink-0 p-0.5"
          aria-label="Cerrar panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Intendente */}
      {municipio.intendenteNombre ? (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <User size={14} className="flex-shrink-0 text-gray-400" />
          <span>{municipio.intendenteNombre}</span>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic mb-3">Sin intendente cargado</p>
      )}

      {/* Imagen política */}
      {tieneImagen ? (
        <div className="space-y-2 mb-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            Imagen política
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-green-50 rounded-lg p-2.5 text-center">
              <TrendingUp size={14} className="text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-black text-green-700 leading-none">
                {municipio.imagenPositiva?.toFixed(0)}%
              </p>
              <p className="text-[10px] text-green-600 mt-0.5">Positiva</p>
            </div>
            <div className="flex-1 bg-red-50 rounded-lg p-2.5 text-center">
              <TrendingDown size={14} className="text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-black text-red-600 leading-none">
                {municipio.imagenNegativa?.toFixed(0)}%
              </p>
              <p className="text-[10px] text-red-500 mt-0.5">Negativa</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic mb-3">Sin datos de imagen</p>
      )}

      {/* Noticias placeholder */}
      <div className="border-t border-gray-100 pt-3">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Últimas noticias
        </p>
        <p className="text-xs text-gray-400 italic">Próximamente</p>
      </div>
    </div>
  )
}
