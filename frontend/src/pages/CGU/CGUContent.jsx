const LAST_UPDATED = '24 juillet 2026'
const CONTACT_EMAIL = 'contact@colocmanager.com'

function CGUContent({ className = 'cgu-content' }) {
  return (
    <div className={className}>
      <h1 className="cgu-content__title">Conditions Générales d&apos;Utilisation</h1>
      <p className="cgu-content__updated">Dernière mise à jour : {LAST_UPDATED}</p>

      <p className="cgu-content__intro">
        ColocManager est un projet réalisé dans le cadre d&apos;un diplôme RNCP 5,
        à but pédagogique et non commercial. Les présentes Conditions Générales
        d&apos;Utilisation (« CGU ») définissent les règles d&apos;accès et
        d&apos;utilisation du service par toute personne y accédant (« l&apos;Utilisateur »).
      </p>

      <section className="cgu-content__section">
        <h2>Article 1 — Objet</h2>
        <p>
          ColocManager est une application permettant à des colocataires de
          gérer la vie d&apos;un foyer partagé : suivi des dépenses communes et de
          leur répartition, gestion des tâches ménagères, gestion des membres
          d&apos;une colocation via un système d&apos;invitation. L&apos;utilisation du
          service implique l&apos;acceptation pleine et entière des présentes CGU.
        </p>
      </section>

      <section className="cgu-content__section">
        <h2>Article 2 — Accès au service et création de compte</h2>
        <p>
          L&apos;accès aux fonctionnalités du service nécessite la création d&apos;un
          compte (nom, prénom, adresse e-mail, mot de passe). L&apos;Utilisateur
          s&apos;engage à fournir des informations exactes et à conserver la
          confidentialité de ses identifiants. Il est seul responsable de toute
          action effectuée depuis son compte.
        </p>
        <p>
          L&apos;accès à une colocation se fait soit par sa création, soit en
          rejoignant un foyer existant à l&apos;aide d&apos;un code d&apos;invitation fourni
          par un membre déjà inscrit.
        </p>
      </section>

      <section className="cgu-content__section">
        <h2>Article 3 — Fonctionnalités du service</h2>
        <ul>
          <li>Création et gestion d&apos;une colocation (membres, invitations, rôles).</li>
          <li>Ajout de dépenses partagées et répartition manuelle ou automatique entre les membres.</li>
          <li>Suivi des soldes et validation des remboursements par le créateur de la dépense.</li>
          <li>Création et suivi de tâches ménagères, avec assignation à un ou plusieurs membres.</li>
        </ul>
        <p>
          Ces fonctionnalités sont fournies en l&apos;état, dans le cadre d&apos;un
          projet étudiant, et peuvent évoluer ou être interrompues sans préavis.
        </p>
      </section>

      <section className="cgu-content__section">
        <h2>Article 4 — Obligations de l&apos;Utilisateur</h2>
        <p>L&apos;Utilisateur s&apos;engage à :</p>
        <ul>
          <li>ne pas usurper l&apos;identité d&apos;un tiers ni fournir de fausses informations ;</li>
          <li>ne pas détourner le service à des fins autres que la gestion d&apos;une colocation réelle ou de test ;</li>
          <li>ne pas tenter de porter atteinte à la sécurité ou au bon fonctionnement du service ;</li>
          <li>respecter les autres membres de sa colocation dans le contenu qu&apos;il publie (libellés de dépenses, tâches, etc.).</li>
        </ul>
      </section>

      <section className="cgu-content__section">
        <h2>Article 5 — Données personnelles</h2>
        <p>
          Les données saisies (identité, e-mail, dépenses, tâches) sont utilisées
          uniquement pour le fonctionnement du service et ne sont ni vendues, ni
          partagées à des fins commerciales. L&apos;authentification repose sur un
          jeton stocké dans un cookie sécurisé (httpOnly).
        </p>
        <p>
          L&apos;image de profil affichée est générée à partir du nom de
          l&apos;Utilisateur par un service tiers (ui-avatars.com), auquel ce nom
          est transmis à cette seule fin.
        </p>
        <p>
          Conformément à la réglementation applicable, l&apos;Utilisateur dispose
          d&apos;un droit d&apos;accès, de rectification et de suppression de ses
          données, notamment via la suppression de son compte depuis la page
          Paramètres, ou en contactant l&apos;adresse indiquée à l&apos;article 9.
        </p>
      </section>

      <section className="cgu-content__section">
        <h2>Article 6 — Propriété intellectuelle</h2>
        <p>
          La structure générale, les textes, graphismes et éléments du service
          ColocManager sont la propriété de leurs auteurs dans le cadre de ce
          projet étudiant. Toute reproduction à des fins commerciales sans
          autorisation est interdite.
        </p>
      </section>

      <section className="cgu-content__section">
        <h2>Article 7 — Disponibilité et responsabilité</h2>
        <p>
          Le service est proposé dans le cadre d&apos;un projet de formation, sans
          garantie de disponibilité, de continuité ou d&apos;absence d&apos;erreurs. Les
          éditeurs ne sauraient être tenus responsables des pertes de données ou
          dommages, directs ou indirects, résultant de l&apos;utilisation ou de
          l&apos;indisponibilité du service.
        </p>
      </section>

      <section className="cgu-content__section">
        <h2>Article 8 — Suppression de compte et résiliation</h2>
        <p>
          L&apos;Utilisateur peut supprimer son compte à tout moment depuis la page
          Paramètres. Cette suppression peut être bloquée si l&apos;Utilisateur a des
          dettes actives dans une colocation ou en est l&apos;unique administrateur,
          afin de préserver la cohérence des données du foyer.
        </p>
        <p>
          Les éditeurs se réservent le droit de suspendre ou supprimer un compte
          en cas de non-respect des présentes CGU.
        </p>
      </section>

      <section className="cgu-content__section">
        <h2>Article 9 — Modification des CGU et contact</h2>
        <p>
          Les présentes CGU peuvent être modifiées à tout moment ; la date de
          dernière mise à jour figure en tête de page. Pour toute question relative
          à ces CGU ou à l&apos;utilisation du service, l&apos;Utilisateur peut écrire à{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </div>
  )
}

export default CGUContent
