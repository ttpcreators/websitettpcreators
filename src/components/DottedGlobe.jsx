import { useEffect, useRef, useState } from 'react'
import { geoOrthographic, geoPath, geoBounds, geoGraticule, geoDistance } from 'd3-geo'
import { timer } from 'd3-timer'
import { asset } from '../data.js'

// Globe filaire pointilliste (canvas + d3-geo). Canvas CARRÉ, dimensionné
// sur la largeur réelle du conteneur et resynchronisé par ResizeObserver :
// attributs et style restent toujours cohérents (pas de déformation).

const INK = '#0b0b0d'
const ACCENT = '#3d0000'
const CITIES = [
  [4.85, 45.76], // Lyon
  [6.14, 46.2], // Genève
]

export default function DottedGlobe({ width = 520, className = '' }) {
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const wrap = canvas.parentElement
    const context = canvas.getContext('2d')
    if (!context) return

    const projection = geoOrthographic().clipAngle(90)
    const path = geoPath().projection(projection).context(context)

    let size = 0
    let radius = 1

    const pointInPolygon = (point, polygon) => {
      const [x, y] = point
      let inside = false
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }
      return inside
    }

    const pointInFeature = (point, feature) => {
      const geometry = feature.geometry
      if (geometry.type === 'Polygon') {
        const coordinates = geometry.coordinates
        if (!pointInPolygon(point, coordinates[0])) return false
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) return false
        }
        return true
      }
      if (geometry.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true
                break
              }
            }
            if (!inHole) return true
          }
        }
        return false
      }
      return false
    }

    const generateDotsInPolygon = (feature, dotSpacing = 16) => {
      const dots = []
      const [[minLng, minLat], [maxLng, maxLat]] = geoBounds(feature)
      const stepSize = dotSpacing * 0.08
      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          if (pointInFeature([lng, lat], feature)) dots.push([lng, lat])
        }
      }
      return dots
    }

    const allDots = []
    let landFeatures = null
    const rotation = [0, -12]
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let autoRotate = !reduceMotion
    const rotationSpeed = 0.25

    const render = () => {
      if (!size) return
      context.clearRect(0, 0, size, size)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // sphère
      context.beginPath()
      context.arc(size / 2, size / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = '#fdfdfd'
      context.fill()
      context.strokeStyle = 'rgba(11, 11, 13, 0.22)'
      context.lineWidth = 1.5 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // graticule
        context.beginPath()
        path(geoGraticule()())
        context.strokeStyle = INK
        context.lineWidth = 1 * scaleFactor
        context.globalAlpha = 0.06
        context.stroke()
        context.globalAlpha = 1

        // contours des terres
        context.beginPath()
        landFeatures.features.forEach((feature) => {
          path(feature)
        })
        context.strokeStyle = 'rgba(11, 11, 13, 0.55)'
        context.lineWidth = 1 * scaleFactor
        context.stroke()

        // trame de points
        context.fillStyle = 'rgba(11, 11, 13, 0.3)'
        allDots.forEach((dot) => {
          const projected = projection(dot)
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= size &&
            projected[1] >= 0 &&
            projected[1] <= size
          ) {
            context.beginPath()
            context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI)
            context.fill()
          }
        })

        // marqueurs Lyon & Genève (face visible uniquement)
        const center = [-rotation[0], -rotation[1]]
        CITIES.forEach((city) => {
          if (geoDistance(city, center) < Math.PI / 2) {
            const p = projection(city)
            if (!p) return
            context.beginPath()
            context.arc(p[0], p[1], 4 * scaleFactor, 0, 2 * Math.PI)
            context.fillStyle = ACCENT
            context.fill()
            context.beginPath()
            context.arc(p[0], p[1], 8 * scaleFactor, 0, 2 * Math.PI)
            context.strokeStyle = 'rgba(61, 0, 0, 0.35)'
            context.lineWidth = 1.5 * scaleFactor
            context.stroke()
          }
        })
      }
    }

    // (re)dimensionne le canvas : carré, calé sur la largeur du conteneur
    const setup = () => {
      const avail = wrap.getBoundingClientRect().width || window.innerWidth - 40
      const next = Math.round(Math.max(240, Math.min(width, avail)))
      if (next === size) return
      size = next
      radius = size / 2.5
      const dpr = window.devicePixelRatio || 1
      canvas.width = size * dpr
      canvas.height = size * dpr
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      projection.scale(radius).translate([size / 2, size / 2]).rotate(rotation)
      render()
    }

    const loadWorldData = async () => {
      try {
        const response = await fetch(asset('assets/geo/ne_110m_land.json'))
        if (!response.ok) throw new Error('Failed to load land data')
        landFeatures = await response.json()
        landFeatures.features.forEach((feature) => {
          generateDotsInPolygon(feature, 16).forEach((d) => allDots.push(d))
        })
        render()
      } catch {
        setError(true)
      }
    }

    // le globe ne se redessine que lorsqu'il est visible à l'écran
    let onScreen = true
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
    })
    io.observe(wrap)

    const rotate = () => {
      if (autoRotate && onScreen) {
        rotation[0] += rotationSpeed
        projection.rotate(rotation)
        render()
      }
    }

    const rotationTimer = reduceMotion ? null : timer(rotate)

    const handleMouseDown = (event) => {
      autoRotate = false
      const startX = event.clientX
      const startY = event.clientY
      const startRotation = [...rotation]

      const handleMouseMove = (moveEvent) => {
        const sensitivity = 0.5
        rotation[0] = startRotation[0] + (moveEvent.clientX - startX) * sensitivity
        rotation[1] = startRotation[1] - (moveEvent.clientY - startY) * sensitivity
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]))
        projection.rotate(rotation)
        render()
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        if (!reduceMotion) {
          setTimeout(() => {
            autoRotate = true
          }, 10)
        }
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    canvas.addEventListener('mousedown', handleMouseDown)

    const ro = new ResizeObserver(() => setup())
    ro.observe(wrap)

    setup()
    loadWorldData()

    return () => {
      if (rotationTimer) rotationTimer.stop()
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('mousedown', handleMouseDown)
    }
  }, [width])

  // repli silencieux : sans données, la section reste lisible sans le globe
  if (error) return null

  return (
    <div className={`net-globe ${className}`}>
      <canvas ref={canvasRef} />
      <span className="globe-hint">Glisser pour faire tourner</span>
    </div>
  )
}
