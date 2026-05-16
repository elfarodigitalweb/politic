import type { Metadata } from 'next'
import { getProvincias, getMunicipiosByProvincia, getCiudadesSantaCruz } from '@/lib/supabase/queries'
import { MapaArgentinaClient } from '@/components/mapa/MapaArgentinaClient'

export const metadata: Metadata = {
  title: 'Mapa Político Argentina — Portal Político',
  description: 'Monitoreo político interactivo de Argentina. Explorá la situación política provincia por provincia.',
}

export const revalidate = 300

export default async function MapaPage() {
  const [provincias, municipiosSC, ciudadesSC] = await Promise.all([
    getProvincias(),
    getMunicipiosByProvincia('santa-cruz'),
    getCiudadesSantaCruz(),
  ])

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="px-4 py-2 border-b bg-white flex items-center justify-between flex-shrink-0">
        <h1 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Mapa Político Argentina
        </h1>
        <p className="text-xs text-gray-400 hidden sm:block">
          Click en Santa Cruz → ver departamentos y localidades
        </p>
      </div>
      <div className="flex-1 relative min-h-0">
        <MapaArgentinaClient
          provincias={provincias}
          municipiosSC={municipiosSC}
          ciudadesSC={ciudadesSC}
        />
      </div>
    </div>
  )
}
