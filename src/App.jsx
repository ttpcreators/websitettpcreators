import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import Navbar from './components/Navbar.jsx'
import MenuOverlay from './components/MenuOverlay.jsx'
import Hero from './components/Hero.jsx'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  // Verrouille le scroll quand le menu plein écran est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Navbar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((o) => !o)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <Hero />
        <Clients />
        <Manifesto />
        <About />
        <Services />
        <Method />
        <Network />
        <Stats />
        <Roster />
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
