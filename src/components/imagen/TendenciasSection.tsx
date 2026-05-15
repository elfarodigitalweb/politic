import { TrendingUp, TrendingDown, Minus, PlayCircle, Search } from 'lucide-react'
import type { TendenciaDB } from '@/lib/supabase/tendencias-queries'

interface Props {
  tendencias: TendenciaDB[]
}

const PLATAFORMA_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  google_trends: {
    label: 'Google Trends',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Search size={14} className="text-blue-600" />,
  },
  youtube: {
    label: 'YouTube',
    color: 'bg-red-50 border-red-200 text-red-800',
    icon: <PlayCircle size={14} className="text-red-600" />,
  },
}

export function TendenciasSection({ tendencias }: Props) {
  if (tendencias.length === 0) return null

  // Tomar la más reciente por plataforma
  const byPlataforma = tendencias.reduce<Record<string, TendenciaDB>>((acc, t) => {
    if (!acc[t.plataforma]) acc[t.plataforma] = t
    return acc
  }, {})

  return (
    <div className="mt-6 space-y-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        Presencia Digital
      </p>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(byPlataforma).map(([plataforma, tendencia]) => {
          const config = PLATAFORMA_CONFIG[plataforma]
          if (!config) return null

          const valor = tendencia.valor
          const TrendIcon = valor > 50 ? TrendingUp : valor > 20 ? Minus : TrendingDown
          const trendColor = valor > 50 ? 'text-green-600' : valor > 20 ? 'text-gray-400' : 'text-red-500'

          return (
            <div key={plataforma} className={`rounded-xl border p-3 flex items-center justify-between ${config.color}`}>
              <div className="flex items-center gap-2">
                {config.icon}
                <span className="text-xs font-semibold">{config.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendIcon size={14} className={trendColor} />
                <span className="text-sm font-black">{valor}/100</span>
                {tendencia.total > 0 && (
                  <span className="text-[10px] opacity-70">({tendencia.total} items)</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
