import { Sparkles, Loader2 } from 'lucide-react'

// États de traitement animés (porté depuis ai-agent-processing-states,
// shadcn/Tailwind → CSS pur, classes .ail-* dans App.css, accent bordeaux).
// Variantes : shimmer-text | dots | loading-line | spinner | pulse-ring
// NB : RevealAnimation / AiSkeleton du composant d'origine ne sont pas
// portés — le site a déjà Reveal.jsx (motion) qui fait mieux.

export default function AiLoader({ variant = 'shimmer-text', text = 'En cours…', className = '' }) {
  if (variant === 'shimmer-text') {
    return (
      <div className={`ail-shimmer ${className}`}>
        <Sparkles size={15} className="ail-shimmer-ic" />
        <span className="ail-shimmer-text">{text}</span>
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={`ail-dots ${className}`} aria-hidden="true">
        <span className="ail-dot" style={{ animationDelay: '0ms' }} />
        <span className="ail-dot" style={{ animationDelay: '160ms' }} />
        <span className="ail-dot" style={{ animationDelay: '320ms' }} />
      </div>
    )
  }

  if (variant === 'loading-line') {
    return (
      <div className={`ail-line ${className}`} aria-hidden="true">
        <div className="ail-line-sweep">
          <div className="ail-line-grad" />
          <div className="ail-line-core" />
        </div>
      </div>
    )
  }

  if (variant === 'spinner') {
    return (
      <div className={`ail-spinner ${className}`} aria-hidden="true">
        <Loader2 size={22} />
      </div>
    )
  }

  if (variant === 'pulse-ring') {
    return (
      <div className={`ail-ring ${className}`} aria-hidden="true">
        <span className="ail-ring-track" />
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  return null
}
