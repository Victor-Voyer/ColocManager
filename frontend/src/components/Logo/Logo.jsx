import { Link } from 'react-router'
import './Logo.css'

function Logo({
  to = '/',
  className = '',
  showText = true,
  variant = 'light',
  size = 'md',
  onClick,
  asLink = true,
}) {
  const classes = [
    'app-logo',
    variant === 'light' ? 'app-logo--light' : 'app-logo--dark',
    size === 'sm' ? 'app-logo--sm' : size === 'lg' ? 'app-logo--lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <img
        src="/logo.png"
        alt=""
        className="app-logo__image"
        aria-hidden="true"
      />
      {showText && <span className="app-logo__text">ColocManager</span>}
    </>
  )

  if (!asLink) {
    return <span className={classes}>{content}</span>
  }

  return (
    <Link
      to={to}
      className={classes}
      onClick={onClick}
      aria-label="ColocManager — Accueil"
    >
      {content}
    </Link>
  )
}

export default Logo
