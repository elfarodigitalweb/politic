import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { escanearProblematicas } from '@/lib/sources/problematicas-sc'
import { guardarProblematicas } from '@/lib/supabase/problematicas-queries'

// El escaneo hace fetch a RSS + Google News, puede tardar
export const maxDuration = 60

export async function POST() {
  let detectados = 0
  let guardados = 0
  let errorEscaneo: string | undefined

  try {
    const problemas = await escanearProblematicas()
    detectados = problemas.length
    guardados = await guardarProblematicas(problemas)
  } catch (e) {
    errorEscaneo = String(e)
  }

  revalidatePath('/santa-cruz')

  return NextResponse.json({
    revalidated: true,
    detectados,
    guardados,
    errorEscaneo,
    at: Date.now(),
  })
}
