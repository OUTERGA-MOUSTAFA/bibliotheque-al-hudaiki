<div align="center">

# 📚 Bibliothèque Al Hudaiki — Platform

**Plateforme web de gestion et de valorisation du fonds documentaire de la Bibliothèque Al Hudaiki — Tafraout, Maroc**

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![Render](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render&logoColor=white)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CNDP 09-08](https://img.shields.io/badge/Conformit%C3%A9-Loi%2009--08-blue)](https://www.cndp.ma)

📖 [Documentation](#-table-des-matières) · 🐛 [Signaler un bug](issues) · 💡 [Proposer une fonctionnalité](issues)

</div>

---

## 📑 Table des matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture & Stack](#-architecture--stack-technique)
- [Modèle de données](#-modèle-de-données)
- [Installation locale](#-installation-locale)
- [Variables d'environnement](#-variables-denvironnement)
- [Guide de déploiement gratuit](#-guide-de-déploiement-100-gratuit)
- [CI/CD et sécurité](#-cicd-et-sécurité)
- [Conformité Loi 09-08 (CNDP)](#-conformité-loi-09-08-cndp)
- [Roadmap](#-roadmap)
- [Contributeurs](#-contributeurs)
- [Licence](#-licence)

---

## 🎯 Présentation

La **Bibliothèque Al Hudaiki**, située à Tafraout (Maroc), digitalise l'intégralité de son activité :
catalogue documentaire, inscriptions des lecteurs, prêts, retours, suivi des retards et mise en valeur
des ouvrages — avec une expérience pensée **particulièrement pour les enfants**.

> 📍 Localisation : [Bibliothèque Al Hudaiki, Tafraout](https://maps.google.com/?q=29.718881,-8.978229)

### Objectifs

| # | Objectif |
|---|----------|
| 1 | Valoriser les ouvrages les plus lus via une page d'accueil attractive |
| 2 | Permettre la recherche et le filtrage avancés du catalogue |
| 3 | Gérer les inscriptions et réserver l'emprunt aux membres inscrits |
| 4 | Digitaliser le cycle de prêt (enregistrement, retour, retards, historique) |
| 5 | Fournir un back-office admin sécurisé (2FA) |
| 6 | Garantir le multilinguisme **Arabe / Français** (RTL) et la conformité **Loi 09-08** |

---

## ✨ Fonctionnalités

### 🌐 Espace Public (Front-Office)

- 🎠 **Carrousel dynamique** des livres les plus lus / recommandés
- 🧒 **Section enfants** avec phrases d'accroche ludiques
- 📊 Section « **Les plus lus ce mois-ci** » (alimentée par les stats de prêt)
- 🗂️ **Catégories** en vignettes cliquables
- 🤝 **Sponsors / Partenaires** (logos cliquables gérés en back-office)
- 🔍 **Recherche plein texte** (titre, résumé, thèmes, personnes, lieux, langue)
- 🎛️ **Filtres combinables** : catégorie, langue, thème, période, disponibilité, tri
- 📖 **Fiche livre** : couverture, description, résumé, avis, favoris
- 📩 **Page contact** → e-mail direct à l'admin (livre souhaité + durée + coordonnées)
- ℹ️ Page **Histoire & Équipe**
- 🌍 **Sélecteur FR / AR** avec support RTL complet

### 👤 Espace Lecteur

- 📝 **Inscription** : nom, prénom, date de naissance, adresse (+ lien Maps), téléphone, **CIN** (majeur), **N° Massar** (étudiant), email + mot de passe
- 🔐 **Authentification sécurisée** (Sanctum)
- ❤️ Gestion des **favoris** et **avis**
- 📚 **Demande / emprunt** de livres (réservé aux inscrits)
- 🕓 **Historique** complet des emprunts

### 🛡️ Espace Administrateur

- 🔒 **2FA** (Laravel Fortify) + rate limiting + journalisation
- 📊 **Tableau de bord** catalogue (titre, couverture, avis, favoris)
- ➕ **Ajouter / Modifier / Archiver / Supprimer** un livre
- 🖨️ **Action rapide « Prêter »** depuis la fiche livre
- 🧾 **Page « Nouveau prêt »** : sélection livre + emprunteur (autocomplete) + dates
- ⏰ **Suivi des emprunts & retards** (cartes lecteurs, alertes rouges)
- 👥 **Gestion des utilisateurs** (ajouter, archiver, modifier, supprimer)
- 🏷️ Gestion des **catégories** et **sponsors**

---

## 🏗️ Architecture & Stack technique

```
┌──────────────────────┐      REST/JSON      ┌──────────────────────┐
│   Next.js 16 (SSR)   │ ◄─────────────────► │   Laravel 12 (API)   │
│   Vercel Edge        │   Sanctum + CORS    │   Render / Koyeb     │
└──────────┬───────────┘                     └──────────┬───────────┘
           │                                            │
           │  next-intl (FR/AR + RTL)                   │  Eloquent
           │  TanStack Query                            │
           ▼                                            ▼
     ┌───────────┐                              ┌────────────────┐
     │ Cloudinary│ ◄──── images ────────────────│  PostgreSQL 16 │
     └───────────┘                              │  Neon.tech     │
                                                └────────────────┘
                                                       ▲
                                              Resend API (emails)

---

## 🔁 CI/CD et sécurité

### Intégration continue (`.github/workflows/ci.yml`)

Chaque push et chaque pull request lance 4 vérifications en parallèle :

| Job | Ce qu'il vérifie |
|---|---|
| **Backend** | tests PHPUnit sur un vrai PostgreSQL 18 (même version que Neon), dont les tests d'attaque (`tests/Feature/AttackScenariosTest.php`) ; `composer audit` |
| **Frontend** | ESLint, TypeScript, `next build` ; `npm audit` (failles graves) |
| **Docker** | l'image de production Railway se construit |
| **Secrets** | gitleaks : aucun mot de passe ni clé API dans le code |

S'y ajoutent **CodeQL** (`codeql.yml`, analyse de sécurité du TypeScript et des workflows) et **Dependabot** (`.github/dependabot.yml`, pull requests automatiques pour les dépendances à mettre à jour).

### Déploiement continu

`main` est déployé automatiquement : **Railway** (backend) et **Vercel** (frontend).
Pour qu'un code cassé n'arrive jamais en production, trois réglages à faire une fois :

1. **Railway** → service backend → *Settings* → *Source* → activer **Wait for CI** : Railway ne déploie un commit que si la CI GitHub est verte.
2. **GitHub** → *Settings* → *Rules* → *Rulesets* → *New branch ruleset* sur `main` :
   - *Require a pull request before merging*
   - *Require status checks to pass* : `Backend (Laravel)`, `Frontend (Next.js)`, `Image Docker du backend`, `Pas de secret dans le code`
   - *Block force pushes*

   Vercel ne déploie en production que `main` : avec cette règle, rien n'y arrive sans CI verte. Les autres branches obtiennent une URL de prévisualisation.
3. **GitHub** → *Settings* → *Code security* : activer *Dependabot alerts*, *Dependabot security updates* et *Secret scanning*.

Le flux de travail devient : branche → push → pull request → CI verte → fusion dans `main` → déploiement.

### Protections en place

- Limites de tentatives : connexion (par IP et par compte), code 2FA (5 essais puis retour au mot de passe), formulaire de contact, limite générale de l'API.
- L'app fait confiance au proxy de Railway : chaque visiteur est compté avec sa vraie adresse IP.
- Mots de passe : 8 caractères minimum avec lettres et chiffres ; en production, refus des mots de passe ayant fuité (Have I Been Pwned).
- Changer d'e-mail ou de mot de passe exige le mot de passe actuel ; un nouveau mot de passe déconnecte les autres appareils.
- En-têtes de sécurité : CSP stricte, HSTS, anti-clickjacking (frontend et API) ; PHP et Apache n'annoncent plus leur version.
- Images envoyées : jpg/png/gif/webp seulement (SVG refusé), 5 Mo maximum.
- Données sensibles (CIN, Massar, secrets 2FA) jamais renvoyées par l'API ; sauvegarde quotidienne chiffrée de la base.
