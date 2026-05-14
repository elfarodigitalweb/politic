import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'SantaCruzPolítica — Monitoreo político en tiempo real',
    template: '%s | SantaCruzPolítica',
  },
  description:
    'Análisis político en tiempo real de Santa Cruz y las provincias argentinas. Consultora especializada en monitoreo electoral y político.',
  openGraph: {
    siteName: 'SantaCruzPolítica',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
