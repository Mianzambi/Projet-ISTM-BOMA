"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Connexion Supabase
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError("Email ou mot de passe incorrect.");
      return;
    }

    // Vérifie dans la table admins
    const { data: adminRow } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    // Si on est dans la table OU si l'email est l'email admin par défaut
    const isAdmin = adminRow || data.user.email === "admin@istmboma.cd";

    setLoading(false);
    router.push(isAdmin ? "/admin" : "/tableau-de-bord");
    router.refresh();
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
      style={{ background: 'linear-gradient(135deg, var(--navy), var(--blue-dark))' }}
    >
      
      {/* Background animated orbs */}
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>
      
      <div className="w-full max-w-md relative z-10 reveal-scale">
        <div style={{
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius)',
          padding: '48px 40px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          
          <div className="text-center mb-8 stagger">
            <Link href="/" className="inline-block mb-4 transition-transform hover:scale-105 reveal">
              <img src="/logo.jpg" alt="Logo ISTM BOMA" className="h-16 w-auto mx-auto rounded-xl shadow-sm" />
            </Link>
            <h2 className="text-2xl font-bold text-slate-800 reveal">Portail Étudiant</h2>
            <p className="text-slate-500 text-sm mt-2 reveal">
              Connectez-vous à votre espace personnel
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm mb-6 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 stagger">
            <div className="reveal">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Adresse e-mail
              </label>
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                required
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
                  Connexion en cours...
                </span>
              ) : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center reveal">
            <p className="text-sm text-slate-500">
              Nouveau sur le portail ?{' '}
              <Link href="/inscription" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}