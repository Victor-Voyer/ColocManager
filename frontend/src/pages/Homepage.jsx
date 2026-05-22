import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import BurgerButton from '../components/BurgerButton'
import '../components/BurgerButton.css'
import './Homepage.css'

const features = [
  {
    title: 'Dépenses partagées',
    description:
      'Suivez qui paie quoi, visualisez les soldes et remboursez-vous en toute transparence.',
    color: 'blue',
    path: '/expenses',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375a1.125 1.125 0 0 1 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
  {
    title: 'Tâches ménagères',
    description:
      'Organisez les corvées, planifiez les rotations et gardez un foyer toujours au top.',
    color: 'yellow',
    path: '/tasks',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    title: 'Liste de courses',
    description:
      'Partagez vos listes en temps réel et cochez les articles au fil de vos achats.',
    color: 'green',
    path: '/shopping',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
    ),
  },
]

const benefits = [
  {
    title: 'Confiance & clarté',
    text: 'Des soldes transparents et un code couleur cohérent pour vos finances.',
  },
  {
    title: 'Convivialité',
    text: 'Une ambiance positive qui facilite la vie en colocation au quotidien.',
  },
  {
    title: 'Temps réel',
    text: 'Listes et données synchronisées en temps réel entre tous les membres.',
  },
]

function Homepage() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className={`homepage ${menuOpen ? 'homepage--menu-open' : ''}`}>
      <div
        className="homepage__overlay"
        onClick={closeMenu}
        aria-hidden="true"
      />

      <header className="homepage__header">
        <div className="homepage__container homepage__header-inner">
          <Link to="/" className="homepage__logo" aria-label="ColocManager — Accueil">
            <span className="homepage__logo-icon" aria-hidden="true">🏠</span>
            <span className="homepage__logo-text">ColocManager</span>
          </Link>

          <nav className="homepage__nav" aria-label="Navigation principale">
            <a href="#features" className="homepage__nav-link" onClick={closeMenu}>Fonctionnalités</a>
            <a href="#benefits" className="homepage__nav-link" onClick={closeMenu}>Avantages</a>
            <Link to="/dashboard" className="homepage__btn homepage__btn--neutral homepage__btn--sm" onClick={closeMenu}>Connexion</Link>
            <Link to="/dashboard" className="homepage__btn homepage__btn--primary homepage__btn--sm" onClick={closeMenu}>S&apos;inscrire</Link>
          </nav>

          <BurgerButton
            isOpen={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="homepage__burger"
          />
        </div>
      </header>

      <main>
        <section className="homepage__hero">
          <div className="homepage__container homepage__hero-inner">
            <div className="homepage__hero-content">
              <p className="homepage__eyebrow">Gestion de colocation simplifiée</p>
              <h1 className="homepage__title">
                Vivez ensemble, <span className="homepage__title-accent">gérez sereinement</span>
              </h1>
              <p className="homepage__subtitle">
                ColocManager centralise vos dépenses, tâches ménagères et listes de courses
                — le tout dans une interface claire et apaisante.
              </p>
              <div className="homepage__hero-actions">
                <Link to="/dashboard" className="homepage__btn homepage__btn--primary">
                  Créer ma colocation
                </Link>
                <Link to="/dashboard" className="homepage__btn homepage__btn--secondary">
                  Rejoindre un foyer
                </Link>
              </div>
            </div>

            <div className="homepage__hero-visual" aria-hidden="true">
              <div className="homepage__dashboard-preview">
                <div className="homepage__preview-header">
                  <span className="homepage__preview-dot homepage__preview-dot--red" />
                  <span className="homepage__preview-dot homepage__preview-dot--yellow" />
                  <span className="homepage__preview-dot homepage__preview-dot--green" />
                </div>
                <div className="homepage__preview-body">
                  <div className="homepage__preview-card homepage__preview-card--expense">
                    <span className="homepage__preview-label">Dépenses</span>
                    <strong>248,50 €</strong>
                    <small>Ce mois-ci</small>
                  </div>
                  <div className="homepage__preview-card homepage__preview-card--task">
                    <span className="homepage__preview-label">Tâches</span>
                    <strong>3 / 5</strong>
                    <small>Terminées</small>
                  </div>
                  <div className="homepage__preview-card homepage__preview-card--shop">
                    <span className="homepage__preview-label">Courses</span>
                    <strong>12</strong>
                    <small>Articles restants</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="homepage__features">
          <div className="homepage__container">
            <div className="homepage__section-header">
              <h2 className="homepage__section-title">Tout ce dont votre foyer a besoin</h2>
              <p className="homepage__section-subtitle">
                Trois modules pensés pour simplifier le quotidien en colocation.
              </p>
            </div>

            <div className="homepage__features-grid">
              {features.map((feature) => (
                <Link
                  key={feature.title}
                  to={feature.path}
                  className={`homepage__feature-card homepage__feature-card--${feature.color}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="homepage__feature-icon">{feature.icon}</div>
                  <h3 className="homepage__feature-title">{feature.title}</h3>
                  <p className="homepage__feature-text">{feature.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="benefits" className="homepage__benefits">
          <div className="homepage__container homepage__benefits-inner">
            <div className="homepage__benefits-content">
              <h2 className="homepage__section-title">Une expérience pensée pour vous</h2>
              <p className="homepage__section-subtitle homepage__section-subtitle--left">
                Interface lisible, feedback immédiat et ambiance conviviale pour réduire
                le stress et améliorer la collaboration.
              </p>
            </div>

            <ul className="homepage__benefits-list">
              {benefits.map((benefit) => (
                <li key={benefit.title} className="homepage__benefit-item">
                  <span className="homepage__benefit-check" aria-hidden="true">✓</span>
                  <div>
                    <h3 className="homepage__benefit-title">{benefit.title}</h3>
                    <p className="homepage__benefit-text">{benefit.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="cta" className="homepage__cta">
          <div className="homepage__container homepage__cta-inner">
            <h2 className="homepage__cta-title">Prêt à simplifier votre colocation ?</h2>
            <p className="homepage__cta-text">
              Créez votre foyer en quelques clics ou rejoignez-le avec un code d&apos;invitation.
            </p>
            <div className="homepage__cta-actions">
              <Link to="/dashboard" className="homepage__btn homepage__btn--primary homepage__btn--lg">
                Commencer gratuitement
              </Link>
              <Link to="/dashboard" className="homepage__btn homepage__btn--neutral homepage__btn--lg">
                J&apos;ai déjà un compte
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="homepage__footer">
        <div className="homepage__container homepage__footer-inner">
          <p className="homepage__footer-brand">
            <span aria-hidden="true">🏠</span> ColocManager
          </p>
          <p className="homepage__footer-copy">
            &copy; {new Date().getFullYear()} ColocManager — Projet de fin d&apos;année RNCP 5
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Homepage

