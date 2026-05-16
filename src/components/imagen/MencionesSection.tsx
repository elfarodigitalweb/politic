import { ExternalLink } from 'lucide-react'
import type { Mencion } from '@/types/imagen'
import { detectarTema, TEMA_COLORES } from '@/lib/utils/temas'
import { timeAgo } from '@/lib/utils/date'

interface Props {
  menciones: Mencion[]
}

const SENTIMIENTO_STYLES = {
  positivo: 'bg-green-100 text-green-700',
  negativo: 'bg-red-100 text-red-600',
  neutral: 'bg-gray-100 text-gray-500',
}

const FUENTE_LABELS: Record<string, string> = {
  rss: 'RSS',
  google_news: 'Google News',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
}

export function MencionesSection({ menciones }: Props) {
  if (menciones.length === 0) {
    return (
      <div className="mt-6 bg-gray-50 rounded-xl p-5 text-center">
        <p className="text-sm text-gray-500">
          No hay menciones registradas aún — ejecutá el análisis desde el panel admin.
        </p>
      </div>
    )
  }

  const positivas = menciones.filter((m) => m.sentimiento === 'positivo').length
  const negativas = menciones.filter((m) => m.sentimiento === 'negativo').length
  const neutrales = menciones.filter((m) => m.sentimiento === 'neutral').length

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black text-gray-700 uppercase tracking-wide">
          Menciones recientes
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
            {positivas} +
          </span>
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
            {negativas} −
          </span>
          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
            {neutrales} ~
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {menciones.map((m) => {
          const tema = detectarTema(m.titulo)
          const temaColor = TEMA_COLORES[tema]
          const sentColor = SENTIMIENTO_STYLES[m.sentimiento] ?? SENTIMIENTO_STYLES.neutral

          return (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${sentColor}`}>
                      {m.sentimiento}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${temaColor}`}>
                      {tema}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 leading-snug">{m.titulo}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {FUENTE_LABELS[m.fuente] ?? m.fuente} · {timeAgo(m.publicadoAt)}
                  </p>
                </div>
                {m.url && (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#E31E24] transition-colors flex-shrink-0 mt-0.5"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
