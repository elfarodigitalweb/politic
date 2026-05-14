const PROVINCIA_COLORS: Record<string, string> = {
  'nacional': 'bg-gray-100 text-gray-700',
  'santa-cruz': 'bg-blue-100 text-blue-800',
  'buenos-aires': 'bg-yellow-100 text-yellow-800',
  'ciudad-autonoma': 'bg-purple-100 text-purple-800',
  'cordoba': 'bg-green-100 text-green-800',
  'santa-fe': 'bg-red-100 text-red-800',
  'mendoza': 'bg-orange-100 text-orange-800',
  'neuquen': 'bg-teal-100 text-teal-800',
  'chubut': 'bg-cyan-100 text-cyan-800',
  'tierra-del-fuego': 'bg-indigo-100 text-indigo-800',
  'rio-negro': 'bg-lime-100 text-lime-800',
}

export function BadgeProvincia({ slug, nombre }: { slug: string; nombre: string }) {
  const cls = PROVINCIA_COLORS[slug] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cls}`}>
      {nombre}
    </span>
  )
}
