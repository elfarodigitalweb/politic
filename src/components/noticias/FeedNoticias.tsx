'use client'

import { useState } from 'react'
import type { NoticiaItem } from '@/types/noticias'
import { NoticiaCard } from './NoticiaCard'
import { FiltroProvincias } from './FiltroProvincias'

const LIMITE_SIN_LOGIN = 10

interface Props {
  noticias: NoticiaItem[]
  isLoggedIn: boolean
}

export function FeedNoticias({ noticias, isLoggedIn }: Props) {
  const [filtro, setFiltro] = useState('todas')

  const filtradas = filtro === 'todas'
    ? noticias
    : noticias.filter(n => n.provinciaSlug === filtro)

  const visibles = isLoggedIn ? filtradas : filtradas.slice(0, LIMITE_SIN_LOGIN)
  const hayMas = !isLoggedIn && filtradas.length > LIMITE_SIN_LOGIN

  const counts = noticias.reduce<Record<string, number>>((acc, n) => {
    acc[n.provinciaSlug] = (acc[n.provinciaSlug] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <FiltroProvincias activa={filtro} onChange={setFiltro} counts={counts} />

      <div className="flex flex-col gap-3">
        {visibles.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 text-sm">
            No hay noticias para esta provincia en este momento
          </div>
        ) : (
          visibles.map(n => <NoticiaCard key={n.id} noticia={n} />)
        )}
      </div>

      {hayMas && (
        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
          <p className="text-sm text-amber-800 font-semibold">
            Mostrando {LIMITE_SIN_LOGIN} de {filtradas.length} noticias
          </p>
          <p className="text-xs text-amber-600 mt-1">
            <a href="/admin/login" className="underline hover:text-amber-800">
              Iniciá sesión
            </a>
            {' '}para ver todas las noticias
          </p>
        </div>
      )}
    </div>
  )
}
