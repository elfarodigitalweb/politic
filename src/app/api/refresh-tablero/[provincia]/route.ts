import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { escanearProvincia } from '@/lib/sources/problematicas-provincial'
import { guardarProblematicasProvincial } from '@/lib/supabase/problematicas-queries'

export const maxDuration = 60

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ provincia: string }> }
) {
  const { provincia: provinciaSlug } = await params

  let detectados = 0
  let guardados = 0
  let errorEscaneo: string | undefined

  try {
    const problemas = await escanearProvincia(provinciaSlug)
    detectados = problemas.length
    guardados = await guardarProblematicasProvincial(problemas)
  } catch (e) {
    errorEscaneo = String(e)
  }

  revalidatePath(`/tablero/${provinciaSlug}`)
  if (provinciaSlug === 'santa-cruz') revalidatePath('/santa-cruz')

  return NextResponse.json({
    revalidated: true,
    provincia: provinciaSlug,
    detectados,
    guardados,
    errorEscaneo,
    at: Date.now(),
  })
}
