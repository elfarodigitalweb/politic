import { ExternalLink } from 'lucide-react'
import type { NoticiaItem } from '@/types/noticias'
import { BadgeProvincia } from './BadgeProvincia'
import { timeAgo } from '@/lib/utils/date'

export function NoticiaCard({ noticia }: { noticia: NoticiaItem }) {
  return (
    <article className="bg-white rounded-xl border border-gray-200 hover:border-[#E31E24] hover:shadow-sm transition-all p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <BadgeProvincia slug={noticia.provinciaSlug} nombre={noticia.provinciaNombre} />
            <span className="text-xs text-gray-400">{noticia.fuente}</span>
            <span className="text-xs text-gray-300">·</span>
            <time className="text-xs text-gray-400" dateTime={noticia.publicadoAt}>
              {timeAgo(noticia.publicadoAt)}
            </time>
          </div>
          <a
            href={noticia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-[#E31E24] transition-colors leading-snug line-clamp-2 text-sm"
          >
            {noticia.titulo}
          </a>
        </div>
        <a
          href={noticia.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir noticia"
          className="text-gray-300 hover:text-[#E31E24] transition-colors flex-shrink-0 mt-1"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </article>
  )
}
