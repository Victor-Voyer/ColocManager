import './Pages.css'

function Messages() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Messagerie</h1>
          <p>Discutez avec vos colocataires.</p>
        </div>
      </div>

      <div className="messages-layout">
        <div className="card messages-sidebar">
          <div className="chat-preview chat-preview--active">
            <strong>Général</strong>
            <p>Alex: On fait quoi pour le dîner ?</p>
          </div>
          <div className="chat-preview">
            <strong>Sarah</strong>
            <p>Tu as pu payer le loyer ?</p>
          </div>
        </div>
        <div className="card messages-main">
          <div className="chat-messages">
            <div className="message message--received">
              <strong>Mark</strong>
              <p>J&apos;ai pris du pain en rentrant.</p>
            </div>
            <div className="message message--sent">
              <strong>Moi</strong>
              <p>Super, merci !</p>
            </div>
          </div>
          <div className="chat-input">
            <input type="text" placeholder="Écrivez votre message..." />
            <button className="btn btn--primary">Envoyer</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages
