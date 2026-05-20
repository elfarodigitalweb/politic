// Silencia el DeprecationWarning DEP0169 (url.parse) que dispara `rss-parser`
// en su pipeline interno cuando el scanner de Santa Cruz hace fetch a feeds RSS.
// Es solo un warning de Node, no afecta funcionalidad — lo filtramos para que
// no ensucie la consola.
export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // Reemplazamos el listener default de warnings por uno que ignora DEP0169
  // y deja pasar el resto.
  process.removeAllListeners('warning')
  process.on('warning', (warning: NodeJS.ErrnoException) => {
    if (warning.name === 'DeprecationWarning' && warning.code === 'DEP0169') return
    console.warn(warning.stack ?? warning.message)
  })
}
