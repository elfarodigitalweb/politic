'use client'

import { CircleMarker, Tooltip, Popup } from 'react-leaflet'
import type { CiudadSC } from '@/types/mapa'
import { User, TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  ciudades: CiudadSC[]
  onCiudadClick?: (ciudad: CiudadSC) => void
}

export function CapaCiudades({ ciudades, onCiudadClick }: Props) {
  return (
    <>
      {ciudades.map((ciudad) => (
        <CircleMarker
          key={ciudad.id}
          center={[ciudad.latitud, ciudad.longitud]}
          radius={ciudad.nombre === 'Río Gallegos' ? 9 : ciudad.nombre === 'Caleta Olivia' ? 8 : 6}
          pathOptions={{
            fillColor: ciudad.partidoColor,
            fillOpacity: 0.9,
            color: '#fff',
            weight: 2,
          }}
          eventHandlers={{
            click: () => onCiudadClick?.(ciudad),
          }}
        >
          {/* Label permanente con nombre */}
          <Tooltip
            permanent
            direction="top"
            offset={[0, -10]}
            opacity={1}
            className="leaflet-ciudad-label"
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#1f2937',
                background: 'rgba(255,255,255,0.92)',
                padding: '1px 5px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                border: '1px solid #e5e7eb',
              }}
            >
              {ciudad.nombre}
            </span>
          </Tooltip>

          {/* Popup al hacer click */}
          <Popup minWidth={200} maxWidth={240}>
            <div style={{ fontFamily: 'system-ui, sans-serif' }}>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: '14px',
                  color: '#111827',
                  marginBottom: '4px',
                }}
              >
                {ciudad.nombre}
              </div>

              {ciudad.partidoSlug && (
                <div
                  style={{
                    display: 'inline-block',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: ciudad.partidoColor + '25',
                    color: ciudad.partidoColor,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  {ciudad.partidoSlug.replace(/-/g, ' ')}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#9ca3af' }}>👤</span>
                {ciudad.intendenteNombre ? (
                  <span>{ciudad.intendenteNombre}</span>
                ) : (
                  <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    Intendente sin cargar
                  </span>
                )}
              </div>

              {ciudad.imagenPositiva !== null && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px',
                    marginTop: '6px',
                  }}
                >
                  <div
                    style={{
                      background: '#f0fdf4',
                      borderRadius: '6px',
                      padding: '6px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#16a34a' }}>
                      {ciudad.imagenPositiva.toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '9px', color: '#16a34a' }}>positiva</div>
                  </div>
                  <div
                    style={{
                      background: '#fef2f2',
                      borderRadius: '6px',
                      padding: '6px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#dc2626' }}>
                      {(ciudad.imagenNegativa ?? 0).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '9px', color: '#dc2626' }}>negativa</div>
                  </div>
                </div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}
