"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // Si Supabase renvoie directement une session (confirmation email désactivée)
    if (data.session) {
      setLoading(false);
      router.push("/tableau-de-bord");
      router.refresh();
      return;
    }

    // Essayer de se connecter directement (au cas où la confirmation email est désactivée dans Supabase)
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInData?.session) {
      router.push("/tableau-de-bord");
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--navy), var(--blue-dark))' }}>
        <div className="w-full max-w-md relative z-10 reveal-scale">
          <div style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius)', padding: '48px 40px', boxShadow: 'var(--shadow-xl)', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Vérifie ta boîte mail</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Un email de confirmation a été envoyé à <strong className="text-slate-800">{email}</strong>. Clique sur le lien pour activer ton compte.
            </p>
            <Link href="/connexion" className="inline-block w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-xl transition-all">
              Aller à la connexion
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--navy), var(--blue-dark))' }}>
      {/* Background animated orbs */}
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>
      <div className="hero-orb hero-orb-3"></div>

      <div className="w-full max-w-md relative z-10 reveal-scale my-8">
        <div style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius)', padding: '48px 40px', boxShadow: 'var(--shadow-xl)', border: '1px solid rgba(255,255,255,0.2)' }}>
          
          <div className="text-center mb-8 stagger">
            <Link href="/" className="inline-block mb-4 transition-transform hover:scale-105 reveal">
              <img src="/logo.jpg" alt="Logo ISTM BOMA" className="h-14 w-auto mx-auto rounded-xl shadow-sm" />
            </Link>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1 reveal">Espace Étudiant</p>
            <h2 className="text-2xl font-bold text-slate-800 reveal">Créer mon compte</h2>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm mb-6 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 stagger">
            <div className="reveal">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom complet</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Ex: Jean Mianzambi"
              />
            </div>

            <div className="reveal">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="prenom.nom@exemple.com"
              />
            </div>

            <div className="reveal">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe <span className="text-slate-400 font-normal text-xs">(8 min)</span></label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="reveal w-full py-3.5 mt-4 text-white font-semibold rounded-xl shadow-lg transition-transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--blue), var(--cyan))' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Création en cours...
                </span>
              ) : "S'inscrire"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center reveal">
            <p className="text-sm text-slate-500">
              Vous avez déjà un compte ?{' '}
              <Link href="/connexion" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
