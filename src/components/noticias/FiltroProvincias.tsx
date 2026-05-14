'use client'

import { PROVINCIAS_DISPLAY } from '@/types/noticias'

const PROVINCIAS_BOTONES = [
  'todas',
  'santa-cruz',
  'nacional',
  'buenos-aires',
  'cordoba',
  'santa-fe',
  'mendoza',
  'neuquen',
  'chubut',
  'tierra-del-fuego',
]

interface Props {
  activa: string
  onChange: (provincia: string) => void
  counts: Record<string, number>
}

export function FiltroProvincias({ activa, onChange, counts }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PROVINCIAS_BOTONES.map(slug => {
        const nombre = slug === 'todas' ? 'Todas' : (PROVINCIAS_DISPLAY[slug] ?? slug)
        const count = slug === 'todas'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[slug] ?? 0)
        const isActive = activa === slug

        return (
          <button
            key={slug}
            onClick={() => onChange(slug)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[#E31E24] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {nombre}
            {count > 0 && (
              <span className={`ml-1.5 ${isActive ? 'text-red-200' : 'text-gray-400'}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
