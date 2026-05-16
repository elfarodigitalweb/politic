import type { Metadata } from 'next'
import { getPoliticos, getPoliticoBySlug, getUltimaImagen } from '@/lib/supabase/politicos-queries'
import { getUltimaEncuesta } from '@/lib/supabase/encuestas-queries'
import { ComparadorClient } from './ComparadorClient'

export const metadata: Metadata = {
  title: 'Comparar Candidatos — Portal Político',
  description: 'Análisis comparativo de imagen política entre candidatos argentinos.',
}

export const revalidate = 300

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>
}

export default async function CompararPage({ searchParams }: Props) {
  const { a, b } = await searchParams
  const politicos = await getPoliticos()

  let politicoA = null,
    politicoB = null,
    imagenA = null,
    imagenB = null,
    encuestaA = null,
    encuestaB = null

  if (a) {
    politicoA = await getPoliticoBySlug(a)
    if (politicoA) {
      ;[imagenA, encuestaA] = await Promise.all([
        getUltimaImagen(politicoA.id),
        getUltimaEncuesta(politicoA.id),
      ])
    }
  }

  if (b) {
    politicoB = await getPoliticoBySlug(b)
    if (politicoB) {
      ;[imagenB, encuestaB] = await Promise.all([
        getUltimaImagen(politicoB.id),
        getUltimaEncuesta(politicoB.id),
      ])
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Comparar Candidatos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Análisis comparativo de imagen política · datos de IA y encuestas
        </p>
      </div>
      <ComparadorClient
        politicos={politicos}
        slugA={a}
        slugB={b}
        politicoA={politicoA}
        politicoB={politicoB}
        imagenA={imagenA}
        imagenB={imagenB}
        encuestaA={encuestaA}
        encuestaB={encuestaB}
      />
    </div>
  )
}
