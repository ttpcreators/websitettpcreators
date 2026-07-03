import { CLIENTS, asset } from '../data.js'

// Bande logos clients : défilement continu, logos teintés en bordeaux via
// mask CSS (les PNG source sont blancs — le logo sert de pochoir).
export default function Clients() {
  const track = [...CLIENTS, ...CLIENTS]
  return (
    <section className="clients" aria-label="Ils nous font confiance">
      <div className="marquee">
        <div className="marquee-track">
          {track.map((c, i) => {
            const url = asset(`assets/clients/${c.file}`)
            const mask = { WebkitMaskImage: `url(${url})`, maskImage: `url(${url})` }
            const hidden = i >= CLIENTS.length
            return (
              <span className="marquee-item" key={`${c.name}-${i}`} aria-hidden={hidden}>
                <span
                  className="marquee-logo"
                  style={mask}
                  role={hidden ? undefined : 'img'}
                  aria-label={hidden ? undefined : c.name}
                />
                <span className="marquee-dot" />
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
