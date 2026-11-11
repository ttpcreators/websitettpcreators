import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import './index.css'
import App from './App.jsx'

// La 3D de l'accueil commence à se télécharger tout de suite, en parallèle du reste
// (au lieu d'attendre que la page soit affichée).
import('./components/studio/Scene.jsx')

// ?poster : mode capture de l'image d'attente du studio
if (new URLSearchParams(window.location.search).has('poster')) {
  document.documentElement.classList.add('poster')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
