'use client'

import { GeoJSON, useMap } from 'react-leaflet'
import type { Feature, GeoJsonObject } from 'geojson'
import type { Layer } from 'leaflet'
import type { Provincia } from '@/types/mapa'

interface Props {
  geojson: GeoJsonObject
  provincias: Provincia[]
  onProvinciaClick: (slug: string) => void
}

export function CapaProvincias({ geojson, provincias, onProvinciaClick }: Props) {
  const map = useMap()

  function getColorBySlug(slug: string): string {
    return provincias.find((p) => p.slug === slug)?.partidoColor ?? '#94a3b8'
  }

  function style(feature?: Feature) {
    const slug = (feature?.properties?.slug ?? '') as string
    return {
      fillColor: getColorBySlug(slug),
      weight: 1,
      color: '#ffffff',
      fillOpacity: 0.8,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onEachFeature(feature: Feature, layer: Layer) {
    const slug = (feature.properties?.slug ?? '') as string
    const nombre = (
      feature.properties?.nombre ??
      feature.properties?.NAME ??
      ''
    ) as string

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    layer.on({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mouseover(e: any) {
        e.target.setStyle({ weight: 2, fillOpacity: 1 })
        e.target.bindTooltip(nombre, { sticky: true }).openTooltip()
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mouseout(e: any) {
        e.target.setStyle({ weight: 1, fillOpacity: 0.8 })
        e.target.unbindTooltip()
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      click(e: any) {
        map.fitBounds(e.target.getBounds(), { padding: [20, 20] })
        onProvinciaClick(slug)
      },
    })
  }

  return <GeoJSON key={JSON.stringify(provincias.map(p => p.partidoColor))} data={geojson} style={style} onEachFeature={onEachFeature} />
}
