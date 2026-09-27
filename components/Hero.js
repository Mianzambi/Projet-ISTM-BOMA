export default function Hero() {
  return (
    <>
      <section className="hero" id="accueil">
        {/* Floating background orbs */}
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>

        <div className="hero-inner">
          <span className="pill-badge">
            <span className="dot"></span> Inscriptions 2026–2027 en cours
          </span>
          <h1>INSTITUT SUPÉRIEUR DES TECHNIQUES MÉDICALES DE <span className="gradient-text">BOMA</span></h1>
          <p className="hero-sub">
            Formant l'excellence médicale de demain avec des programmes innovants et une approche pédagogique moderne centrée sur la pratique.
          </p>
          <div className="hero-actions">
            <a href="/inscription" className="btn btn-primary">S’inscrire maintenant</a>
            <a href="#filieres" className="btn btn-outline-light">Nos Filières</a>
          </div>
        </div>

        <div className="stat-strip">
          <div className="stat">
            <span className="stat-num">4</span>
            <span className="stat-label">Sections Organisées</span>
          </div>
          <div className="stat">
            <span className="stat-num">1.5 an</span>
            <span className="stat-label">Programme Passerelle</span>
          </div>
          <div className="stat">
            <span className="stat-num">Jour/Soir</span>
            <span className="stat-label">Vacations au choix</span>
          </div>
        </div>
      </section>
      <div className="hero-spacer"></div>
    </>
  );
}