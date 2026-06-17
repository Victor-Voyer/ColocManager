import { Home } from 'lucide-react'

function Logo({
  iconSize = 24,
  iconClassName = '',
  textClassName = '',
  showText = true,
  children = 'ColocManager',
}) {
  return (
    <>
      <Home size={iconSize} className={iconClassName} aria-hidden="true" strokeWidth={2} />
      {showText && <span className={textClassName}>{children}</span>}
    </>
  )
}

export default Logo
