import { useEffect, useState } from 'react'

// true quand l'élément est à l'écran ET l'onglet affiché. Sert à mettre en pause
// les animations en boucle et les carrousels automatiques : hors écran, ils ne
// coûtent plus rien (batterie, chauffe sur mobile).
export function useOnScreen(ref, rootMargin = '0px') {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
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
  }, [ref, rootMargin])
  return on
}
