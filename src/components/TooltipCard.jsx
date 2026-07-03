import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// Tooltip riche inline (porté depuis aceternity tooltip-card) : suit le
// curseur, se repositionne pour rester dans le viewport, s'ouvre au tap
// sur mobile. `content` accepte du texte ou du JSX (carte). Rendu en
// <span> pour être valide à l'intérieur d'un paragraphe.

export function Tooltip({ content, children, className }) {
  const [isVisible, setIsVisible] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [height, setHeight] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const contentRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (isVisible && contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [isVisible, content])

  const calculatePosition = (mouseX, mouseY) => {
    if (!contentRef.current || !containerRef.current) {
      return { x: mouseX + 12, y: mouseY + 12 }
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const tooltipWidth = 240 // min-width du panneau
    const tooltipHeight = contentRef.current.scrollHeight

    const absoluteX = containerRect.left + mouseX
    const absoluteY = containerRect.top + mouseY

    let finalX = mouseX + 12
    let finalY = mouseY + 12

    if (absoluteX + 12 + tooltipWidth > viewportWidth) {
      finalX = mouseX - tooltipWidth - 12
    }
    if (absoluteX + finalX < 0) {
      finalX = -containerRect.left + 12
    }
    if (absoluteY + 12 + tooltipHeight > viewportHeight) {
      finalY = mouseY - tooltipHeight - 12
    }
    if (absoluteY + finalY < 0) {
      finalY = -containerRect.top + 12
    }

    return { x: finalX, y: finalY }
  }

  const updateMousePosition = (mouseX, mouseY) => {
    setMouse({ x: mouseX, y: mouseY })
    setPosition(calculatePosition(mouseX, mouseY))
  }

  const handleMouseEnter = (e) => {
    setIsVisible(true)
    const rect = e.currentTarget.getBoundingClientRect()
    updateMousePosition(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleMouseLeave = () => {
    setMouse({ x: 0, y: 0 })
    setPosition({ x: 0, y: 0 })
    setIsVisible(false)
  }

  const handleMouseMove = (e) => {
    if (!isVisible) return
    const rect = e.currentTarget.getBoundingClientRect()
    updateMousePosition(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    updateMousePosition(touch.clientX - rect.left, touch.clientY - rect.top)
    setIsVisible(true)
  }

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsVisible(false)
      setMouse({ x: 0, y: 0 })
      setPosition({ x: 0, y: 0 })
    }, 2000)
  }

  const handleClick = (e) => {
    if (window.matchMedia('(hover: none)').matches) {
      e.preventDefault()
      if (isVisible) {
        setIsVisible(false)
        setMouse({ x: 0, y: 0 })
        setPosition({ x: 0, y: 0 })
      } else {
        const rect = e.currentTarget.getBoundingClientRect()
        updateMousePosition(e.clientX - rect.left, e.clientY - rect.top)
        setIsVisible(true)
      }
    }
  }

  useEffect(() => {
    if (isVisible && contentRef.current) {
      setPosition(calculatePosition(mouse.x, mouse.y))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, height, mouse.x, mouse.y])

  return (
    <span
      ref={containerRef}
      className={`tt-wrap${className ? ` ${className}` : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.span
            key={String(isVisible)}
            className="tt-panel"
            initial={{ height: 0, opacity: 1 }}
            animate={{ height, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ top: position.y, left: position.x }}
          >
            <span ref={contentRef} className="tt-content">
              {content}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
