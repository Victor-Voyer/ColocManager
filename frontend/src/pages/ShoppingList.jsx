import './Pages.css'

function ShoppingList() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Liste de courses</h1>
          <p>N&apos;oubliez plus rien lors de vos achats.</p>
        </div>
        <button className="btn btn--primary">+ Ajouter un article</button>
      </div>

      <div className="card">
        <ul className="shopping-list">
          <li className="shopping-item">
            <input type="checkbox" id="item1" />
            <label htmlFor="item1">Lait (2L)</label>
          </li>
          <li className="shopping-item">
            <input type="checkbox" id="item2" />
            <label htmlFor="item2">Papier toilette</label>
          </li>
          <li className="shopping-item">
            <input type="checkbox" id="item3" defaultChecked />
            <label htmlFor="item3" className="checked">Liquide vaisselle</label>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ShoppingList
