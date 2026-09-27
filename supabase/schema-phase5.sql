-- ============================================================
-- Phase 5 : un vrai rôle admin (remplace le mot de passe en dur
-- qui était visible dans le code envoyé au navigateur).
-- À exécuter dans Supabase : SQL Editor → New query → colle → Run.
-- ============================================================

-- Table qui liste qui est admin. Volontairement minimale : juste un lien
-- vers un compte Supabase Auth existant.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Un utilisateur connecté peut seulement vérifier SI IL EST LUI-MÊME admin —
-- jamais voir la liste complète des admins.
create policy "Chacun vérifie seulement son propre statut admin"
on public.admins for select
to authenticated
using ( (select auth.uid()) = user_id );

-- ---------- Donne aux admins un accès élargi aux inscriptions ----------
-- Les policies existantes (étudiant voit/modifie sa propre ligne) restent en
-- place. Celles-ci s'ajoutent : Postgres les combine avec un "OU", donc un
-- étudiant normal ne voit toujours que sa ligne, et un admin voit tout en plus.

create policy "Les admins voient toutes les inscriptions"
on public.inscriptions for select
to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

create policy "Les admins modifient le statut de toute inscription"
on public.inscriptions for update
to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- ---------- Donne aux admins un accès élargi aux documents ----------
create policy "Les admins lisent tous les documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents'
  and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

-- ---------- Étape manuelle : fais-toi admin ----------
-- 1. Supabase → Authentication → Users → trouve ton compte → copie son "User UID".
-- 2. Remplace la valeur ci-dessous par ce UID, puis exécute cette ligne seule :
--
-- insert into public.admins (user_id) values ('colle-ton-user-uid-ici');

-- ============================================================
-- Table profiles : nom + email de chaque étudiant, lisible par l'admin.
-- (auth.users n'est pas directement interrogeable depuis le site — cette
-- table publique en garde une copie à jour automatiquement.)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Chacun voit son propre profil"
on public.profiles for select
to authenticated
using ( (select auth.uid()) = id );

create policy "Les admins voient tous les profils"
on public.profiles for select
to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );

-- À chaque inscription (signUp), copie automatiquement le nom et l'email
-- dans profiles. "security definer" est nécessaire ici pour pouvoir écrire
-- dans profiles au moment même de la création du compte.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Pour les comptes déjà créés avant l'ajout de ce trigger (tes comptes de
-- test), remplit profiles rétroactivement :
insert into public.profiles (id, full_name, email)
select id, raw_user_meta_data->>'full_name', email
from auth.users
on conflict (id) do nothing;

