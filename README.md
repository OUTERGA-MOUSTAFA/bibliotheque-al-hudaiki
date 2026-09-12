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
