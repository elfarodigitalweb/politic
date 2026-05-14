'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import type { GeoJsonObject } from 'geojson'
import type { Provincia, Municipio } from '@/types/mapa'
import { CapaProvincias } from './CapaProvincias'
import { CapaMunicipios } from './CapaMunicipios'
import { PanelDetalle } from './PanelDetalle'
import { LeyendaPartidos } from './LeyendaPartidos'

interface Props {
  provincias: Provincia[]
  municipiosSC: Municipio[]
}

export function MapaArgentina({ provincias, municipiosSC }: Props) {
  const [geoProvincias, setGeoProvincias] = useState<GeoJsonObject | null>(null)
  const [geoMunicipios, setGeoMunicipios] = useState<GeoJsonObject | null>(null)
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string | null>(null)
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<Municipio | null>(null)

  useEffect(() => {
    fetch('/geojson/argentina-provincias.geojson')
      .then((r) => r.json())
      .then(setGeoProvincias)
      .catch(console.error)

    fetch('/geojson/santa-cruz-municipios.geojson')
      .then((r) => r.json())
      .then(setGeoMunicipios)
      .catch(console.error)
  }, [])

  function handleProvinciaClick(slug: string) {
    setProvinciaSeleccionada(slug)
    setMunicipioSeleccionado(null)
  }

  function handleMunicipioClick(municipio: Municipio) {
    setMunicipioSeleccionado(municipio)
  }

  if (!geoProvincias) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">Cargando mapa...</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[-38, -63]}
        zoom={4}
        style={{ width: '100%', height: '100%' }}
        zoomControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        <CapaProvincias
          geojson={geoProvincias}
          provincias={provincias}
          onProvinciaClick={handleProvinciaClick}
        />

        {provinciaSeleccionada === 'santa-cruz' && geoMunicipios && (
          <CapaMunicipios
            geojson={geoMunicipios}
            municipios={municipiosSC}
            onMunicipioClick={handleMunicipioClick}
          />
        )}
      </MapContainer>

      <LeyendaPartidos />

      {municipioSeleccionado && (
        <PanelDetalle
          municipio={municipioSeleccionado}
          onClose={() => setMunicipioSeleccionado(null)}
        />
      )}
    </div>
  )
}
