import './Expenses.css'

function Expenses() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Dépenses</h1>
          <p>Gérez les finances de votre colocation.</p>
        </div>
        <button className="btn btn--primary">+ Ajouter une dépense</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Payé par</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>22 Mai 2026</td>
                <td>Courses hebdomadaires</td>
                <td>Alex</td>
                <td>84.50 €</td>
                <td><span className="badge badge--success">Payé</span></td>
              </tr>
              <tr>
                <td>20 Mai 2026</td>
                <td>Facture Électricité</td>
                <td>Sarah</td>
                <td>120.00 €</td>
                <td><span className="badge badge--warning">En attente</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Expenses
