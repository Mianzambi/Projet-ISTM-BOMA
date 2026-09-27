"use client";

import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    e.target.reset();
  }

  return (
    <section className="contact" id="contact">
      <div className="contact-inner">
        <div className="contact-info reveal-left">
          <span className="eyebrow">Nous contacter</span>
          <h2>Restons en contact</h2>
          <ul className="stagger">
            <li className="reveal">
              <div className="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <strong>Campus Boma</strong>
                <span>Ville de Boma, Kongo Central, RDC</span>
              </div>
            </li>
            <li className="reveal">
              <div className="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 2 .7 3a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c1 .3 2 .5 3 .6a2 2 0 011.6 2z" />
                </svg>
              </div>
              <div>
                <strong>Téléphone / WhatsApp</strong>
                <a href="https://wa.me/243890000000" target="_blank" rel="noopener noreferrer">
                  +243 89 000 0000
                </a>
              </div>
            </li>
            <li className="reveal">
              <div className="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16v16H4z" />
                  <path d="M4 4l8 9 8-9" />
                </svg>
              </div>
              <div>
                <strong>Email</strong>
                <a href="mailto:contact@istm-boma.ac.cd">contact@istm-boma.ac.cd</a>
              </div>
            </li>
          </ul>
        </div>

        <div className="contact-form-card reveal-right">
          <form className="contact-form stagger" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="reveal">
                Nom complet
                <input type="text" name="name" placeholder="Ex: Jean Dupont" required />
              </label>
              <label className="reveal">
                Adresse Email
                <input type="email" name="email" placeholder="jean@exemple.com" required />
              </label>
            </div>
            <label className="reveal">
              Sujet
              <input type="text" name="subject" placeholder="Raison de votre message" />
            </label>
            <label className="reveal">
              Message
              <textarea name="message" placeholder="Comment pouvons-nous vous aider ?" required></textarea>
            </label>
            <button type="submit" className="btn btn-primary reveal">Envoyer le message</button>
            {submitted && (
              <p className="form-note">
                Message enregistré localement pour la démo. Pour un envoi réel, ce formulaire
                devra être relié à un service d’emailing.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
