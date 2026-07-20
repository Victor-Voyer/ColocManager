import '../ProtectedRoute/ProtectedRoute.css'

function AuthLoading() {
  return (
    <div className="auth-loading" role="status" aria-live="polite">
      <div className="auth-loading__spinner" aria-hidden="true" />
      <p>Chargement…</p>
    </div>
  )
}

export default AuthLoading
