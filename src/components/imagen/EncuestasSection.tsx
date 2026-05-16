import type { Encuesta } from '@/types/imagen'

interface Props {
  encuestas: Encuesta[]
}

export function EncuestasSection({ encuestas }: Props) {
  if (encuestas.length === 0) {
    return (
      <div className="mt-6 bg-gray-50 rounded-xl p-5 text-center">
        <p className="text-sm text-gray-500">No hay datos de encuestas cargados para este político.</p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
        Datos de Encuestas
      </h3>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-semibold">Fecha</th>
              <th className="text-right px-3 py-2.5 font-semibold">Int. Voto</th>
              <th className="text-right px-3 py-2.5 font-semibold">Img +</th>
              <th className="text-right px-3 py-2.5 font-semibold">Img −</th>
              <th className="text-right px-3 py-2.5 font-semibold">Conoc.</th>
              <th className="text-left px-3 py-2.5 font-semibold">Fuente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {encuestas.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                  {new Date(e.fecha).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-3 py-2.5 text-right font-black text-gray-900">
                  {e.intencionVoto != null ? `${e.intencionVoto}%` : '—'}
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-green-600">
                  {e.imagenPositiva != null ? `${e.imagenPositiva}%` : '—'}
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-red-500">
                  {e.imagenNegativa != null ? `${e.imagenNegativa}%` : '—'}
                </td>
                <td className="px-3 py-2.5 text-right text-gray-500">
                  {e.conocimiento != null ? `${e.conocimiento}%` : '—'}
                </td>
                <td className="px-3 py-2.5 text-gray-500 text-xs max-w-[120px] truncate">
                  {e.fuente}
                  {e.margenError != null && (
                    <span className="text-gray-400"> ±{e.margenError}%</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {encuestas[0]?.metodologia && (
        <p className="text-xs text-gray-400 mt-2 px-1">
          Última: {encuestas[0].metodologia}
          {encuestas[0].universo ? ` · n=${encuestas[0].universo}` : ''}
        </p>
      )}
    </div>
  )
}
