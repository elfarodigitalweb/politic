import LoginForm from './LoginForm'

// Forzar renderizado dinámico para que el CDN de Vercel no cachee esta página
// (el login depende del estado de auth y de query params como ?next=)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-black text-gray-900">Portal Político</h1>
          <p className="text-sm text-gray-500 mt-1">Panel de administración</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
