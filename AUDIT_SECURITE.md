# Rapport d'Audit de Sécurité — ISC/BOMA Next.js

**Projet :** ISC / BOMA (Next.js & Supabase)
**Date :** 2025
**Auditeur :** Jules (Spécialiste Sécurité & Développement Web)
**Statut :** Recommandations & Correctifs Appliqués

---

##  EXECUTIVE SUMMARY (Résumé Exécutif)

Un audit de sécurité approfondi a été réalisé sur le projet Next.js de l'**Institut Supérieur de Commerce de Boma (ISC/BOMA)**. L'objectif principal de cet audit est d'identifier les vulnérabilités de sécurité potentielles au niveau des dépendances logicielle, de l'intégration de l'authentification Supabase, de la configuration du serveur web (Next.js) et des formulaires d'entrée utilisateur.

L'analyse a révélé plusieurs failles critiques et importantes, notamment :
1. Des vulnérabilités critiques liées à des versions obsolètes du framework **Next.js** et de la bibliothèque **PostCSS** (Remote Code Execution, SSRF, Cache Poisoning, Denial of Service).
2. Une absence de gestion d'erreur lors de l'absence de variables d'environnement Supabase (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`), risquant de faire planter l'application côté client.
3. L'absence d'en-têtes HTTP de sécurité (Content Security Policy, X-Frame-Options, Strict-Transport-Security, etc.) exposant le site à des attaques Cross-Site Scripting (XSS), Clickjacking et Man-in-the-Middle (MitM).

---

##  MATRICE DES VULNÉRABILITÉS IDENTIFIÉES

| ID | Intitulé de la Vulnérabilité | Sévérité | Statut |
|---|---|---|---|
| **SEC-01** | Vulnérabilités critiques dans les dépendances Next.js & PostCSS |  **CRITIQUE** | Correctif Appliqué |
| **SEC-02** | Absence d'en-têtes de sécurité HTTP (CSP, Clickjacking, HSTS) | 🟠 **ÉLEVÉ** | Correctif Appliqué |
| **SEC-03** | Instanciation Supabase sans validation des variables d'environnement |  **MOYEN** | Correctif Appliqué |
| **SEC-04** | Absence de validation de complexité de mot de passe à l'inscription | 🟡 **MOYEN** | Correctif Appliqué |
| **SEC-05** | Liens externes WhatsApp/Google sans attribut `rel="noopener noreferrer"` complet | 🟢 **FAIBLE** | Correctif Appliqué |

---

##  DÉTAIL DES VULNÉRABILITÉS ET PLAN DE REMÉDIATION

### 1. SEC-01 — Vulnérabilités critiques dans les dépendances Next.js & PostCSS
- **Sévérité :**  **CRITIQUE**
- **Description :** La version utilisée de `next` (14.2.5) présentait de multiples failles de sécurité publiées (CVE/GHSA), incluant des risques de RCE (Remote Code Execution), de SSRF (Server-Side Request Forgery) via le middleware, et des dénis de service (DoS) liés aux composants serveur et à l'optimisation des images. De même, `postcss` contenait des vulnérabilités d'injection XSS et de lecture arbitraire de fichiers.
- **Impact :** Prise de contrôle à distance possible du serveur, fuite d'informations sensibles, déni de service.
- **Remédiation appliquée :** Mise à jour de `next` vers la version patchée `^14.2.35` (ou dernière version LTS sécurisée) et mise à jour de `postcss`.

---

### 2. SEC-02 — Absence d'en-têtes de sécurité HTTP
- **Sévérité :** 🟠 **ÉLEVÉ**
- **Description :** Aucun en-tête de sécurité HTTP n'était configuré dans `next.config.js`. Le site était donc vulnérable au Clickjacking (incorporation dans une iframe malveillante) et aux injections de scripts (XSS).
- **Impact :** Vol de session utilisateur, détournement d'interface utilisateur, exécution de scripts malveillants.
- **Remédiation appliquée :** Ajout des en-têtes de sécurité recommandés dans `next.config.js` :
  - `Content-Security-Policy` (CSP)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `Permissions-Policy`

---

### 3. SEC-03 — Instanciation Supabase sans vérification préalable
- **Sévérité :**  **MOYEN**
- **Description :** Dans `app/connexion/page.js` et `app/inscription/page.js`, le client Supabase était instancié globalement avec `process.env.NEXT_PUBLIC_SUPABASE_URL`. Si ces variables n'étaient pas définies dans l'environnement de déploiement (ex. Vercel), l'application levait une exception non gérée au chargement du module client.
- **Impact :** Écran blanc / crash côté client pour les utilisateurs.
- **Remédiation appliquée :** Création d'un utilitaire centralisé et sécurisé pour l'initialisation du client Supabase avec vérification préalable des variables d'environnement et gestion d'erreurs conviviale.

---

### 4. SEC-04 — Validation de complexité de mot de passe
- **Sévérité :** 🟡 **MOYEN**
- **Description :** La page d'inscription autorisait la création de compte sans contrôle préalable de la longueur minimale et de la complexité du mot de passe côté client.
- **Impact :** Risque de création de comptes étudiants avec des mots de passe très faibles (ex: "123456"), exposés aux attaques par force brute.
- **Remédiation appliquée :** Ajout d'une règle de validation minimale de la longueur du mot de passe (au moins 8 caractères) côté client avant d'envoyer la requête d'inscription à Supabase.

---

### 5. SEC-05 — Liens externes et sécurité de navigation
- **Sévérité :** 🟢 **FAIBLE**
- **Description :** Certains liens externes ouvrant de nouveaux onglets (`target="_blank"`) manquaient de la directive `rel="noopener noreferrer"`.
- **Impact :** Attaque par `window.opener` (tabnabbing) où la page cible peut rediriger la page d'origine vers un site de phishing.
- **Remédiation appliquée :** Ajout systématique de `rel="noopener noreferrer"` sur tous les liens externes.

---

## 🛠️ RECOMMANDATIONS POUR LA PHASE 2 (SUPABASE & ACCÈS ÉTUDIANT)

Lorsque vous activerez la **Phase 2** (Tableau de bord étudiant et authentification complète) :
1. **Activer la vérification d'e-mail (Email Confirmation)** dans le dashboard Supabase.
2. **Configurer les règles RLS (Row Level Security)** sur toutes les tables de la base de données PostgreSQL dans Supabase pour garantir qu'un étudiant ne puisse lire/modifier que ses propres données.
3. **Mettre en place des variables d'environnement de production** chiffrées dans votre hébergeur (Vercel / Netlify / VPS).

---

*Fin du rapport d'audit de sécurité.*
