'use client'

import { X, User, TrendingUp, TrendingDown, MapPin } from 'lucide-react'
import type { Municipio, CiudadSC } from '@/types/mapa'

interface Props {
  municipio: Municipio
  ciudadesDepto?: CiudadSC[]
  onClose: () => void
  onCiudadClick?: (ciudad: CiudadSC) => void
}

export function PanelDetalle({ municipio, ciudadesDepto = [], onClose, onCiudadClick }: Props) {
  const tieneImagen = municipio.imagenPositiva !== null && municipio.imagenNegativa !== null

  return (
    <div className="absolute top-4 right-4 z-[1000] w-72 bg-white rounded-xl shadow-xl overflow-hidden sm:w-80">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between mb-2">
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
          >
            <X size={18} />
          </button>
        </div>

        {/* Intendente */}
        {municipio.intendenteNombre ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <User size={13} className="flex-shrink-0 text-gray-400" />
            <span>{municipio.intendenteNombre}</span>
          </div>
        ) : ciudadesDepto.length === 0 ? (
          <p className="text-xs text-gray-400 italic mb-2">Sin intendente cargado</p>
        ) : null}

        {/* Imagen política */}
        {tieneImagen && (
          <div className="flex gap-2 mb-2">
            <div className="flex-1 bg-green-50 rounded-lg p-2 text-center">
              <TrendingUp size={12} className="text-green-600 mx-auto mb-0.5" />
              <p className="text-xl font-black text-green-700 leading-none">
                {municipio.imagenPositiva?.toFixed(0)}%
              </p>
              <p className="text-[9px] text-green-600 mt-0.5">Positiva</p>
            </div>
            <div className="flex-1 bg-red-50 rounded-lg p-2 text-center">
              <TrendingDown size={12} className="text-red-500 mx-auto mb-0.5" />
              <p className="text-xl font-black text-red-600 leading-none">
                {municipio.imagenNegativa?.toFixed(0)}%
              </p>
              <p className="text-[9px] text-red-500 mt-0.5">Negativa</p>
            </div>
          </div>
        )}
      </div>

      {/* Localidades del departamento */}
      {ciudadesDepto.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin size={10} />
            Localidades ({ciudadesDepto.length})
          </p>
          <div className="space-y-1">
            {ciudadesDepto.map((ciudad) => (
              <button
                key={ciudad.id}
                onClick={() => onCiudadClick?.(ciudad)}
                className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ciudad.partidoColor }}
                  />
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-[#E31E24] transition-colors truncate">
                    {ciudad.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {ciudad.intendenteNombre ? (
                    <span className="text-xs text-gray-500 truncate max-w-[90px]">
                      {ciudad.intendenteNombre}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-semibold">sin datos</span>
                  )}
                  {ciudad.imagenPositiva !== null && (
                    <span className="text-[10px] font-black text-green-600">
                      {ciudad.imagenPositiva.toFixed(0)}%
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Click en una localidad para ver su detalle</p>
        </div>
      )}

      {/* Placeholder noticias */}
      {ciudadesDepto.length === 0 && (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Últimas noticias
          </p>
          <p className="text-xs text-gray-400 italic">Próximamente</p>
        </div>
      )}
    </div>
  )
}
