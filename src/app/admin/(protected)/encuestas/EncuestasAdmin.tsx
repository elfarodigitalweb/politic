'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Plus, Trash2, ChevronDown, ChevronUp, Save } from 'lucide-react'

interface PoliticoOption {
  id: number
  nombre: string
  slug: string
}

interface EncuestaRow {
  id: number
  politico_id: number
  fecha: string
  intencion_voto: number | null
  imagen_positiva: number | null
  imagen_negativa: number | null
  conocimiento: number | null
  fuente: string
  metodologia: string | null
  universo: number | null
  margen_error: number | null
  notas: string | null
}

interface Props {
  politicos: PoliticoOption[]
  encuestas: EncuestaRow[]
}

const EMPTY_FORM = {
  politico_id: '',
  fecha: new Date().toISOString().split('T')[0],
  intencion_voto: '',
  imagen_positiva: '',
  imagen_negativa: '',
  conocimiento: '',
  fuente: '',
  metodologia: '',
  universo: '',
  margen_error: '',
  notas: '',
}

function num(v: string) {
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

export function EncuestasAdmin({ politicos, encuestas: initial }: Props) {
  const [encuestas, setEncuestas] = useState<EncuestaRow[]>(initial)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filterId, setFilterId] = useState<number | 'all'>('all')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function guardar() {
    if (!form.politico_id || !form.fecha || !form.fuente) {
      setError('Político, fecha y fuente son obligatorios.')
      return
    }
    setSaving(true)
    setError('')
    const { data, error: err } = await supabase
      .from('encuestas')
      .insert({
        politico_id: parseInt(form.politico_id),
        fecha: form.fecha,
        intencion_voto: num(form.intencion_voto),
        imagen_positiva: num(form.imagen_positiva),
        imagen_negativa: num(form.imagen_negativa),
        conocimiento: num(form.conocimiento),
        fuente: form.fuente,
        metodologia: form.metodologia || null,
        universo: form.universo ? parseInt(form.universo) : null,
        margen_error: num(form.margen_error),
        notas: form.notas || null,
      })
      .select()
      .single()

    setSaving(false)
    if (err || !data) {
      setError(err?.message ?? 'Error al guardar')
      return
    }
    setEncuestas((prev) => [data, ...prev])
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  async function eliminar(id: number) {
    if (!confirm('¿Eliminar esta encuesta?')) return
    await supabase.from('encuestas').delete().eq('id', id)
    setEncuestas((prev) => prev.filter((e) => e.id !== id))
  }

  const filtered =
    filterId === 'all' ? encuestas : encuestas.filter((e) => e.politico_id === filterId)

  const nombreById = Object.fromEntries(politicos.map((p) => [p.id, p.nombre]))

  return (
    <div>
      {/* Controles superiores */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 font-medium">Filtrar por político:</label>
          <select
            value={filterId}
            onChange={(e) =>
              setFilterId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
            }
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
          >
            <option value="all">Todos</option>
            {politicos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
        >
          {showForm ? <ChevronUp size={16} /> : <Plus size={16} />}
          {showForm ? 'Cerrar formulario' : 'Nueva encuesta'}
        </button>
      </div>

      {/* Formulario de carga */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="font-black text-gray-900 mb-4">Cargar nueva encuesta</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Político <span className="text-[#E31E24]">*</span>
              </label>
              <select
                value={form.politico_id}
                onChange={(e) => setForm({ ...form, politico_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              >
                <option value="">Seleccionar...</option>
                {politicos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Fecha <span className="text-[#E31E24]">*</span>
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Fuente / Encuestadora <span className="text-[#E31E24]">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Ipsos, Elypsis, propia..."
                value={form.fuente}
                onChange={(e) => setForm({ ...form, fuente: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Intención de voto (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ej: 42.5"
                value={form.intencion_voto}
                onChange={(e) => setForm({ ...form, intencion_voto: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Imagen positiva (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ej: 55.0"
                value={form.imagen_positiva}
                onChange={(e) => setForm({ ...form, imagen_positiva: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Imagen negativa (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ej: 30.0"
                value={form.imagen_negativa}
                onChange={(e) => setForm({ ...form, imagen_negativa: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Conocimiento (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ej: 85.0"
                value={form.conocimiento}
                onChange={(e) => setForm({ ...form, conocimiento: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Universo (n)</label>
              <input
                type="number"
                placeholder="Ej: 800"
                value={form.universo}
                onChange={(e) => setForm({ ...form, universo: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Margen de error (%)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej: 2.5"
                value={form.margen_error}
                onChange={(e) => setForm({ ...form, margen_error: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Metodología</label>
              <input
                type="text"
                placeholder="Ej: Telefónica, online, cara a cara"
                value={form.metodologia}
                onChange={(e) => setForm({ ...form, metodologia: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notas</label>
              <textarea
                rows={2}
                placeholder="Observaciones, contexto..."
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24] resize-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={saving}
              className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Save size={14} />
              {saving ? 'Guardando...' : 'Guardar encuesta'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de encuestas */}
      {filtered.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          <p className="text-sm">No hay encuestas cargadas aún.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0 flex-wrap">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{nombreById[e.politico_id]}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(e.fecha).toLocaleDateString('es-AR')} · {e.fuente}
                    {e.universo && ` · n=${e.universo}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  {e.intencion_voto != null && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded font-black text-gray-700">
                      {e.intencion_voto}% voto
                    </span>
                  )}
                  {e.imagen_positiva != null && (
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">
                      {e.imagen_positiva}% +
                    </span>
                  )}
                  {e.imagen_negativa != null && (
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold">
                      {e.imagen_negativa}% −
                    </span>
                  )}
                  {e.conocimiento != null && (
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold text-xs hidden sm:inline">
                      {e.conocimiento}% conoc.
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => eliminar(e.id)}
                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                title="Eliminar"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
