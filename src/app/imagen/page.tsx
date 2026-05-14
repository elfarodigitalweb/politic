import type { Metadata } from 'next'
import { getPoliticosConImagen } from '@/lib/supabase/politicos-queries'
import { CardPolitico } from '@/components/imagen/CardPolitico'

export const metadata: Metadata = {
  title: 'Imagen Política — Portal Político',
  description: 'Ranking de imagen positiva y negativa de políticos argentinos en tiempo real.',
}

export const revalidate = 300

export default async function ImagenPage() {
  const politicos = await getPoliticosConImagen()
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Imagen Política</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ranking actualizado cada 6 horas · Análisis IA de noticias en tiempo real
        </p>
      </div>
      {politicos.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          <p className="font-semibold">No hay políticos cargados aún</p>
          <p className="text-sm mt-1">Agregá políticos desde el panel admin</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {politicos.map((p, i) => (
            <CardPolitico key={p.id} politico={p} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
