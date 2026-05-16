'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { ImagenHistorico } from '@/types/imagen'

export function GraficoTendencia({ historial }: { historial: ImagenHistorico[] }) {
  if (historial.length < 2) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-sm">
        Se necesitan al menos 2 mediciones para mostrar la tendencia
      </div>
    )
  }

  const data = historial.map(h => ({
    fecha: new Date(h.calculadoAt).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit',
    }),
    positiva: h.imagenPositiva,
    negativa: h.imagenNegativa,
  }))

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="text-sm font-bold text-gray-700 mb-4">
        Tendencia de imagen — evolución histórica
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tooltip formatter={(v: any) => typeof v === 'number' ? `${v.toFixed(1)}%` : String(v ?? '')} />
          <Legend />
          <Line type="monotone" dataKey="positiva" name="Positiva"
            stroke="#16a34a" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="negativa" name="Negativa"
            stroke="#dc2626" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
