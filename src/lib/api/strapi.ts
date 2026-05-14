import type { Article, Category, Author, PaginatedResponse } from '@/types'

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''

async function fetchStrapi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`/api${path}`, STRAPI_URL)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error(`Strapi error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export async function getArticles(page = 1, pageSize = 20): Promise<PaginatedResponse<Article>> {
  return fetchStrapi('/articles', {
    'populate': 'heroImage,category,author,author.avatar,tags,seo,seo.ogImage',
    'sort': 'publishedAt:desc',
    'pagination[page]': String(page),
    'pagination[pageSize]': String(pageSize),
  })
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await fetchStrapi<PaginatedResponse<Article>>('/articles', {
    'filters[slug][$eq]': slug,
    'populate': 'heroImage,category,author,author.avatar,tags,seo,seo.ogImage,body',
  })
  return res.data[0] ?? null
}

export async function getFeaturedArticles(): Promise<Article[]> {
  const res = await fetchStrapi<PaginatedResponse<Article>>('/articles', {
    'filters[isFeatured][$eq]': 'true',
    'populate': 'heroImage,category,author',
    'sort': 'publishedAt:desc',
    'pagination[pageSize]': '5',
  })
  return res.data
}

export async function getBreakingNews(): Promise<Article[]> {
  const res = await fetchStrapi<PaginatedResponse<Article>>('/articles', {
    'filters[isBreaking][$eq]': 'true',
    'populate': 'category',
    'sort': 'publishedAt:desc',
    'pagination[pageSize]': '10',
  })
  return res.data
}

export async function getArticlesByCategory(categorySlug: string, page = 1): Promise<PaginatedResponse<Article>> {
  return fetchStrapi('/articles', {
    'filters[category][slug][$eq]': categorySlug,
    'populate': 'heroImage,category,author',
    'sort': 'publishedAt:desc',
    'pagination[page]': String(page),
    'pagination[pageSize]': '20',
  })
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetchStrapi<PaginatedResponse<Category>>('/categories', {
    'sort': 'name:asc',
  })
  return res.data
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const res = await fetchStrapi<PaginatedResponse<Author>>('/authors', {
    'filters[slug][$eq]': slug,
    'populate': 'avatar,social',
  })
  return res.data[0] ?? null
}
