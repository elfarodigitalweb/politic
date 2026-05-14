import Link from 'next/link'
import Image from 'next/image'
import type { Article } from '@/types'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { timeAgo } from '@/lib/utils/date'

interface Props {
  article: Article
}

export function HeroArticle({ article }: Props) {
  return (
    <article className="group relative w-full aspect-[16/8] md:aspect-[16/6] rounded-xl overflow-hidden bg-gray-900">
      <Image
        src={article.heroImage.url}
        alt={article.heroImage.alternativeText || article.title}
        fill
        className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <CategoryBadge category={article.category} />
        <Link href={`/${article.category.slug}/${article.slug}`}>
          <h1 className="mt-2 text-white font-black text-xl md:text-3xl lg:text-4xl leading-tight max-w-3xl group-hover:underline decoration-[#E31E24]">
            {article.title}
          </h1>
        </Link>
        <p className="mt-2 text-gray-200 text-sm md:text-base max-w-2xl line-clamp-2 hidden sm:block">
          {article.subtitle}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-300">
          <span>{article.author.name}</span>
          <span>·</span>
          <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time>
        </div>
      </div>
    </article>
  )
}
