import { Link } from 'react-router-dom'
import './home-page.css'

const communityStats = [
  { value: '01', label: 'connected community' },
  { value: '24/7', label: 'resident access' },
  { value: 'One place', label: 'for the everyday' },
]

export default function HomePage() {
  return (
    <main className="public-home">
      <section className="home-hero" aria-labelledby="home-title">
        <img
          className="hero-building-photo"
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85"
          alt="Modern apartment buildings surrounded by trees"
        />
        <div className="hero-wash" />
        <div className="building-motion" aria-hidden="true">
          <div className="motion-tower motion-tower-back" />
          <div className="motion-tower motion-tower-mid" />
          <div className="motion-tower motion-tower-front" />
        </div>

        <header className="home-header">
          <Link className="home-logo" to="/" aria-label="SocioHub home">
            <span className="home-logo-mark">S</span>
            <span>Socio<span>Hub</span></span>
          </Link>
          <nav className="home-nav" aria-label="Main navigation">
            <a href="#community">For communities</a>
            <a href="#spaces">One connected space</a>
          </nav>
          <div className="home-auth-actions">
            <Link className="home-login" to="/login">Sign in</Link>
            <Link className="home-register" to="/register">Create account <span aria-hidden="true">↗</span></Link>
          </div>
        </header>

        <div className="hero-content" id="community">
          <p className="home-eyebrow"><span /> A better-connected community</p>
          <h1 id="home-title">SocioHub</h1>
          <p className="hero-description">A thoughtful home for everything happening in your society.</p>
          <p className="hero-supporting">From your front gate to your own front door, stay in step with the people and place you call home.</p>
          <div className="hero-actions">
            <Link className="hero-primary" to="/register">Get started <span aria-hidden="true">↗</span></Link>
            <Link className="hero-secondary" to="/login">I already have an account</Link>
          </div>
        </div>

        <div className="hero-caption"><span className="caption-line" /> Built around the way communities live</div>
        <a className="scroll-cue" href="#spaces" aria-label="Scroll to learn more"><span>↓</span></a>
      </section>

      <section className="community-band" id="spaces">
        <div className="band-intro">
          <p className="home-eyebrow">Life, in good order</p>
          <h2>Your whole community.<br />A little closer.</h2>
        </div>
        <p className="band-copy">SocioHub brings residents and the people who care for their community into one clear, dependable place, so the small things stay simple and important things don’t get missed.</p>
        <div className="community-stats">
          {communityStats.map((stat) => <div className="community-stat" key={stat.value}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
        </div>
      </section>

      <section className="home-footer">
        <Link className="home-logo" to="/" aria-label="SocioHub home"><span className="home-logo-mark">S</span><span>Socio<span>Hub</span></span></Link>
        <p>Made for the place you call home.</p>
        <div><Link to="/login">Sign in</Link><Link to="/register">Create account</Link></div>
      </section>
    </main>
  )
}
