import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import './ProtectedRoute.css'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <div className="auth-loading__spinner" aria-hidden="true" />
        <p>Chargement…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
