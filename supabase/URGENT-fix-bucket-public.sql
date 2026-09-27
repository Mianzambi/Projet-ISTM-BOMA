-- ============================================================
-- URGENT — à exécuter EN PREMIER, avant toute autre chose.
-- Ferme le bucket public qui exposait les documents des étudiants.
-- ============================================================

update storage.buckets set public = false where id = 'documents-etudiants';

-- Vérification : cette requête doit renvoyer "false" dans la colonne public.
select id, name, public from storage.buckets where id = 'documents-etudiants';
