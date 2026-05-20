// Silencia el DeprecationWarning DEP0169 (url.parse) que dispara `rss-parser`
// internamente. Solo afecta dev — no toca listeners en producción para no
// interferir con la observabilidad de Vercel.
export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NODE_ENV === 'production') return

  process.removeAllListeners('warning')
  process.on('warning', (warning: NodeJS.ErrnoException) => {
    if (warning.name === 'DeprecationWarning' && warning.code === 'DEP0169') return
    console.warn(warning.stack ?? warning.message)
  })
}
