"use client";

import { useState, useEffect } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-inner">
        <a href="#accueil" className="brand">
          <img
            src="/logo.jpg"
            alt="Logo ISTM BOMA"
            style={{ height: 42, width: "auto", borderRadius: 8 }}
          />
          <span>ISTM<span style={{color: "var(--blue)"}}>/</span>BOMA</span>
        </a>

        <nav className="main-nav">
          <a href="#accueil">Accueil</a>
          <a href="#apropos">À propos</a>
          <a href="#filieres">Filières</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-actions">
          <a href="/connexion" className="btn btn-outline btn-sm">
            Espace Étudiant
          </a>
          <button
            className={`nav-toggle ${open ? "open" : ""}`}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="mobile-menu wrap">
          <a href="#accueil" onClick={() => setOpen(false)}>Accueil</a>
          <a href="#apropos" onClick={() => setOpen(false)}>À propos</a>
          <a href="#filieres" onClick={() => setOpen(false)}>Filières</a>
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
          <a
            href="/connexion"
            className="btn btn-primary btn-sm"
            style={{ textAlign: "center", marginTop: 8 }}
            onClick={() => setOpen(false)}
          >
            Espace Étudiant
          </a>
        </nav>
      )}
    </header>
  );
}
