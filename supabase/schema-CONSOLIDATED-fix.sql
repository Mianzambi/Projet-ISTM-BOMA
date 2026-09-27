-- ============================================================
-- Script consolidé — sûr à exécuter même si des parties ont déjà
-- été lancées avant (tout est écrit pour ne jamais planter si ça
-- existe déjà). Objectif : garantir que l'admin voit TOUS les
-- étudiants, pas seulement sa propre ligne.
-- ============================================================

-- ---------- admins ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

drop policy if exists "Chacun vérifie seulement son propre statut admin" on public.admins;
create policy "Chacun vérifie seulement son propre statut admin"
on public.admins for select
to authenticated
using ( (select auth.uid()) = user_id );

-- ---------- profiles (nom + email, lisible par l'admin) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "Chacun voit son propre profil" on public.profiles;
create policy "Chacun voit son propre profil"
on public.profiles for select to authenticated
using ( (select auth.uid()) = id );

drop policy if exists "Les admins voient tous les profils" on public.profiles;
create policy "Les admins voient tous les profils"
on public.profiles for select to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, email)
select id, raw_user_meta_data->>'full_name', email from auth.users
on conflict (id) do nothing;

-- ---------- accès admin élargi sur inscriptions ----------
drop policy if exists "Les admins voient toutes les inscriptions" on public.inscriptions;
create policy "Les admins voient toutes les inscriptions"
on public.inscriptions for select to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

drop policy if exists "Les admins modifient le statut de toute inscription" on public.inscriptions;
create policy "Les admins modifient le statut de toute inscription"
on public.inscriptions for update to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- ---------- accès admin élargi sur les documents ----------
drop policy if exists "Les admins lisent tous les documents" on storage.objects;
create policy "Les admins lisent tous les documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'documents'
  and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

-- ---------- résultats ----------
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

drop policy if exists "Les étudiants voient leurs propres résultats" on public.resultats;
create policy "Les étudiants voient leurs propres résultats"
on public.resultats for select to authenticated
using ( (select auth.uid()) = user_id );

drop policy if exists "Les admins gèrent tous les résultats" on public.resultats;
create policy "Les admins gèrent tous les résultats"
on public.resultats for all to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) )
with check ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- ---------- paiements : accès admin élargi ----------
drop policy if exists "Les admins gèrent tous les paiements" on public.paiements;
create policy "Les admins gèrent tous les paiements"
on public.paiements for all to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) )
with check ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- ---------- horaires ----------
create table if not exists public.horaires (
  id uuid primary key default gen_random_uuid(),
  filiere text not null,
  niveau text not null,
  jour text not null,
  heure_debut text not null,
  heure_fin text not null,
  matiere text not null,
  salle text,
  created_at timestamptz not null default now()
);
alter table public.horaires enable row level security;

drop policy if exists "Les étudiants connectés consultent les horaires" on public.horaires;
create policy "Les étudiants connectés consultent les horaires"
on public.horaires for select to authenticated
using ( true );

drop policy if exists "Les admins gèrent les horaires" on public.horaires;
create policy "Les admins gèrent les horaires"
on public.horaires for all to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) )
with check ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- ---------- liste de promotion (nom + filière + niveau seulement) ----------
create or replace view public.promotion_publique as
select i.filiere, i.niveau, p.full_name
from public.inscriptions i
join public.profiles p on p.id = i.user_id
where i.statut = 'validee';

grant select on public.promotion_publique to authenticated;

-- Vérification : doit renvoyer TOUTES les inscriptions, pas seulement une.
select count(*) as nombre_total_inscriptions from public.inscriptions;
