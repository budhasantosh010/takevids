import { ArrowRight, CheckCircle2, Film, Layers3, Sparkles, WandSparkles } from 'lucide-react'
import { provenKits } from '../../domain/workflow'

interface HomeDashboardProps {
  onReverseEngineer: () => void
  onUseKit: (kitId: string) => void
}

export function HomeDashboard({ onReverseEngineer, onUseKit }: HomeDashboardProps) {
  const showKits = () => document.getElementById('proven-kits')?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <main className="home-dashboard">
      <header className="home-topbar">
        <div className="home-brand"><span className="home-brand__mark"><Film size={17} /></span><strong>TakeVids</strong></div>
        <span className="home-alpha"><span /> Private alpha</span>
      </header>

      <section className="home-hero">
        <div className="home-hero__glow home-hero__glow--one" />
        <div className="home-hero__glow home-hero__glow--two" />
        <div className="home-hero__content">
          <span className="home-kicker"><Sparkles size={13} /> Video editing without learning an editor</span>
          <h1>Start with a format<br />that already works.</h1>
          <p>Reverse engineer any great video into a reusable editing kit, or start from one of our proven formats.</p>

          <div className="home-paths" aria-label="Choose how to start">
            <button type="button" className="home-path home-path--primary" onClick={onReverseEngineer}>
              <span className="home-path__icon"><WandSparkles size={21} /></span>
              <span className="home-path__copy"><strong>Reverse engineer a video</strong><small>Bring a reference. TakeVids learns the editing system.</small></span>
              <ArrowRight size={18} />
            </button>
            <button type="button" className="home-path" onClick={showKits}>
              <span className="home-path__icon home-path__icon--kit"><Layers3 size={21} /></span>
              <span className="home-path__copy"><strong>Use a proven kit</strong><small>No reference? Pick a format we already tested.</small></span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="home-promise"><CheckCircle2 size={14} /> Upload → TakeVids edits → get the finished video</div>
        </div>
      </section>

      <section className="kit-library" id="proven-kits">
        <div className="kit-library__heading">
          <div><span className="eyebrow">Ready-made workflows</span><h2>Proven Video Kits</h2></div>
          <p>Built from formats that already work. You only add your footage.</p>
        </div>
        <div className="kit-library__grid">
          {provenKits.map((kit, index) => (
            <button type="button" className="home-kit-card" onClick={() => onUseKit(kit.id)} key={kit.id}>
              <span className={`home-kit-card__preview home-kit-card__preview--${index + 1}`}>
                <span className="home-kit-card__frame"><span>TAKEVIDS</span><strong>{kit.name}</strong></span>
              </span>
              <span className="home-kit-card__body">
                <span><strong>{kit.name}</strong><small>{kit.summary}</small></span>
                <span className="home-kit-card__action">Use kit <ArrowRight size={13} /></span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
