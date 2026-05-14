const CARGO_COLORS: Record<string, string> = {
  gobernador: 'bg-purple-100 text-purple-800',
  senador: 'bg-blue-100 text-blue-800',
  diputado: 'bg-indigo-100 text-indigo-800',
  intendente: 'bg-green-100 text-green-800',
  concejal: 'bg-yellow-100 text-yellow-800',
}

export function BadgeCargo({ cargo }: { cargo: string }) {
  const cls = CARGO_COLORS[cargo.toLowerCase()] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cls}`}>
      {cargo}
    </span>
  )
}
