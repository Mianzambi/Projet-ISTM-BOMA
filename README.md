# ISTM-BOMA — Site + Espace Étudiant & Administration (Next.js + Supabase)

Ce projet est la plateforme web officielle "tout-en-un" pour l'**Institut Supérieur des Techniques Médicales de Boma (ISTM-BOMA)**.
Il s'agit d'un projet indépendant disposant de son propre dépôt GitHub, de sa propre instance Supabase et de son propre déploiement Vercel.

## Démarrer en local

1. Installe les dépendances (nouvelles depuis la Phase 2, donc réinstalle même si tu l'avais déjà fait) :
   ```
   npm install
   ```
2. Copie `.env.local.example` vers `.env.local`, puis remplace les deux valeurs par
   celles de ton projet Supabase (Project Settings → API → Project URL / Publishable key).
3. Lance le serveur de développement :
   ```
   npm run dev
   ```
4. Ouvre [http://localhost:3000](http://localhost:3000).

## ⚠️ Config Supabase à faire une seule fois

Dans le tableau de bord Supabase → **Authentication → Sign In / Providers → Email** :
- Par défaut, Supabase envoie un email de confirmation à l'inscription. Le code gère
  les deux cas (avec ou sans confirmation), donc tu n'es pas obligé de changer ce
  réglage. Pour tester plus vite en développement, tu peux désactiver
  temporairement **"Confirm email"** — pense à le réactiver avant l'ouverture au
  public, sinon n'importe qui peut créer un compte avec un faux email.

## Ce qui a été ajouté en Phase 2

- **`lib/supabase/client.js`** et **`lib/supabase/server.js`** : les deux façons de parler
  à Supabase (depuis le navigateur, et depuis le serveur).
- **`proxy.js`** (à la racine) : c'est le nouveau nom de "middleware" depuis
  Next.js 16. Il tourne avant chaque page et redirige vers `/connexion` si
  quelqu'un essaie d'ouvrir `/tableau-de-bord` sans être connecté.
- **`/inscription`** : création de compte (nom, email, mot de passe).
- **`/connexion`** : connexion.
- **`/tableau-de-bord`** : page protégée, affiche le nom et l'email de l'étudiant
  connecté, avec un bouton de déconnexion.

## ⚠️ Mise à jour importante : Next.js 14 → 16

J'ai mis à jour `package.json` vers Next.js 16, parce que la nouvelle
authentification Supabase dépend de `proxy.js`, une fonctionnalité qui n'existe
qu'à partir de cette version. C'est un saut de deux versions majeures : après
`npm install`, lance `npm run build` en local **avant** de pousser sur GitHub,
pour repérer une éventuelle erreur de compilation pendant que tu es encore en
sécurité sur ta machine. Si tu as une erreur, copie-la moi telle quelle, on la
répare ensemble.

## Tester le parcours complet

1. Va sur `/inscription`, crée un compte de test.
2. Si la confirmation par email est activée, va cliquer sur le lien reçu, puis
   connecte-toi sur `/connexion`.
3. Tu dois arriver sur `/tableau-de-bord` avec ton nom affiché.
4. Essaie d'ouvrir `/tableau-de-bord` dans une fenêtre de navigation privée
   (donc déconnecté) : tu dois être renvoyé vers `/connexion`. C'est le test le
   plus important — s'il échoue, la protection ne fonctionne pas.
5. Clique sur "Se déconnecter", vérifie que tu es bien renvoyé à l'accueil.

## Déployer

1. `git add . && git commit -m "Phase 2 : authentification et espace étudiant" && git push`
2. Sur Vercel, dans les Settings du projet → Environment Variables, ajoute les
   deux mêmes variables que dans `.env.local` (Vercel ne lit jamais ton fichier
   local, il faut les redéclarer là-bas).
3. Redéploie.

## Prochaine étape : Phase 3

Une vraie table `students` dans Supabase (matricule, filière, etc.), le
formulaire d'inscription avec upload de documents, puis les paiements.

---

## Phase 3 : formulaire d'inscription et documents

### 1. Exécute le script SQL

Dans Supabase → **SQL Editor → New query**, colle tout le contenu de
`supabase/schema-phase3.sql`, puis **Run**. Ce script crée :
- la table `inscriptions` (avec RLS : chacun ne voit que sa propre ligne) ;
- le bucket de stockage `documents` (privé) ;
- les règles d'accès aux fichiers (chaque étudiant a son propre dossier,
  impossible d'accéder à celui d'un autre).

### 2. Ce qui a été ajouté

- **`/tableau-de-bord/inscription`** : le formulaire complet (formation,
  informations personnelles, 4 documents à uploader). Automatiquement protégé
  par `proxy.js`, comme le reste de `/tableau-de-bord`.
- Le tableau de bord affiche maintenant le statut de la demande
  (*en attente*, *validée*, *à corriger*) et un bouton vers le formulaire.
- **`lib/filieres.js`** : la liste des filières existe maintenant à un seul
  endroit, réutilisée par la page d'accueil et le formulaire.

### 3. Tester

1. Connecte-toi, va sur `/tableau-de-bord`, clique "Remplir mon dossier
   d'inscription".
2. Remplis le formulaire avec 4 petits fichiers de test (PDF ou image), envoie.
3. Retourne sur `/tableau-de-bord` : le statut "En attente de validation"
   doit apparaître.
4. Dans Supabase → Table Editor → `inscriptions`, vérifie que ta ligne existe
   bien, et dans Storage → `documents` → ton dossier (nommé avec ton user id),
   vérifie que les 4 fichiers sont là.
5. Optionnel mais rassurant : crée un deuxième compte de test, connecte-toi
   avec, et vérifie que tu ne peux PAS voir les fichiers du premier compte.

### Prochaine étape : Phase 4

Les paiements — jamais fait maison, toujours via un prestataire agréé
(Mobile Money, CinetPay, etc.), comme on en avait parlé au tout début.

---

## Phase 4 : historique des paiements (sans paiement en ligne)

Décision prise : les paiements restent en présentiel (au guichet). Le site
affiche seulement un historique en lecture seule, il n'encaisse jamais rien.

### 1. Exécute le script SQL

Dans Supabase → **SQL Editor → New query**, colle le contenu de
`supabase/schema-phase4.sql`, puis **Run**. Ça crée la table `paiements`,
avec une seule règle : un étudiant peut lire sa propre ligne, personne
(à part toi, depuis le Table Editor) ne peut en écrire une.

### 2. Comment enregistrer un paiement (pour l'instant, à la main)

Tant que l'espace admin (Phase 5) n'existe pas :
1. Supabase → **Table Editor → paiements → Insert row**.
2. Renseigne `user_id` (trouvable dans **Authentication → Users**, en
   cherchant l'email de l'étudiant), `montant`, `motif` (ex. "Frais
   d'inscription 2026-2027"), `mode_paiement` (ex. "Espèces au guichet"),
   `date_paiement`.
3. L'étudiant voit la ligne apparaître immédiatement sur son tableau de
   bord — pas besoin de redéployer quoi que ce soit.

### 3. Tableau de bord redessiné

- Une seule zone d'en-tête (nom + email + déconnexion), plus de carte
  "Mes informations" séparée et redondante.
- Le dossier d'inscription montre maintenant les documents envoyés, avec un
  lien "Voir" (lien signé, valable 5 minutes, généré à chaque chargement de
  page — le bucket reste privé).
- L'historique des paiements sous forme de tableau simple.

### Prochaine étape : Phase 5

L'espace administration : une interface pour le personnel (valider les
inscriptions, changer un statut, ajouter un paiement sans passer par le
Table Editor de Supabase).

---

## 🚨 Correctif de sécurité urgent (à faire en premier)

Un bucket de stockage **public** nommé `documents-etudiants` a été créé en
dehors de nos échanges, avec un accès non protégé aux documents des
étudiants (pièce d'identité, acte de naissance...). Exécute
`supabase/URGENT-fix-bucket-public.sql` dans le SQL Editor **avant toute
autre chose**. Seules des données de test étaient concernées, mais autant
fermer ça tout de suite.

## Phase 5 : espace admin (sécurisé)

### Ce qui a changé

- **Plus de mot de passe en dur.** L'ancienne page `/admin` vérifiait un mot
  de passe écrit en clair dans le code envoyé au navigateur — n'importe qui
  pouvait le lire depuis l'inspecteur, ou même contourner la vérification
  entièrement depuis la console. Elle a été remplacée : `/admin` vérifie
  maintenant un vrai compte Supabase Auth, marqué comme admin dans une table
  `admins` protégée par RLS.
- **Le tableau de bord étudiant n'affiche plus de données inventées**
  (frais, cours, examens fictifs qui étaient écrits en dur dans le code). Il
  n'affiche que ce qui existe réellement en base : dossier d'inscription,
  documents envoyés, historique des paiements.
- Ajout d'une table `profiles` (nom + email), remplie automatiquement à
  chaque inscription, pour que l'admin puisse identifier qui est qui — cette
  information n'était pas accessible avant.

### 1. Exécute le script SQL

`supabase/schema-phase5.sql` dans le SQL Editor. Il crée la table `admins`,
la table `profiles`, et élargit les règles d'accès pour que les admins
voient toutes les inscriptions (les étudiants continuent à ne voir que la
leur).

### 2. Fais-toi admin

Le script contient les instructions à la fin : trouve ton "User UID" dans
Authentication → Users, puis exécute la ligne d'insertion fournie.

### 3. Teste

1. Connecte-toi avec ton compte admin, va sur `/admin`.
2. Vérifie que tu vois la liste des inscriptions, avec les vrais noms/emails.
3. Clique "Valider" sur une inscription de test, vérifie que le statut
   change immédiatement sur `/tableau-de-bord` de ce compte étudiant.
4. Connecte-toi avec un compte étudiant normal (non-admin), essaie d'ouvrir
   `/admin` : tu dois être renvoyé vers `/tableau-de-bord`, sans y accéder.

### Une règle à garder, y compris avec d'autres outils IA

Dans `lib/supabase/client.js`, j'ai ajouté un commentaire d'avertissement :
toujours créer un client Supabase via ce fichier (ou `lib/supabase/server.js`
côté serveur), jamais directement avec `@supabase/supabase-js`. C'est cette
règle qui a été cassée deux fois par un autre outil, et qui a causé la boucle
de connexion, puis la faille de l'admin. Si tu redemandes une modification à
un autre assistant, tu peux lui coller ce commentaire pour qu'il la respecte.




## Phase 8 : nouvelle structure admin (Vacation → Filière → Promotion)

Refonte complète de l'espace admin selon le schéma fourni : plus de simple
liste, mais un parcours Vacation → Filières → Promotion → Étudiant.

### 1. Exécute les scripts SQL, dans l'ordre

1. `supabase/schema-CONSOLIDATED-fix.sql` (si pas encore fait — corrige les
   permissions admin de base).
2. `supabase/schema-phase8.sql` — ajoute la vacation, les frais académiques
   fixés par niveau, et les coupons PDF.

### 2. Nouvelle navigation admin

- `/admin` — accueil avec les 4 boutons (Vacation Jour, Vacation Soir,
  Inscription en attente, Frais académique).
- `/admin/vacation/Jour` (ou `Soir`) — grille des filières.
- `/admin/vacation/Jour/{filière}` — grille des promotions (L1 à M3).
- `/admin/vacation/Jour/{filière}/{niveau}` — liste des étudiants de cette
  promotion précise, avec sélection + bouton "Gérer".
- `/admin/inscriptions` — l'ancienne liste "en attente", inchangée dans son
  fonctionnement, juste déplacée.
- `/admin/frais` — modifier les 6 montants fixés (synchronisés
  automatiquement pour tous les étudiants du niveau).
- `/admin/etudiant/[id]` — désormais avec un coupon PDF à glisser-déposer
  (au lieu de saisir des notes matière par matière) et un résumé financier
  (Montant fixé / Déjà payé / Reste à payer).

### 3. Important : le formulaire d'inscription a un nouveau champ

`Vacation` (Jour/Soir) est maintenant demandé à l'étudiant. **Les
inscriptions déjà existantes avant cette mise à jour n'ont pas de valeur
pour ce champ** — elles n'apparaîtront dans aucune liste de promotion tant
que l'étudiant n'aura pas modifié son dossier pour choisir sa vacation (ou
que tu ne l'ajoutes toi-même directement dans Supabase, colonne `vacation`
de la table `inscriptions`).

### 4. Ce qui a été retiré

L'ancien système de notes par matière (table `resultats`, génération de PDF
via `@react-pdf/renderer`) est remplacé par un vrai fichier PDF que tu
uploades toi-même. La dépendance a été retirée de `package.json` — pense à
`npm install` pour que ton `node_modules` se resynchronise.

### 5. Teste dans l'ordre

1. Modifie un dossier étudiant de test pour lui choisir une vacation.
2. `/admin` → Vacation (la bonne) → sa filière → son niveau → il doit
   apparaître dans la liste.
3. Clique son nom → "Gérer" → dépose un PDF dans "RÉSULTAT" → "Ajouter".
4. Ajoute un montant dans "FINANCE" → "Confirmé".
5. Connecte-toi avec son compte étudiant → vérifie que le coupon est
   téléchargeable et que Finance affiche les bons chiffres.
6. `/admin/frais` → change un montant → vérifie qu'il se reflète bien côté
   étudiant après rafraîchissement.
