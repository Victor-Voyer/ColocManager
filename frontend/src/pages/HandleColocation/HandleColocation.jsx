import { useState } from 'react'
import './HandleColocation.css'
import { createColocation, joinColocation } from '../../api/colocationApi'
import { useNavigate } from "react-router"
import { useAuth } from '../../context/AuthContext'

function HandleColocation({ onCreate, onJoin }) {
  const [colocationName, setColocationName] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const navigate = useNavigate();
  const { refreshUser } = useAuth()

  const handleCreate = async (event) => {
    event.preventDefault()

    if (colocationName.trim()) {
      const payload = {
        name : colocationName.trim(),
      }
      await createColocation(payload)
      await refreshUser()
      navigate('/dashboard')
    }
  }

  const handleJoin = async (event) => {
    event.preventDefault()

    if (invitationCode.trim()) {
      const payload = {
        invitationCode: invitationCode.trim(),
      }
      await joinColocation(payload)
      await refreshUser()
      navigate('/dashboard')
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Gérer ma colocation</h1>
          <p>Créez une colocation ou rejoignez un foyer existant.</p>
        </div>
      </div>

      <div className="handle-colocation-grid">
        <section className="card handle-colocation-card">
          <h2>Créer une colocation</h2>
          <p>Choisissez le nom de votre nouveau foyer.</p>

          <form onSubmit={handleCreate}>
            <label htmlFor="colocation-name">Nom de la colocation</label>
            <input
              id="colocation-name"
              type="text"
              value={colocationName}
              onChange={(event) => setColocationName(event.target.value)}
              placeholder="Ex. La maison bleue"
              required
            />

            <button type="submit" className="btn btn--primary">
              Créer
            </button>
          </form>
        </section>

        <section className="card handle-colocation-card">
          <h2>Rejoindre une colocation</h2>
          <p>Utilisez le code reçu de la part d'un colocataire.</p>

          <form onSubmit={handleJoin}>
            <label htmlFor="invitation-code">Code d'invitation</label>
            <input
              id="invitation-code"
              type="text"
              value={invitationCode}
              onChange={(event) => setInvitationCode(event.target.value)}
              placeholder="Ex. BF-2026-XYZ"
              required
            />

            <button type="submit" className="btn btn--neutral">
              Rejoindre
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default HandleColocation
