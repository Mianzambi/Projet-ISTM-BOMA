export default function About() {
  return (
    <section className="about" id="apropos">
      <div className="about-inner">
        
        <div 
          className="about-visual reveal-left" 
          aria-hidden="true" 
          style={{ 
            background: 'linear-gradient(145deg, var(--navy), var(--blue-dark))', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Grille décorative en arrière-plan */}
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            opacity: 0.08, 
            backgroundImage: 'radial-gradient(circle at center, #fff 2px, transparent 2px)', 
            backgroundSize: '24px 24px' 
          }}></div>
          
          {/* Cercle central lumineux avec l'icône */}
          <div style={{ 
            position: 'relative', 
            zIndex: 1, 
            width: 130, 
            height: 130, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.05)', 
            backdropFilter: 'blur(10px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            border: '1px solid rgba(255,255,255,0.1)', 
            boxShadow: '0 0 60px rgba(6, 182, 212, 0.25)' 
          }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>

          <h3 style={{ 
            color: '#fff', 
            fontSize: '1.4rem', 
            marginTop: '32px', 
            marginBottom: '4px',
            position: 'relative', 
            zIndex: 1, 
            letterSpacing: '0.02em',
            fontWeight: 700
          }}>
            ISTM BOMA
          </h3>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)', 
            textAlign: 'center', 
            fontSize: '0.95rem', 
            margin: 0, 
            position: 'relative', 
            zIndex: 1,
            fontStyle: 'italic'
          }}>
            Scientia Splendet et Conscientia
          </p>
          
          <div className="about-float-badge top-right">
            <span style={{ fontSize: "1.3rem" }}>🎓</span>
            <span>Excellence académique</span>
          </div>
          
          <div className="about-float-badge bottom-left">
            <span style={{ fontSize: "1.3rem" }}>🏥</span>
            <span>Pratique hospitalière</span>
          </div>
        </div>
        
        <div className="about-content reveal-right">
          <span className="eyebrow">À propos de l'ISTM-BOMA</span>
          <h2>Former les professionnels de santé de demain</h2>
          <p>
            L’<strong>Institut Supérieur des Techniques Médicales de Boma (ISTM-BOMA)</strong> est un établissement d'enseignement supérieur du Ministère de l'Enseignement Supérieur et Universitaire en République Démocratique du Congo.
          </p>
          <p>
            Situé à Boma, dans le Kongo Central, notre institut prépare les étudiants à devenir des praticiens et cadres d'excellence dans le secteur de la santé, alliant compétence scientifique et conscience professionnelle (<em>Scientia Splendet et Conscientia</em>).
          </p>
          
          <div className="about-highlights stagger">
            <div className="about-highlight">
              <div className="about-highlight-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <div>
                <h4>Vacations Adaptées</h4>
                <p>Cours organisés en Jour et Soir.</p>
              </div>
            </div>
            <div className="about-highlight">
              <div className="about-highlight-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <div>
                <h4>Passerelle Pro</h4>
                <p>Licence Spéciale en 1 an et demi.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
