'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Rss, Globe, Code } from 'lucide-react'
import { PROVINCIAS_DISPLAY } from '@/types/noticias'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MedioDB = any

function normalizarDominio(input: string): string {
  let d = input.trim().toLowerCase()
  d = d.replace(/^https?:\/\//, '')
  d = d.replace(/^www\./, '')
  d = d.split('/')[0]
  d = d.split('?')[0]
  return d
}

export function MediosAdmin({ medios }: { medios: MedioDB[] }) {
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [urlRss, setUrlRss] = useState('')
  const [dominio, setDominio] = useState('')
  const [urlScraping, setUrlScraping] = useState('')
  const [provincia, setProvincia] = useState('santa-cruz')
  const [saving, setSaving] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const router = useRouter()

  async function handleAdd() {
    setErrorForm(null)
    const nombreLimpio = nombre.trim()
    const rssLimpio = urlRss.trim()
    const dominioLimpio = dominio.trim() ? normalizarDominio(dominio) : ''
    const scrapingLimpio = urlScraping.trim()

    if (!nombreLimpio) {
      setErrorForm('El nombre es obligatorio')
      return
    }
    if (!rssLimpio && !dominioLimpio && !scrapingLimpio) {
      setErrorForm('Tenés que cargar al menos un RSS, un dominio o una URL para scraping')
      return
    }
    if (dominioLimpio && !dominioLimpio.includes('.')) {
      setErrorForm('El dominio no parece válido (ej: opisantacruz.com.ar)')
      return
    }
    if (scrapingLimpio && !/^https?:\/\//i.test(scrapingLimpio)) {
      setErrorForm('La URL de scraping debe empezar con http:// o https://')
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('medios_locales').insert({
      nombre: nombreLimpio,
      url_rss: rssLimpio || null,
      dominio: dominioLimpio || null,
      url_scraping: scrapingLimpio || null,
      provincia_slug: provincia,
    })
    setSaving(false)

    if (error) {
      setErrorForm(error.message)
      return
    }

    setNombre(''); setUrlRss(''); setDominio(''); setUrlScraping(''); setShowForm(false)
    router.refresh()
  }

  async function handleDelete(id: number, nombreMedio: string) {
    if (!confirm(`¿Eliminar "${nombreMedio}"?`)) return
    const supabase = createClient()
    await supabase.from('medios_locales').delete().eq('id', id)
    router.refresh()
  }

  const provinciasOptions = Object.entries(PROVINCIAS_DISPLAY).filter(
    ([slug]) => slug !== 'nacional'
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{medios.length} medios configurados</p>
        <button
          onClick={() => { setShowForm(v => !v); setErrorForm(null) }}
          className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
        >
          <Plus size={16} /> Agregar medio
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <h3 className="font-bold text-gray-800 text-sm">Nuevo medio local</h3>

          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre del medio *"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">
              Cargá al menos UNA de las 3 opciones:
            </p>

            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 mb-1">
              <Rss size={11} className="text-orange-500" /> URL del feed RSS (preferido)
            </label>
            <input
              value={urlRss}
              onChange={e => setUrlRss(e.target.value)}
              placeholder="https://medio.com/feed/"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
            />

            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 mb-1">
              <Globe size={11} className="text-blue-500" /> Dominio (Google News site:)
            </label>
            <input
              value={dominio}
              onChange={e => setDominio(e.target.value)}
              placeholder="opisantacruz.com.ar"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
            />

            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 mb-1">
              <Code size={11} className="text-purple-500" /> URL para scraping HTML (último recurso)
            </label>
            <input
              value={urlScraping}
              onChange={e => setUrlScraping(e.target.value)}
              placeholder="https://www.eldiarionuevodia.com.ar/"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <p className="text-[10px] text-gray-500 mt-1.5">
              <span className="font-bold">Orden de prioridad:</span> RSS → Google News → scraping HTML.
              Usá scraping solo si el medio no tiene RSS y Google News no lo indexa.
            </p>
          </div>

          <select
            value={provincia}
            onChange={e => setProvincia(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            {provinciasOptions.map(([slug, nombre]) => (
              <option key={slug} value={slug}>{nombre}</option>
            ))}
          </select>

          {errorForm && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
              {errorForm}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !nombre.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => { setShowForm(false); setErrorForm(null) }}
              className="text-gray-500 px-4 py-2 text-sm hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {medios.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No hay medios locales configurados. Agregá el primero.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Medio</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Provincia</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Fuente</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {medios.map((m: MedioDB) => {
                const tipo = m.url_rss ? 'rss' : m.dominio ? 'gnews' : m.url_scraping ? 'scraping' : 'sin'
                const TipoIcon = tipo === 'rss' ? Rss : tipo === 'gnews' ? Globe : Code
                const colorIcon = tipo === 'rss' ? 'text-orange-500' : tipo === 'gnews' ? 'text-blue-500' : 'text-purple-500'
                return (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <TipoIcon size={14} className={`${colorIcon} flex-shrink-0`} />
                      {m.nombre}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {PROVINCIAS_DISPLAY[m.provincia_slug] ?? m.provincia_slug}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[260px] truncate">
                    {tipo === 'rss' ? (
                      <span title={m.url_rss}>RSS · {m.url_rss}</span>
                    ) : tipo === 'gnews' ? (
                      <span title={`Google News site:${m.dominio}`}>
                        Google News · site:{m.dominio}
                      </span>
                    ) : tipo === 'scraping' ? (
                      <span title={m.url_scraping}>
                        Scraping HTML · {m.url_scraping}
                      </span>
                    ) : (
                      <span className="text-red-400">Sin fuente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(m.id, m.nombre)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      aria-label={`Eliminar ${m.nombre}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
