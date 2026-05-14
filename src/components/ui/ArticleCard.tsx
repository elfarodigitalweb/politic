import Link from 'next/link'
import Image from 'next/image'
import type { Article } from '@/types'
import { CategoryBadge } from './CategoryBadge'
import { timeAgo } from '@/lib/utils/date'

interface Props {
  article: Article
  priority?: boolean
}

export function ArticleCard({ article, priority = false }: Props) {
  return (
    <article className="group flex flex-col gap-3">
      <Link href={`/${article.category.slug}/${article.slug}`} className="block overflow-hidden rounded-lg">
        <div className="relative aspect-[16/9] bg-gray-100">
          <Image
            src={article.heroImage.url}
            alt={article.heroImage.alternativeText || article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {article.isLive && (
            <span className="absolute top-2 left-2 bg-[#E31E24] text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide animate-pulse">
              En vivo
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1.5">
        <CategoryBadge category={article.category} />
        <Link href={`/${article.category.slug}/${article.slug}`}>
          <h2 className="font-bold text-gray-900 leading-snug text-base group-hover:text-[#E31E24] transition-colors line-clamp-3">
            {article.title}
          </h2>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
        <time className="text-xs text-gray-400" dateTime={article.publishedAt}>
          {timeAgo(article.publishedAt)}
        </time>
      </div>
    </article>
  )
}

export function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-[16/9] bg-gray-200 rounded-lg" />
      <div className="h-4 w-20 bg-gray-200 rounded" />
      <div className="space-y-1.5">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-24" />
    </div>
  )
}
