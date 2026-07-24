import { FileText } from 'lucide-react'
import CGUContent from '../../CGU/CGUContent.jsx'
import '../../CGU/CGU.css'

function CguSection() {
  return (
    <div className="settings-section card">
      <div className="settings-section__header">
        <FileText size={22} aria-hidden="true" />
        <div>
          <h2>Conditions Générales d&apos;Utilisation</h2>
          <p>Les règles d&apos;accès et d&apos;utilisation de ColocManager.</p>
        </div>
      </div>

      <CGUContent className="cgu-content cgu-content--embedded" />
    </div>
  )
}

export default CguSection
