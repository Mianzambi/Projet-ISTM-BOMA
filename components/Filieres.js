import { licence, passerelle, master } from "@/lib/filieres";

export default function Filieres() {
  return (
    <section className="filieres" id="filieres">
      <div className="section-head reveal">
        <span className="eyebrow">Nos Offres de Formations</span>
        <h2>Sections Organisées & Passerelles</h2>
        <p>
          Des cursus spécialisés en techniques médicales pour répondre aux besoins de santé publique de notre société.
        </p>
      </div>

      <div className="filiere-group reveal">
        <h3>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Sections Organisées (Licence)
        </h3>
        <div className="filiere-pills stagger">
          {licence.map((item) => (
            <div className="filiere-card reveal-scale" key={item}>
              <div className="filiere-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <span className="filiere-title">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="filiere-group reveal">
        <h3>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          Année de Passerelle (Licence Spéciale — 1,5 an)
        </h3>
        <div className="filiere-pills stagger">
          {passerelle.map((item) => (
            <div className="filiere-card filiere-card--teal reveal-scale" key={item}>
              <div className="filiere-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
                </svg>
              </div>
              <span className="filiere-title">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {master && master.length > 0 && (
        <div className="filiere-group reveal">
          <h3>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            Cycle Supérieur (Master & Spécialisations)
          </h3>
          <div className="filiere-pills stagger">
            {master.map((item) => (
              <div className="filiere-card filiere-card--navy reveal-scale" key={item}>
                <div className="filiere-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </div>
                <span className="filiere-title">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
