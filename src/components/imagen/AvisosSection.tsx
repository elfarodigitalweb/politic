import { ExternalLink, DollarSign, Eye, Megaphone } from 'lucide-react'
import type { AvisoDB } from '@/lib/supabase/avisos-queries'

interface Props {
  avisos: AvisoDB[]
  gastoTotal: { min: number; max: number; totalAvisos: number }
}

export function AvisosSection({ avisos, gastoTotal }: Props) {
  if (avisos.length === 0) return null

  function formatGasto(min: number, max: number): string {
    if (min === 0 && max === 0) return 'Sin datos'
    if (min === max) return `$${min.toLocaleString('es-AR')}`
    return `$${min.toLocaleString('es-AR')} – $${max.toLocaleString('es-AR')}`
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone size={16} className="text-[#E31E24]" />
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
          Publicidad Política
        </h3>
      </div>

      {/* Resumen de gasto */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <DollarSign size={16} className="text-blue-600 mx-auto mb-1" />
          <p className="text-sm font-black text-blue-800">
            {formatGasto(gastoTotal.min, gastoTotal.max)}
          </p>
          <p className="text-[10px] text-blue-600">Gasto estimado total</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <Eye size={16} className="text-purple-600 mx-auto mb-1" />
          <p className="text-sm font-black text-purple-800">{gastoTotal.totalAvisos}</p>
          <p className="text-[10px] text-purple-600">Avisos activos/recientes</p>
        </div>
      </div>

      {/* Lista de avisos */}
      <div className="space-y-2">
        {avisos.slice(0, 5).map(aviso => (
          <div key={aviso.id} className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-gray-700 leading-relaxed line-clamp-2 flex-1">
                {aviso.texto}
              </p>
              {aviso.urlPreview && (
                <a
                  href={aviso.urlPreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#E31E24] flex-shrink-0"
                  aria-label="Ver aviso"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              {aviso.gastoMin !== null && (
                <span className="text-[10px] text-gray-500">
                  {formatGasto(aviso.gastoMin ?? 0, aviso.gastoMax ?? 0)}
                </span>
              )}
              {aviso.fechaInicio && (
                <span className="text-[10px] text-gray-400">
                  {new Date(aviso.fechaInicio).toLocaleDateString('es-AR')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
