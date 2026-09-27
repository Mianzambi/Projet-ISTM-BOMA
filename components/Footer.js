export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">
            <img
              src="/logo.jpg"
              alt="Logo ISTM BOMA"
              style={{ height: 40, width: "auto", borderRadius: 6, marginRight: 10 }}
            />
            ISTM / BOMA
          </div>
          <p>
            Institut Supérieur des Techniques Médicales de Boma — Ministère de l'Enseignement Supérieur et Universitaire, Boma, Kongo Central, République Démocratique du Congo.
          </p>
        </div>
        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><a href="#accueil">Accueil</a></li>
            <li><a href="#apropos">À propos</a></li>
            <li><a href="#filieres">Filières</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="/connexion">Espace Étudiant</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li>Boma, Kongo Central, RDC</li>
            <li>+243 89 000 0000</li>
            <li>contact@istm-boma.ac.cd</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 ISTM-BOMA. Tous droits réservés.</span>
        <span>Site conçu par Fils Mianzambi</span>
      </div>
    </footer>
  );
}
