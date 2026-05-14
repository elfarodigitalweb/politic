import { NextResponse } from 'next/server'
import { getBreakingNews } from '@/lib/api/strapi'

export const revalidate = 60

export async function GET() {
  try {
    const articles = await getBreakingNews()
    return NextResponse.json(articles)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
