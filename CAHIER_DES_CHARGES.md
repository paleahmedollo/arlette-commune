# 📋 Cahier des Charges — Arlette Ma Commune

## 1️⃣ Présentation du projet

- **Nom** : Arlette Ma Commune
- **Signification** : "Arlette" les autorités = attire leur attention immédiatement sur un problème signalé
- **Objectif** : Permettre aux habitants de la Côte d'Ivoire de signaler des problèmes dans leur commune et suivre leur traitement par les autorités compétentes
- **Public cible** : Tous les citoyens ivoiriens ayant un smartphone
- **Zone pilote** : Côte d'Ivoire
- **Type** : Application mobile (iOS & Android)

---

## 2️⃣ Stack Technique

| Partie | Technologie |
|---|---|
| Mobile (citoyens) | React Native + Expo |
| Dashboard Web (structures/admin) | React.js + TypeScript |
| Backend API | Node.js + Express + Sequelize ORM |
| Base de données | PostgreSQL (Supabase) |
| Stockage photos | Cloudinary |
| Notifications Push | Firebase Cloud Messaging (FCM) |
| Auth / OTP SMS | JWT + Africa's Talking |
| Hébergement backend | Render |

---

## 3️⃣ Types d'utilisateurs

1. **Citoyen** — signale des problèmes, suit ses tickets
2. **Agent de structure** — traite les tickets, envoie des messages (web dashboard)
3. **Super Admin** — gère les structures, les agents, les statistiques

---

## 4️⃣ Fonctionnalités

### 4.1 Inscription & Connexion (Citoyen)
- Nom, prénom, numéro de téléphone, mot de passe
- Ville / commune (autocomplétion)
- OTP SMS pour valider le numéro de téléphone
- Connexion via téléphone + mot de passe
- Réinitialisation mot de passe

### 4.2 Signalement d'un problème
- Type de problème : route, lampadaire, déchets, eau, électricité, sécurité, santé, transport...
- **Photo prise en direct uniquement** (pas depuis la galerie — authenticité garantie)
- Nom du quartier + précision du lieu
- Géolocalisation GPS automatique
- Description facultative
- Validation avant envoi (photo + localisation + type obligatoires)

### 4.3 Envoi automatique & Ticket
- Envoi automatique à la structure responsable selon la catégorie
- Création automatique d'un ticket unique (ex: ARL-2026-00045)
- Statuts du ticket :
  - 🟡 Reçu
  - 🔵 En cours
  - 🟢 Résolu
  - 🔴 Refusé
- Notifications push à chaque mise à jour

### 4.4 Communication
- Les structures envoient des messages/remarques sur le ticket
- L'utilisateur reçoit une notification à chaque message

### 4.5 Dashboard Web (Autorités)
- Liste des signalements par type et localisation
- Photo et détails de chaque signalement
- Statistiques (problèmes fréquents, urgents, critiques)
- Filtres par statut, catégorie, quartier
- Export PDF des rapports

### 4.6 Fonctionnalités supplémentaires
- Carte interactive (Google Maps / OpenStreetMap)
- Mode hors ligne basique (brouillon local)
- Historique complet par utilisateur
- Système de modération (signalements abusifs)

---

## 5️⃣ Structures concernées

- Mairie
- Police
- SODECI (eau)
- CIE (électricité)
- Pompiers
- Autres (selon catégorie du problème)

---

## 6️⃣ Architecture technique

```
[Citoyen - App Mobile React Native]
        |
        ↓ API REST (JWT)
[Backend Node.js + Express]
        |
   ┌────┴────────────────┐
   |                     |
[PostgreSQL Supabase]  [Cloudinary Photos]
   |
   ├─ Notifications FCM → [Citoyen]
   ├─ Dashboard Web → [Agent Structure]
   └─ Super Admin Panel → [Administrateur]
```

---

## 7️⃣ Workflow utilisateur

1. Inscription / connexion (OTP SMS)
2. Recherche commune (autocomplétion)
3. Création signalement (photo live + GPS + catégorie + description)
4. Envoi automatique au service compétent
5. Création ticket (ARL-YYYY-XXXXX)
6. Suivi ticket + notifications push
7. Interaction avec le service (messages / remarques)
8. Résolution et clôture du ticket

---

## 8️⃣ Plan de développement

| Phase | Contenu | Durée |
|---|---|---|
| Phase 1 | Auth (inscription/connexion/OTP) + profil citoyen | 2 semaines |
| Phase 2 | Signalement (photo live + GPS + formulaire) + ticket | 2 semaines |
| Phase 3 | Dashboard web structures + gestion tickets | 2 semaines |
| Phase 4 | Notifications push FCM + messagerie ticket | 1 semaine |
| Phase 5 | Super Admin + statistiques + carte | 2 semaines |
| Phase 6 | Tests + corrections + déploiement pilote | 1 semaine |

**Total estimé : ~10 semaines**

---

## 9️⃣ Credentials & Services configurés

| Service | Statut |
|---|---|
| Cloudinary (photos) | ✅ Configuré |
| Supabase (base de données) | ✅ Configuré |
| Firebase (notifications) | ⏳ À configurer |
| Africa's Talking (SMS OTP) | ⏳ À configurer |
| Render (hébergement) | ⏳ À configurer |

---

## 🔐 Comptes par défaut (ne jamais réinitialiser)

| Compte | Rôle | À créer lors du déploiement |
|---|---|---|
| superadmin | Super Administrateur | ✅ |

---

## 📁 Structure du projet

```
D:\Arlette_Commune\
├── mobile/          → React Native + Expo (app citoyens)
├── backend/         → Node.js + Express API
│   ├── src/
│   │   ├── config/      → DB, Cloudinary, Firebase
│   │   ├── controllers/ → Logique métier
│   │   ├── models/      → Modèles Sequelize
│   │   ├── routes/      → Routes API
│   │   ├── middlewares/ → Auth, upload, validation
│   │   └── services/    → Upload, notifications, SMS
│   └── .env         → Variables d'environnement
└── CAHIER_DES_CHARGES.md
```

---

*Dernière mise à jour : Mars 2026*
