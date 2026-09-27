-- ============================================================
-- Phase 8 : nouvelle structure admin (Vacation / Filière / Promotion),
-- frais académiques fixés par niveau, et coupons PDF uploadés par l'admin.
-- Sûr à relancer plusieurs fois.
-- ============================================================

-- ---------- Vacation (Jour / Soir) sur chaque inscription ----------
alter table public.inscriptions add column if not exists vacation text;

-- ---------- Frais académiques fixés par niveau ----------
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

insert into public.frais_academiques (niveau, montant) values
  ('L1', 700000), ('L2', 800000), ('L3', 1000000),
  ('M1', 2000000), ('M2', 2500000), ('M3', 3000000)
on conflict (niveau) do nothing;

-- ---------- Coupons (bulletin PDF uploadé par l'admin) ----------
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

-- Bucket privé dédié aux coupons (séparé des documents d'inscription)
insert into storage.buckets (id, name, public)
values ('coupons', 'coupons', false)
on conflict (id) do nothing;

drop policy if exists "Un étudiant lit son propre coupon (storage)" on storage.objects;
create policy "Un étudiant lit son propre coupon (storage)"
on storage.objects for select to authenticated
using (
  bucket_id = 'coupons'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

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
