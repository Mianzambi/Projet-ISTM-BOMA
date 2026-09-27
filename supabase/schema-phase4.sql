-- ============================================================
-- Phase 4 : historique des paiements (lecture seule côté étudiant)
-- Les paiements se font en présentiel — ce tableau ne sert qu'à afficher
-- un historique, jamais à encaisser en ligne.
-- À exécuter dans Supabase : SQL Editor → New query → colle → Run.
-- ============================================================

create table if not exists public.paiements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  montant numeric(12,2) not null,
  devise text not null default 'USD',
  motif text not null,           -- ex. "Frais d'inscription 2026-2027", "Minerval - Tranche 1"
  mode_paiement text,            -- ex. "Espèces au guichet", "Virement bancaire"
  date_paiement date not null default current_date,
  note text,

  created_at timestamptz not null default now()
);

alter table public.paiements enable row level security;

-- Les étudiants peuvent UNIQUEMENT consulter leur propre historique.
-- Volontairement, aucune policy d'insertion/modification n'est créée pour eux :
-- une table protégée par RLS refuse par défaut toute action sans policy
-- correspondante. Donc pour l'instant, seul le personnel ajoute des lignes,
-- directement depuis Supabase → Table Editor → paiements → Insert row.
-- (La Phase 5, l'espace admin, remplacera ce geste manuel par un vrai formulaire.)
create policy "Les étudiants consultent leur propre historique de paiements"
on public.paiements for select
to authenticated
using ( (select auth.uid()) = user_id );
