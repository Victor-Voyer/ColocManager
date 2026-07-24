import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Banknote, Check, Home, Sparkles } from 'lucide-react'
import BurgerButton from '../../components/BurgerButton/BurgerButton'
import { useAuth } from '../../context/AuthContext'
import { getAvatarUrl } from '../../utils/avatarUtils'
import './Homepage.css'

const features = [
  {
    title: 'Dépenses partagées',
    description:
      'Suivez qui paie quoi, visualisez les soldes et remboursez-vous en toute transparence.',
    color: 'blue',
    path: '/expenses',
    icon: Banknote,
  },
  {
    title: 'Tâches ménagères',
    description:
      'Organisez les corvées, assignez-les et gardez un foyer toujours au top.',
    color: 'yellow',
    path: '/tasks',
    icon: Sparkles,
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
]

function Homepage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, isBootstrapping } = useAuth()

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Utilisateur'
  const avatarSrc = getAvatarUrl(displayName)

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
            <Home className="homepage__logo-icon" size={22} aria-hidden="true" />
            <span className="homepage__logo-text">ColocManager</span>
          </Link>

          <nav className="homepage__nav" aria-label="Navigation principale">
            <a href="#features" className="homepage__nav-link" onClick={closeMenu}>Fonctionnalités</a>
            <a href="#benefits" className="homepage__nav-link" onClick={closeMenu}>Avantages</a>
            {!isBootstrapping && (
              isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="homepage__profile-btn"
                  onClick={closeMenu}
                >
                  <img
                    src={avatarSrc}
                    alt=""
                    className="homepage__profile-btn-avatar"
                    aria-hidden="true"
                  />
                  <span className="homepage__profile-btn-name">{displayName}</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="homepage__btn homepage__btn--neutral homepage__btn--sm" onClick={closeMenu}>Connexion</Link>
                  <Link to="/register" className="homepage__btn homepage__btn--primary homepage__btn--sm" onClick={closeMenu}>S&apos;inscrire</Link>
                </>
              )
            )}
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
              <h1 className="homepage__title">
                Vivez ensemble, <span className="homepage__title-accent">gérez sereinement</span>
              </h1>
              <p className="homepage__subtitle">
                ColocManager centralise vos dépenses, tâches ménagères, le tout dans une interface claire et apaisante.
              </p>
              <div className="homepage__hero-actions">
                <Link to="/register" className="homepage__btn homepage__btn--primary">
                  Créer ma colocation
                </Link>
                <Link to="/register" className="homepage__btn homepage__btn--secondary">
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
              {features.map((feature) => {
                const FeatureIcon = feature.icon

                return (
                  <Link
                    key={feature.title}
                    to={feature.path}
                    className={`homepage__feature-card homepage__feature-card--${feature.color}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="homepage__feature-icon">
                      <FeatureIcon size={24} strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <h3 className="homepage__feature-title">{feature.title}</h3>
                    <p className="homepage__feature-text">{feature.description}</p>
                  </Link>
                )
              })}
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
                  <span className="homepage__benefit-check" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
                  </span>
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
          <div className="homepage__container">
            <div className="homepage__cta-inner">
              <h2 className="homepage__cta-title">Prêt à simplifier votre colocation ?</h2>
              <p className="homepage__cta-text">
                Créez votre foyer en quelques clics ou rejoignez-le avec un code d&apos;invitation.
              </p>
              <div className="homepage__cta-actions">
                <Link to="/register" className="homepage__btn homepage__btn--primary homepage__btn--lg">
                  Commencer gratuitement
                </Link>
                <Link to="/login" className="homepage__btn homepage__btn--neutral homepage__btn--lg">
                  J&apos;ai déjà un compte
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="homepage__footer">
        <div className="homepage__container homepage__footer-inner">
          <p className="homepage__footer-brand">
            <Home size={18} aria-hidden="true" />
            ColocManager
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
