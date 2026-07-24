import { useEffect } from 'react'
import { Link } from 'react-router'
import PublicHeader from '../../components/PublicHeader/PublicHeader.jsx'
import CGUContent from './CGUContent.jsx'
import './CGU.css'

function CGU() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="cgu-page">
      <PublicHeader />

      <main className="cgu-page__main">
        <div className="cgu-page__card">
          <Link to="/" className="cgu-page__back">
            &larr; Retour à l&apos;accueil
          </Link>

          <CGUContent />
        </div>
      </main>
    </div>
  )
}

export default CGU
