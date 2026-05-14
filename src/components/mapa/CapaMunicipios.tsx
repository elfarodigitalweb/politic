'use client'

import { GeoJSON } from 'react-leaflet'
import type { Feature, GeoJsonObject } from 'geojson'
import type { Layer } from 'leaflet'
import type { Municipio } from '@/types/mapa'

interface Props {
  geojson: GeoJsonObject
  municipios: Municipio[]
  onMunicipioClick: (municipio: Municipio) => void
}

export function CapaMunicipios({ geojson, municipios, onMunicipioClick }: Props) {
  function getColor(slug: string): string {
    return municipios.find((m) => m.slug === slug)?.partidoColor ?? '#94a3b8'
  }

  function style(feature?: Feature) {
    const slug = (feature?.properties?.slug ?? '') as string
    return {
      fillColor: getColor(slug),
      weight: 1,
      color: '#ffffff',
      fillOpacity: 0.85,
    }
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const slug = (feature.properties?.slug ?? '') as string
    const nombre = (feature.properties?.nombre ?? '') as string
    const municipio = municipios.find((m) => m.slug === slug)

    layer.on({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mouseover(e: any) {
        e.target.setStyle({ weight: 2, fillOpacity: 1 })
        e.target.bindTooltip(nombre, { sticky: true }).openTooltip()
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mouseout(e: any) {
        e.target.setStyle({ weight: 1, fillOpacity: 0.85 })
        e.target.unbindTooltip()
      },
      click() {
        if (municipio) onMunicipioClick(municipio)
      },
    })
  }

  return (
    <GeoJSON
      key={JSON.stringify(municipios.map((m) => m.partidoColor))}
      data={geojson}
      style={style}
      onEachFeature={onEachFeature}
    />
  )
}
