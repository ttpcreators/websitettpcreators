import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Moon, Sun } from "lucide-react";
import { useCreators } from "../../lib/useCreators.js";
import { useOnScreen } from "../../lib/onScreen.js";

// Accueil « studio » : la pièce 3D (chargée à part pour ne pas alourdir la page)
// et son habillage. Un clic sur un créateur zoome sur l'étagère et ouvre le
// défilé des créateurs ; la télé, le carnet et la boîte mènent aux sections.

const Scene = lazy(() => import("./Scene.jsx"));

const pad = (n) => String(n).padStart(2, "0");

// Le navigateur sait-il afficher de la 3D (WebGL) ?
function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

// Si la 3D plante (vieux téléphone, carte graphique), la page continue sans elle.
class Guard extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Studio({ ready = true }) {
  const creators = useCreators();
  const [focus, setFocus] = useState(false);
  const [index, setIndex] = useState(0);
  const [night, setNight] = useState(false);
  // la 3D apparaît (fondu) une fois chargée ; avant, l'image d'attente est affichée
  const [shown, setShown] = useState(false);
  const [failed, setFailed] = useState(() => !canWebGL());
  const [setEl, on] = useOnScreen();
  const n = creators.length;

  const open = useCallback((i) => {
    setIndex(i);
    setFocus(true);
  }, []);
  const go = useCallback((d) => n && setIndex((i) => (i + d + n) % n), [n]);
  const nav = useCallback((id) => {
    setFocus(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // la nuit, la barre du haut passe en clair tant qu'elle est au-dessus du studio
  const sectionRef = useRef(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const root = document.documentElement;
    const io = new IntersectionObserver(
      ([e]) => {
        if (night && e.isIntersecting) root.dataset.navDark = "";
        else delete root.dataset.navDark;
      },
      { rootMargin: "0px 0px -92% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      delete root.dataset.navDark;
    };
  }, [night]);

  useEffect(() => {
    if (!focus) return;
    const onKey = (e) => {
      if (e.key === "Escape") setFocus(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, go]);

  const c = creators[index] || creators[0];

  return (
    <section
      className={`studio${night ? " is-night" : ""}`}
      id="hero"
      ref={(el) => {
        sectionRef.current = el;
        setEl(el);
      }}
    >
      <div className={`studio-canvas${shown || failed ? ' is-shown' : ''}`}>
        {failed ? (
          <div className="studio-flat" aria-hidden="true">
            {creators.slice(0, 4).map((x) => (
              <img key={x.name} src={x.photo} alt="" loading="lazy" />
            ))}
          </div>
        ) : (
          <Guard onFail={() => setFailed(true)}>
            <Suspense
              fallback={
                <div className="studio-wait tb-mono">Ouverture du studio…</div>
              }
            >
              <Scene
                onFail={() => setFailed(true)}
            onReady={() => setShown(true)}
                creators={creators}
                focus={focus}
                index={index}
                onPickCreator={open}
                onNav={nav}
                active={on}
                night={night}
                ready={ready}
              />
            </Suspense>
          </Guard>
        )}
      </div>

      {failed ? null : (
        <button
          type="button"
          className="studio-mode"
          onClick={() => setNight((v) => !v)}
          aria-label={
            night ? "Allumer la lumière du jour" : "Passer en mode nuit"
          }
          title={night ? "Jour" : "Nuit"}
        >
          {night ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      )}

      <AnimatePresence mode="wait">
        {!focus || !c ? (
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
            {n > 0 ? (
              <button type="button" className="studio-all" onClick={() => open(0)}>
                Voir les {n} créateurs <ArrowRight size={15} />
              </button>
            ) : null}
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
            <button
              type="button"
              className="tb-mono studio-back"
              onClick={() => setFocus(false)}
            >
              ← Retour
            </button>
            {failed && c?.photo ? (
              <img className="studio-flat-photo" src={c.photo} alt={c.name} />
            ) : null}
            <div className="studio-card">
              <p className="studio-name">
                {c.name}
                <span className="tb-mono">
                  {c.handle} {c.niche ? `· ${c.niche}` : ""}
                </span>
              </p>
              <div className="studio-nav">
                <button
                  type="button"
                  aria-label="Créateur précédent"
                  onClick={() => go(-1)}
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="tb-mono">
                  {pad(index + 1)} / {pad(n)}
                </span>
                <button
                  type="button"
                  aria-label="Créateur suivant"
                  onClick={() => go(1)}
                >
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
  );
}
