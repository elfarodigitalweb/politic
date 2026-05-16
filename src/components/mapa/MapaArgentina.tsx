'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import type { GeoJsonObject } from 'geojson'
import type { Provincia, Municipio, CiudadSC } from '@/types/mapa'
import { CapaProvincias } from './CapaProvincias'
import { CapaMunicipios } from './CapaMunicipios'
import { CapaCiudades } from './CapaCiudades'
import { PanelDetalle } from './PanelDetalle'
import { LeyendaPartidos } from './LeyendaPartidos'

// Qué ciudades pertenecen a cada departamento (slugs del GeoJSON)
const DEPTO_CIUDADES: Record<string, string[]> = {
  'guer-aike':        ['rio-gallegos', '28-de-noviembre', 'rio-turbio'],
  'lago-argentino':   ['el-calafate', 'el-chalten', 'tres-lagos'],
  'deseado':          ['puerto-deseado', 'caleta-olivia', 'las-heras-sc', 'pico-truncado'],
  'corpen-aike':      ['puerto-santa-cruz', 'piedra-buena'],
  'magallanes':       ['puerto-san-julian'],
  'lago-buenos-aires':['perito-moreno-sc', 'los-antiguos'],
  'rio-chico':        ['gobernador-gregores'],
}

interface Props {
  provincias: Provincia[]
  municipiosSC: Municipio[]
  ciudadesSC: CiudadSC[]
}

export function MapaArgentina({ provincias, municipiosSC, ciudadesSC }: Props) {
  const [geoProvincias, setGeoProvincias] = useState<GeoJsonObject | null>(null)
  const [geoMunicipios, setGeoMunicipios] = useState<GeoJsonObject | null>(null)
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string | null>(null)
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<Municipio | null>(null)
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<CiudadSC | null>(null)

  useEffect(() => {
    fetch('/geojson/argentina-provincias.geojson').then(r => r.json()).then(setGeoProvincias).catch(console.error)
    fetch('/geojson/santa-cruz-municipios.geojson').then(r => r.json()).then(setGeoMunicipios).catch(console.error)
  }, [])

  function handleProvinciaClick(slug: string) {
    setProvinciaSeleccionada(slug)
    setMunicipioSeleccionado(null)
    setCiudadSeleccionada(null)
  }

  function handleMunicipioClick(municipio: Municipio) {
    setMunicipioSeleccionado(municipio)
    setCiudadSeleccionada(null)
  }

  function handleCiudadClick(ciudad: CiudadSC) {
    setCiudadSeleccionada(ciudad)
    setMunicipioSeleccionado(null)
  }

  if (!geoProvincias) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">Cargando mapa...</p>
      </div>
    )
  }

  // Ciudades del departamento seleccionado
  const ciudadesDepto = municipioSeleccionado
    ? ciudadesSC.filter(c => DEPTO_CIUDADES[municipioSeleccionado.slug]?.includes(c.slug))
    : []

  // Panel a mostrar: ciudad seleccionada o departamento seleccionado
  const panelMunicipio = ciudadSeleccionada
    ? ({
        id: ciudadSeleccionada.id,
        nombre: ciudadSeleccionada.nombre,
        slug: ciudadSeleccionada.slug,
        provinciaSlug: 'santa-cruz',
        intendenteNombre: ciudadSeleccionada.intendenteNombre,
        partidoSlug: ciudadSeleccionada.partidoSlug,
        partidoColor: ciudadSeleccionada.partidoColor,
        imagenPositiva: ciudadSeleccionada.imagenPositiva,
        imagenNegativa: ciudadSeleccionada.imagenNegativa,
      } as Municipio)
    : municipioSeleccionado

  return (
    <div className="relative w-full h-full">
      <MapContainer center={[-38, -63]} zoom={4} style={{ width: '100%', height: '100%' }} zoomControl>
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

        {provinciaSeleccionada === 'santa-cruz' && ciudadesSC.length > 0 && (
          <CapaCiudades
            ciudades={ciudadesSC}
            onCiudadClick={handleCiudadClick}
          />
        )}
      </MapContainer>

      <LeyendaPartidos />

      {panelMunicipio && (
        <PanelDetalle
          municipio={panelMunicipio}
          ciudadesDepto={ciudadSeleccionada ? [] : ciudadesDepto}
          onClose={() => { setMunicipioSeleccionado(null); setCiudadSeleccionada(null) }}
          onCiudadClick={(c) => { setCiudadSeleccionada(c); setMunicipioSeleccionado(null) }}
        />
      )}
    </div>
  )
}
