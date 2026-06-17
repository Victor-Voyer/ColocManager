import ThemeToggle from '../../components/ThemeToggle/ThemeToggle'
import { useTheme } from '../../hooks/useTheme'
import './Settings.css'

function Settings() {
  const { toggle, isDark } = useTheme()

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Paramètres</h1>
          <p>Gérez votre profil et votre colocation.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="card">
          <h2>Apparence</h2>
          <p className="settings-appearance__desc">
            Thème actuel : <strong>{isDark ? 'Sombre' : 'Clair'}</strong>
          </p>
          <button type="button" className="btn btn--neutral" onClick={toggle}>
            {isDark ? '☀️ Passer en mode clair' : '🌙 Passer en mode sombre'}
          </button>
        </div>
        <div className="card">
          <h2>Profil</h2>
          <div className="form-group">
            <label>Nom complet</label>
            <input type="text" defaultValue="Alex Rivera" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" defaultValue="alex@example.com" />
          </div>
          <button className="btn btn--primary">Enregistrer</button>
        </div>
        <div className="card">
          <h2>Colocation</h2>
          <p>Nom : <strong>THE BIG FLATROOM</strong></p>
          <p>Code d&apos;invitation : <code>BF-2026-XYZ</code></p>
          <button className="btn btn--neutral">Modifier le foyer</button>
        </div>
      </div>
    </div>
  )
}

export default Settings
