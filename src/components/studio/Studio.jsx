import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { useCreators } from '../../lib/useCreators.js'
import { useOnScreen } from '../../lib/onScreen.js'

// Accueil « studio » : la pièce 3D (chargée à part pour ne pas alourdir la page)
// et son habillage. Un clic sur un créateur zoome sur l'étagère et ouvre le
// défilé des créateurs ; la télé, le carnet et la boîte mènent aux sections.

const Scene = lazy(() => import('./Scene.jsx'))

const pad = (n) => String(n).padStart(2, '0')

export default function Studio() {
  const creators = useCreators()
  const [focus, setFocus] = useState(false)
  const [index, setIndex] = useState(0)
  const [setEl, on] = useOnScreen()
  const n = creators.length

  const open = useCallback((i) => {
    setIndex(i)
    setFocus(true)
  }, [])
  const go = useCallback((d) => setIndex((i) => (i + d + n) % n), [n])
  const nav = useCallback((id) => {
    setFocus(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!focus) return
    const onKey = (e) => {
      if (e.key === 'Escape') setFocus(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focus, go])

  const c = creators[index] || creators[0]

  return (
    <section className="studio" id="hero" ref={setEl}>
      <div className="studio-canvas">
        <Suspense fallback={<div className="studio-wait tb-mono">Ouverture du studio…</div>}>
          <Scene
            creators={creators}
            focus={focus}
            index={index}
            onPickCreator={open}
            onNav={nav}
            active={on}
          />
        </Suspense>
      </div>

      <AnimatePresence mode="wait">
        {!focus ? (
          <motion.div
            key="home"
            className="studio-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="studio-intro">
              <h1>
                L'agence des créateurs <span>sport &amp; lifestyle.</span>
              </h1>
              <p className="tb-mono">Lyon · Genève</p>
            </div>
            <button type="button" className="tb-mono studio-hint" onClick={() => open(0)}>
              Cliquez sur un créateur, la télé ou le carnet
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="focus"
            className="studio-ui is-focus"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <button type="button" className="tb-mono studio-back" onClick={() => setFocus(false)}>
              ← Retour
            </button>
            <div className="studio-card">
              <p className="studio-name">
                {c.name}
                <span className="tb-mono">
                  {c.handle} {c.niche ? `· ${c.niche}` : ''}
                </span>
              </p>
              <div className="studio-nav">
                <button type="button" aria-label="Créateur précédent" onClick={() => go(-1)}>
                  <ArrowLeft size={16} />
                </button>
                <span className="tb-mono">
                  {pad(index + 1)} / {pad(n)}
                </span>
                <button type="button" aria-label="Créateur suivant" onClick={() => go(1)}>
                  <ArrowRight size={16} />
                </button>
              </div>
              {c.slug ? (
                <a className="studio-kit" href={`/mediakit/${c.slug}/`}>
                  Voir son media kit <ArrowUpRight size={15} />
                </a>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
