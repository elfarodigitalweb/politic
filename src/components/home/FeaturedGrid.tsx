import type { Article } from '@/types'
import { ArticleCard } from '@/components/ui/ArticleCard'

interface Props {
  articles: Article[]
}

export function FeaturedGrid({ articles }: Props) {
  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}
