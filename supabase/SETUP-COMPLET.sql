-- ============================================================
-- ISTM-BOMA — Script SQL complet à exécuter UNE SEULE FOIS
-- dans Supabase : SQL Editor → New query → colle tout → Run.
-- Sûr à relancer : utilise IF NOT EXISTS / ON CONFLICT partout.
-- ============================================================

-- ╔════════════════════════════════════════════════════════════╗
-- ║  1. TABLE ADMINS                                          ║
-- ╚════════════════════════════════════════════════════════════╝
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

-- ╔════════════════════════════════════════════════════════════╗
-- ║  2. TABLE PROFILES                                        ║
-- ╚════════════════════════════════════════════════════════════╝
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

-- Ajouter les colonnes manquantes si la table existait déjà avec un ancien schéma
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

alter table public.profiles enable row level security;

drop policy if exists "Chacun voit son propre profil" on public.profiles;
create policy "Chacun voit son propre profil"
on public.profiles for select to authenticated
using ( (select auth.uid()) = id );

drop policy if exists "Les admins voient tous les profils" on public.profiles;
create policy "Les admins voient tous les profils"
on public.profiles for select to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- Trigger : copie automatiquement nom + email dans profiles à chaque inscription
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

-- Remplir profiles pour les comptes déjà existants
insert into public.profiles (id, full_name, email)
select id, raw_user_meta_data->>'full_name', email from auth.users
on conflict (id) do nothing;

-- ╔════════════════════════════════════════════════════════════╗
-- ║  3. TABLE INSCRIPTIONS                                    ║
-- ╚════════════════════════════════════════════════════════════╝
create table if not exists public.inscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filiere text not null,
  niveau text not null,
  vacation text,
  date_naissance date,
  lieu_naissance text,
  sexe text,
  adresse text,
  telephone text,
  ecole_origine text,
  diplome_path text,
  carte_identite_path text,
  photo_path text,
  acte_naissance_path text,
  statut text not null default 'en_attente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
alter table public.inscriptions add column if not exists vacation text;
alter table public.inscriptions enable row level security;

-- Policies étudiants
drop policy if exists "Les étudiants voient leur propre inscription" on public.inscriptions;
create policy "Les étudiants voient leur propre inscription"
on public.inscriptions for select to authenticated
using ( (select auth.uid()) = user_id );

drop policy if exists "Les étudiants créent leur propre inscription" on public.inscriptions;
create policy "Les étudiants créent leur propre inscription"
on public.inscriptions for insert to authenticated
with check ( (select auth.uid()) = user_id );

drop policy if exists "Les étudiants modifient leur propre inscription" on public.inscriptions;
create policy "Les étudiants modifient leur propre inscription"
on public.inscriptions for update to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

-- Policies admins
drop policy if exists "Les admins voient toutes les inscriptions" on public.inscriptions;
create policy "Les admins voient toutes les inscriptions"
on public.inscriptions for select to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

drop policy if exists "Les admins modifient le statut de toute inscription" on public.inscriptions;
create policy "Les admins modifient le statut de toute inscription"
on public.inscriptions for update to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- updated_at automatique
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists inscriptions_updated_at on public.inscriptions;
create trigger inscriptions_updated_at
before update on public.inscriptions
for each row execute function public.set_updated_at();

-- ╔════════════════════════════════════════════════════════════╗
-- ║  4. TABLE PAIEMENTS                                       ║
-- ╚════════════════════════════════════════════════════════════╝
create table if not exists public.paiements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  montant numeric(12,2) not null,
  devise text not null default 'FC',
  motif text not null,
  mode_paiement text,
  date_paiement date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);
alter table public.paiements enable row level security;

drop policy if exists "Les étudiants consultent leur propre historique de paiements" on public.paiements;
create policy "Les étudiants consultent leur propre historique de paiements"
on public.paiements for select to authenticated
using ( (select auth.uid()) = user_id );

drop policy if exists "Les admins gèrent tous les paiements" on public.paiements;
create policy "Les admins gèrent tous les paiements"
on public.paiements for all to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) )
with check ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- ╔════════════════════════════════════════════════════════════╗
-- ║  5. TABLE FRAIS ACADÉMIQUES                               ║
-- ╚════════════════════════════════════════════════════════════╝
create table if not exists public.frais_academiques (
  niveau text primary key,
  montant numeric not null default 0,
  devise text not null default 'FC'
);
alter table public.frais_academiques enable row level security;

drop policy if exists "Tout le monde connecté peut consulter les frais" on public.frais_academiques;
create policy "Tout le monde connecté peut consulter les frais"
on public.frais_academiques for select to authenticated
using ( true );

