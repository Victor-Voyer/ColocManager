import { useState } from 'react'
import './HandleColocation.css'
import { createColocation, joinColocation } from '../../api/colocationApi'
import { useNavigate } from "react-router"
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../api/client'

function HandleColocation({ onCreate, onJoin }) {
  const [colocationName, setColocationName] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [createError, setCreateError] = useState('')
  const [joinError, setJoinError] = useState('')
  const navigate = useNavigate();
  const { refreshUser } = useAuth()

  const handleCreate = async (event) => {
    event.preventDefault()
    setCreateError('')

    if (colocationName.trim()) {
      const payload = {
        name : colocationName.trim(),
      }
      try {
        await createColocation(payload)
        await refreshUser()
        navigate('/dashboard')
      } catch (err) {
        setCreateError(
          err instanceof ApiError ? err.message : 'Impossible de créer la colocation.',
        )
      }
    }
  }

  const handleJoin = async (event) => {
    event.preventDefault()
    setJoinError('')

    if (invitationCode.trim()) {
      const payload = {
        invitationCode: invitationCode.trim(),
      }
      try {
        await joinColocation(payload)
        await refreshUser()
        navigate('/dashboard')
      } catch (err) {
        setJoinError(
          err instanceof ApiError ? err.message : 'Impossible de rejoindre la colocation.',
        )
      }
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

          {createError && (
            <p className="handle-colocation-card__error" role="alert">
              {createError}
            </p>
          )}

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

          {joinError && (
            <p className="handle-colocation-card__error" role="alert">
              {joinError}
            </p>
          )}

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
