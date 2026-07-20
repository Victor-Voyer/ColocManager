import { Plus } from 'lucide-react'
import './ActionButton.css'

const VARIANTS = ['task', 'expense', 'primary', 'neutral']

function ActionButton({
  variant = 'primary',
  label,
  children,
  icon: Icon = Plus,
  showIcon = true,
  iconSize = 18,
  className = '',
  type = 'button',
  ...props
}) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'primary'
  const content = children ?? label

  return (
    <button
      type={type}
      className={[
        'action-btn',
        `action-btn--${safeVariant}`,
        showIcon && 'action-btn--with-icon',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {showIcon && Icon && <Icon size={iconSize} aria-hidden="true" />}
      {content}
    </button>
  )
}

export default ActionButton