drop policy if exists "Les admins gèrent les frais académiques" on public.frais_academiques;
create policy "Les admins gèrent les frais académiques"
on public.frais_academiques for all to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) )
with check ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- Valeurs par défaut des frais
insert into public.frais_academiques (niveau, montant) values
  ('L1 (LMD)', 0), ('L2 (LMD)', 0), ('L3 (LMD)', 0),
  ('Passerelle', 0), ('Master 1', 0), ('Master 2', 0)
on conflict (niveau) do nothing;

-- ╔════════════════════════════════════════════════════════════╗
-- ║  6. TABLE RÉSULTATS                                       ║
-- ╚════════════════════════════════════════════════════════════╝
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

-- ╔════════════════════════════════════════════════════════════╗
-- ║  7. TABLE COUPONS (bulletins PDF)                         ║
-- ╚════════════════════════════════════════════════════════════╝
create table if not exists public.coupons (
  user_id uuid primary key references auth.users(id) on delete cascade,
  coupon_path text not null,
  uploaded_at timestamptz not null default now()
);
alter table public.coupons enable row level security;

drop policy if exists "Un étudiant voit son propre coupon" on public.coupons;
create policy "Un étudiant voit son propre coupon"
on public.coupons for select to authenticated
using ( (select auth.uid()) = user_id );

drop policy if exists "Les admins gèrent tous les coupons" on public.coupons;
create policy "Les admins gèrent tous les coupons"
on public.coupons for all to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) )
with check ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- ╔════════════════════════════════════════════════════════════╗
-- ║  8. TABLE HORAIRES                                        ║
-- ╚════════════════════════════════════════════════════════════╝
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

-- ╔════════════════════════════════════════════════════════════╗
-- ║  9. VUE PROMOTION PUBLIQUE                                ║
-- ╚════════════════════════════════════════════════════════════╝
create or replace view public.promotion_publique as
select i.filiere, i.niveau, p.full_name
from public.inscriptions i
join public.profiles p on p.id = i.user_id
where i.statut = 'validee';

grant select on public.promotion_publique to authenticated;

-- ╔════════════════════════════════════════════════════════════╗
-- ║  10. STORAGE BUCKETS + POLICIES                           ║
-- ╚════════════════════════════════════════════════════════════╝

-- Bucket privé pour les documents d'inscription
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Bucket privé pour les coupons/bulletins PDF
insert into storage.buckets (id, name, public)
values ('coupons', 'coupons', false)
on conflict (id) do nothing;

-- Documents : chaque étudiant accède uniquement à son dossier
drop policy if exists "Upload dans son propre dossier" on storage.objects;
create policy "Upload dans son propre dossier"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

drop policy if exists "Lecture de son propre dossier" on storage.objects;
create policy "Lecture de son propre dossier"
on storage.objects for select to authenticated
using (
  bucket_id = 'documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

drop policy if exists "Remplacement de son propre dossier" on storage.objects;
create policy "Remplacement de son propre dossier"
on storage.objects for update to authenticated
using (
  bucket_id = 'documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

-- Documents : les admins lisent tous les documents
drop policy if exists "Les admins lisent tous les documents" on storage.objects;
create policy "Les admins lisent tous les documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'documents'
  and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

-- Coupons : un étudiant lit son propre coupon
drop policy if exists "Un étudiant lit son propre coupon (storage)" on storage.objects;
create policy "Un étudiant lit son propre coupon (storage)"
on storage.objects for select to authenticated
using (
  bucket_id = 'coupons'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

-- Coupons : les admins gèrent tous les coupons
drop policy if exists "Les admins gèrent tous les coupons (storage)" on storage.objects;
create policy "Les admins gèrent tous les coupons (storage)"
on storage.objects for all to authenticated
using (
  bucket_id = 'coupons'
  and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
)
with check (
  bucket_id = 'coupons'
  and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

-- ╔════════════════════════════════════════════════════════════╗
-- ║  11. AJOUTER TON COMPTE ADMIN                            ║
-- ║  ⚠️  REMPLACE l'email ci-dessous par le tien si besoin    ║
-- ╚════════════════════════════════════════════════════════════╝
-- Cette requête insère automatiquement le compte admin@istmboma.cd
-- dans la table admins, s'il existe déjà dans auth.users.
insert into public.admins (user_id)
select id from auth.users where email = 'admin@istmboma.cd'
on conflict (user_id) do nothing;

-- ============================================================
-- Vérification finale
-- ============================================================
select 'admins' as "table", count(*) as lignes from public.admins
union all select 'profiles', count(*) from public.profiles
union all select 'inscriptions', count(*) from public.inscriptions
union all select 'paiements', count(*) from public.paiements
union all select 'frais_academiques', count(*) from public.frais_academiques
union all select 'resultats', count(*) from public.resultats
union all select 'coupons', count(*) from public.coupons
union all select 'horaires', count(*) from public.horaires;
