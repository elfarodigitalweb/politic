import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const slug: string | undefined = body?.entry?.slug
  const categorySlug: string | undefined = body?.entry?.category?.slug

  revalidatePath('/')
  if (categorySlug) revalidatePath(`/${categorySlug}`)
  if (slug && categorySlug) revalidatePath(`/${categorySlug}/${slug}`)
  revalidateTag('articles', {})

  return NextResponse.json({ revalidated: true })
}
