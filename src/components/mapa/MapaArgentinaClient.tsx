'use client'

import dynamic from 'next/dynamic'
import type { Provincia, Municipio, CiudadSC } from '@/types/mapa'

const MapaArgentina = dynamic(
  () => import('@/components/mapa/MapaArgentina').then((m) => m.MapaArgentina),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm animate-pulse">Cargando mapa...</p>
      </div>
    ),
  }
)

interface Props {
  provincias: Provincia[]
  municipiosSC: Municipio[]
  ciudadesSC: CiudadSC[]
}

export function MapaArgentinaClient({ provincias, municipiosSC, ciudadesSC }: Props) {
  return <MapaArgentina provincias={provincias} municipiosSC={municipiosSC} ciudadesSC={ciudadesSC} />
}
