import { LISTA_PARTIDOS } from '@/lib/partidos'

export function LeyendaPartidos() {
  return (
    <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-lg shadow-md p-3 text-xs">
      <p className="font-bold text-gray-700 mb-2 uppercase tracking-wide text-[10px]">
        Partidos
      </p>
      <div className="flex flex-col gap-1.5">
        {LISTA_PARTIDOS.map((p) => (
          <div key={p.slug} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0 border border-black/10"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-gray-600 leading-none">{p.nombre}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm flex-shrink-0 bg-slate-400 border border-black/10" />
          <span className="text-gray-600 leading-none">Sin datos</span>
        </div>
      </div>
    </div>
  )
}
