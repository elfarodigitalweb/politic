import Link from 'next/link'
import { MapPin, TrendingUp, Newspaper } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Portal Político Argentina
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Monitoreo político en tiempo real. Santa Cruz y todas las provincias argentinas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          href="/mapa"
          className="group bg-white border-2 border-gray-200 hover:border-[#E31E24] rounded-xl p-6 transition-all"
        >
          <MapPin size={32} className="text-[#E31E24] mb-3" />
          <h2 className="text-lg font-black text-gray-900 mb-2">Mapa Político</h2>
          <p className="text-sm text-gray-500">
            Explorá el mapa de Argentina coloreado por partido político.
          </p>
        </Link>

        <Link
          href="/imagen"
          className="group bg-white border-2 border-gray-200 hover:border-[#E31E24] rounded-xl p-6 transition-all"
        >
          <TrendingUp size={32} className="text-[#E31E24] mb-3" />
          <h2 className="text-lg font-black text-gray-900 mb-2">Imagen Política</h2>
          <p className="text-sm text-gray-500">
            Ranking de imagen positiva y negativa analizado en tiempo real con IA.
          </p>
        </Link>

        <Link
          href="/noticias"
          className="group bg-white border-2 border-gray-200 hover:border-[#E31E24] rounded-xl p-6 transition-all"
        >
          <Newspaper size={32} className="text-[#E31E24] mb-3" />
          <h2 className="text-lg font-black text-gray-900 mb-2">Monitor de Noticias</h2>
          <p className="text-sm text-gray-500">
            Noticias políticas en tiempo real filtradas por provincia.
          </p>
        </Link>
      </div>
    </div>
  )
}
