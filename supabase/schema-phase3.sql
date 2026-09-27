-- ============================================================
-- Phase 3 : table des inscriptions + stockage sécurisé des documents
-- À exécuter une seule fois dans Supabase : SQL Editor → New query → colle
-- tout ce fichier → Run.
-- ============================================================

-- ---------- Table des inscriptions ----------
create table if not exists public.inscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  filiere text not null,
  niveau text not null,

  date_naissance date,
  lieu_naissance text,
  sexe text,
  adresse text,
  telephone text,
  ecole_origine text,

  -- Chemins des fichiers dans le bucket "documents" (pas les fichiers eux-mêmes)
  diplome_path text,
  carte_identite_path text,
  photo_path text,
  acte_naissance_path text,

  statut text not null default 'en_attente', -- en_attente | validee | rejetee

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id) -- une seule demande d'inscription par étudiant pour l'instant
);

alter table public.inscriptions enable row level security;

-- Un étudiant ne voit, ne crée et ne modifie QUE sa propre inscription.
create policy "Les étudiants voient leur propre inscription"
on public.inscriptions for select
to authenticated
using ( (select auth.uid()) = user_id );

create policy "Les étudiants créent leur propre inscription"
on public.inscriptions for insert
to authenticated
with check ( (select auth.uid()) = user_id );

create policy "Les étudiants modifient leur propre inscription"
on public.inscriptions for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

-- updated_at automatique à chaque modification
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

-- ---------- Stockage des documents ----------
-- Bucket privé : personne ne peut lire un fichier sans passer par une policy.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Chaque étudiant a son propre dossier, nommé avec son user id :
-- documents/{user_id}/diplome.pdf, documents/{user_id}/photo.jpg, etc.
-- (storage.foldername(name))[1] correspond à ce premier segment du chemin.

create policy "Upload dans son propre dossier"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Lecture de son propre dossier"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Remplacement de son propre dossier"
on storage.objects for update
to authenticated
using (
  bucket_id = 'documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
