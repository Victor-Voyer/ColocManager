import { Navigate } from 'react-router'
import AuthLoading from '../AuthLoading/AuthLoading.jsx'
import { useAuth } from '../../context/AuthContext'

function GuestRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <AuthLoading />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default GuestRoute
