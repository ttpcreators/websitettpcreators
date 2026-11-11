import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import Navbar from './components/Navbar.jsx'
import PillNav from './components/PillNav.jsx'
import Hero from './components/Hero.jsx'
import Intro from './components/Intro.jsx'
import Clients from './components/Clients.jsx'
import Manifesto from './components/Manifesto.jsx'
import About from './components/About.jsx'
import Services from './components/Services.jsx'
import Method from './components/Method.jsx'
import Network from './components/Network.jsx'
import Stats from './components/Stats.jsx'
import Roster from './components/Roster.jsx'
import Story from './components/Story.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import './App.css'

export default function App() {
  const [showTop, setShowTop] = useState(false)
  // animation d'ouverture : une fois par visite, jamais si « moins d'animations »
  const [ready, setReady] = useState(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
      return sessionStorage.getItem('ttp-intro') === '1'
    } catch {
      return true
    }
  })
  const [showIntro] = useState(() => !ready)
  const introDone = useCallback(() => {
    try {
      sessionStorage.setItem('ttp-intro', '1')
    } catch {
      /* stockage indisponible : l'intro rejouera, sans gravité */
    }
    setReady(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {showIntro && <Intro onDone={introDone} />}
      <Navbar />
      <PillNav />
      <main>
        <Hero ready={ready} />
        <Roster ready={ready} />
        <Clients />
        <Services />
        <Method />
        <Stats />
        <Manifesto />
        <About />
        <Network />
        <Story />
        <Contact />
      </main>
      <Footer />

      <AnimatePresence>
        {showTop && (
          <motion.button
            className="to-top"
            type="button"
            aria-label="Retour en haut"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
