-- ============================================================
-- Phase 7 : l'admin peut publier des paiements et des résultats
-- depuis l'interface, sans passer par le Table Editor de Supabase.
-- À exécuter dans Supabase : SQL Editor → New query → colle → Run.
-- ============================================================

-- Jusqu'ici, seuls le Table Editor (via le rôle postgres, qui ignore les
-- RLS) pouvait écrire dans paiements. On ajoute maintenant une policy pour
-- que les comptes marqués admin puissent le faire depuis le site.
create policy "Les admins gèrent tous les paiements"
on public.paiements for all
to authenticated
using ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) )
with check ( exists (select 1 from public.admins a where a.user_id = (select auth.uid())) );
