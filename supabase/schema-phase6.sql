-- ============================================================
-- Phase 6 : résultats (bulletin PDF), horaires, et liste de la promotion.
-- À exécuter dans Supabase : SQL Editor → New query → colle → Run.
-- ============================================================

-- ---------- Résultats académiques ----------
create table if not exists public.resultats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  annee_academique text not null default '2026-2027',
  semestre text,
  matiere text not null,
  credits numeric,
  note numeric,
  created_at timestamptz not null default now()
);

alter table public.resultats enable row level security;

create policy "Les étudiants voient leurs propres résultats"
on public.resultats for select
to authenticated
using ( (select auth.uid()) = user_id );

create policy "Les admins gèrent tous les résultats"
on public.resultats for all
to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) )
with check ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- ---------- Horaires ----------
-- Pas de données personnelles ici : un horaire est associé à une filière et
-- un niveau, pas à un étudiant précis. Donc pas besoin de restriction par
-- utilisateur, juste "réservé aux personnes connectées".
create table if not exists public.horaires (
  id uuid primary key default gen_random_uuid(),
  filiere text not null,
  niveau text not null,
  jour text not null,       -- ex. "Lundi"
  heure_debut text not null, -- ex. "08:00"
  heure_fin text not null,   -- ex. "10:00"
  matiere text not null,
  salle text,
  created_at timestamptz not null default now()
);

alter table public.horaires enable row level security;

create policy "Les étudiants connectés consultent les horaires"
on public.horaires for select
to authenticated
using ( true );

create policy "Les admins gèrent les horaires"
on public.horaires for all
to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) )
with check ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- ---------- Liste de la promotion (uniquement nom + filière + niveau) ----------
-- Une vue plutôt qu'une policy sur inscriptions directement : ça évite que
-- les étudiants d'une même promotion se voient mutuellement le téléphone,
-- l'adresse, la date de naissance ou les documents des autres. Cette vue
-- n'expose QUE ce qui est nécessaire pour une liste de classe.
create or replace view public.promotion_publique as
select i.filiere, i.niveau, p.full_name
from public.inscriptions i
join public.profiles p on p.id = i.user_id
where i.statut = 'validee';

grant select on public.promotion_publique to authenticated;

-- ---------- Correctif ponctuel : compte de test sans nom enregistré ----------
-- Adapte l'email et le nom, puis exécute cette ligne seule si besoin :
--
-- update public.profiles set full_name = 'Fils Mianzambi' where email = 'fmianzambi@gmail.com';
