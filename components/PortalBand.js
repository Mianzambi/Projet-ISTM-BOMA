export default function PortalBand() {
  return (
    <div className="wrap reveal">
      <div className="portal-band" id="espace">
        <div className="portal-inner">
          <div className="reveal-left">
            <h2>Votre espace étudiant centralisé</h2>
            <p>
              Connectez-vous pour accéder à votre dossier, suivre l'évolution de vos inscriptions, télécharger vos preuves de paiement et vos résultats (bulletins PDF).
            </p>
            <div className="portal-features stagger">
              <div className="portal-feature">
                <span className="check">✓</span> <span>Connexion sécurisée et privée</span>
              </div>
              <div className="portal-feature">
                <span className="check">✓</span> <span>Suivi de l'inscription en temps réel</span>
              </div>
              <div className="portal-feature">
                <span className="check">✓</span> <span>Historique des frais et résultats (PDF)</span>
              </div>
            </div>
          </div>
          <div className="portal-cta-group reveal-right">
            <a href="/inscription" className="btn btn-outline-light" style={{ width: '100%' }}>Créer mon compte</a>
            <a href="/connexion" className="btn btn-primary" style={{ width: '100%', background: '#fff', color: 'var(--navy)' }}>Se connecter</a>
          </div>
        </div>
      </div>
    </div>
  );
}
