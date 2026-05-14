import Link from 'next/link'
import type { Category } from '@/types'

interface Props {
  category: Category
  linked?: boolean
}

export function CategoryBadge({ category, linked = true }: Props) {
  const badge = (
    <span
      className="inline-block text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
      style={{ backgroundColor: category.color + '20', color: category.color }}
    >
      {category.name}
    </span>
  )

  if (!linked) return badge
  return <Link href={`/${category.slug}`}>{badge}</Link>
}
