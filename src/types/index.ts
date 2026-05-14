export interface MediaAsset {
  id: number
  url: string
  alternativeText: string
  width: number
  height: number
}

export interface Category {
  id: number
  name: string
  slug: string
  color: string
  description: string
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface Author {
  id: number
  name: string
  slug: string
  bio: string
  avatar: MediaAsset
  social: { twitter?: string; linkedin?: string }
}

export interface SEOMeta {
  metaTitle: string
  metaDescription: string
  ogImage: MediaAsset
  keywords: string[]
  canonicalUrl?: string
}

export type RichTextBlock =
  | { type: 'paragraph'; children: { type: 'text'; text: string }[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4; children: { type: 'text'; text: string }[] }
  | { type: 'image'; image: MediaAsset; caption?: string }
  | { type: 'quote'; children: { type: 'text'; text: string }[] }

export interface Article {
  id: number
  slug: string
  title: string
  subtitle: string
  excerpt: string
  body: RichTextBlock[]
  heroImage: MediaAsset
  category: Category
  tags: Tag[]
  author: Author
  publishedAt: string
  updatedAt: string
  isBreaking: boolean
  isLive: boolean
  isFeatured: boolean
  readingTime: number
  seo: SEOMeta
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export type Province =
  | 'santa-cruz'
  | 'buenos-aires'
  | 'cordoba'
  | 'santa-fe'
  | 'mendoza'
  | 'tucuman'
  | 'entre-rios'
  | 'chaco'
  | 'corrientes'
  | 'misiones'
  | 'salta'
  | 'santiago-del-estero'
  | 'san-juan'
  | 'jujuy'
  | 'rio-negro'
  | 'neuquen'
  | 'formosa'
  | 'chubut'
  | 'san-luis'
  | 'catamarca'
  | 'la-pampa'
  | 'la-rioja'
  | 'tierra-del-fuego'
  | 'ciudad-autonoma'

export interface PoliticalActor {
  id: number
  name: string
  slug: string
  role: string
  party: string
  province: Province
  avatar: MediaAsset
}

export interface TrendingItem {
  articleId: number
  title: string
  slug: string
  category: string
  views: number
}
