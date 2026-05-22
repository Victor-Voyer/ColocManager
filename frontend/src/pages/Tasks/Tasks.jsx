import './Tasks.css'

function Tasks() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Tâches ménagères</h1>
          <p>Répartition équitable des corvées.</p>
        </div>
        <button className="btn btn--primary">+ Nouvelle tâche</button>
      </div>

      <div className="tasks-grid">
        <div className="card task-card">
          <div className="task-card__header">
            <h3>Nettoyer la cuisine</h3>
            <span className="badge badge--warning">À faire</span>
          </div>
          <p>Assigné à : <strong>Sarah</strong></p>
          <p>Échéance : Aujourd&apos;hui</p>
        </div>
        <div className="card task-card">
          <div className="task-card__header">
            <h3>Sortir les poubelles</h3>
            <span className="badge badge--success">Terminé</span>
          </div>
          <p>Assigné à : <strong>Mark</strong></p>
          <p>Fait par : Mark</p>
        </div>
      </div>
    </div>
  )
}

export default Tasks
