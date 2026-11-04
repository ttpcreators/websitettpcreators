import { useEffect, useState } from 'react'

// [ref, on] : on = l'élément est à l'écran ET l'onglet affiché. Sert à mettre en
// pause les animations en boucle et les carrousels automatiques : hors écran, ils
// ne coûtent plus rien (batterie, chauffe sur mobile). `ref` est un ref-callback :
// il suit aussi un élément qui n'apparaît qu'après coup (données chargées).
export function useOnScreen(rootMargin = '0px') {
  const [el, setEl] = useState(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!el) return
    let inView = false
    const update = () => setOn(inView && document.visibilityState === 'visible')
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        update()
      },
      { rootMargin },
    )
    io.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [el, rootMargin])
  return [setEl, on]
}
