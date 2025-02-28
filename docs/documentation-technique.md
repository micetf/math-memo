# Documentation technique de l'application MathMemo

## Introduction

MathMemo est une application web progressive (PWA) conçue pour aider les élèves du cycle 2 (CP, CE1, CE2) à mémoriser les faits numériques en utilisant la technique de la répétition espacée. Ce document fournit toutes les informations nécessaires pour comprendre l'architecture, l'organisation du code et les fonctionnalités principales afin de permettre la poursuite du développement de l'application.

## Vue d'ensemble du projet

### Objectif

Développer une application éducative interactive qui :

-   Permet aux élèves de 6 à 9 ans de mémoriser efficacement les faits numériques
-   Utilise un algorithme de répétition espacée pour optimiser l'apprentissage
-   Propose une progression didactique structurée et adaptée au programme scolaire
-   Fonctionne hors ligne grâce aux technologies PWA

### Stack technique

-   **Frontend** : React 18.2 avec hooks natifs (useState, useReducer, Context API)
-   **Styling** : Tailwind CSS 3.4.17 en mode JIT
-   **Build/Bundler** : Vite
-   **Routage** : React Router DOM
-   **PWA** : Service Worker, Web App Manifest
-   **Stockage** : LocalStorage (données utilisateur et progression)

## Structure du projet

```
mathmemo/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── manifest.json
│   ├── service-worker.js        # Service worker pour le mode hors ligne
│   └── icons/                   # Icônes pour la PWA
├── src/
│   ├── assets/
│   │   ├── sounds/              # Effets sonores (succès, erreur)
│   │   └── images/
│   ├── components/
│   │   ├── common/              # Composants réutilisables (Button, Card, etc.)
│   │   ├── layout/              # Composants de mise en page (Header, Layout, etc.)
│   │   └── exercises/           # Composants pour les exercices
│   ├── contexts/
│   │   ├── AuthContext.js       # Contexte pour l'authentification
│   │   ├── AuthProvider.jsx     # Provider pour l'authentification
│   │   ├── ProgressContext.js   # Contexte pour la progression
│   │   └── ProgressProvider.jsx # Provider pour la progression
│   ├── hooks/
│   │   ├── useLocalStorage.js   # Hook pour la gestion du stockage local
│   │   ├── useSpacedRepetition.js # Hook pour l'algorithme de répétition espacée
│   │   └── useAudio.js          # Hook pour la gestion des effets sonores
│   ├── pages/
│   │   ├── Home.jsx             # Page d'accueil
│   │   ├── Exercise.jsx         # Page d'exercices
│   │   ├── Progress.jsx         # Page de suivi de progression
│   │   └── Settings.jsx         # Page de paramètres
│   ├── data/
│   │   └── progressions.js      # Données des progressions didactiques par niveau
│   ├── services/
│   │   └── pwaService.js        # Services pour la gestion PWA
│   ├── App.jsx                  # Composant principal
│   ├── main.jsx                 # Point d'entrée
│   └── index.css                # Styles globaux avec Tailwind
├── index.html
├── vite.config.js               # Configuration de Vite et des plugins PWA
├── package.json
├── tailwind.config.js           # Configuration de Tailwind CSS
└── README.md
```

## Modules clés et architecture

### 1. Algorithme de répétition espacée

L'algorithme de répétition espacée est au cœur de l'application, implémenté dans le hook personnalisé `useSpacedRepetition`. Il gère l'apprentissage adaptatif en présentant les faits numériques à des intervalles optimaux.

#### Fichier principal : `src/hooks/useSpacedRepetition.js`

```javascript
// Niveaux de connaissance pour l'algorithme
export const KNOWLEDGE_LEVELS = {
    NEW: 0, // Nouveau fait numérique
    LEARNING: 1, // En cours d'apprentissage
    REVIEWING: 2, // En révision
    MASTERED: 3, // Maîtrisé
};

// Intervalle de répétition en jours selon le niveau
const REPETITION_INTERVALS = {
    [KNOWLEDGE_LEVELS.NEW]: 0, // Le jour même
    [KNOWLEDGE_LEVELS.LEARNING]: 1, // 1 jour
    [KNOWLEDGE_LEVELS.REVIEWING]: 3, // 3 jours
    [KNOWLEDGE_LEVELS.MASTERED]: 7, // 7 jours
};

// Nombre de succès nécessaires pour passer au niveau suivant
const SUCCESS_THRESHOLD = {
    [KNOWLEDGE_LEVELS.NEW]: 2,
    [KNOWLEDGE_LEVELS.LEARNING]: 3,
    [KNOWLEDGE_LEVELS.REVIEWING]: 4,
};
```

Le hook fournit les fonctions suivantes :

-   `addFact` et `addMultipleFacts` : Ajout de faits numériques à la base de connaissances
-   `updateFactProgress` : Mise à jour de la progression d'un fait après une réponse
-   `getFactsToReviewToday` : Récupération des faits à réviser aujourd'hui
-   `getProgressStats` : Statistiques sur la progression globale

### 2. Progression didactique

La progression didactique est définie dans `src/data/progressions.js` et organise les faits numériques par niveau scolaire (CP, CE1, CE2), puis par période et par unité d'apprentissage.

#### Fichier principal : `src/data/progressions.js`

```javascript
// Types d'opérations
export const OPERATION_TYPES = {
    ADDITION: "addition",
    SUBTRACTION: "subtraction",
    MULTIPLICATION: "multiplication",
    DIVISION: "division",
    COMPARISON: "comparison",
    DOUBLES: "doubles",
    COMPLEMENTS: "complements",
};

// Niveaux de difficulté
export const DIFFICULTY_LEVELS = {
    CP: "cp", // Cours préparatoire (6-7 ans)
    CE1: "ce1", // Cours élémentaire 1 (7-8 ans)
    CE2: "ce2", // Cours élémentaire 2 (8-9 ans)
};

// Progressions didactiques structurées
export const PROGRESSIONS = {
    [DIFFICULTY_LEVELS.CP]: {
        // Progression CP
        id: "cp",
        name: "CP (6-7 ans)",
        periods: [
            /* ... */
        ],
    },
    [DIFFICULTY_LEVELS.CE1]: {
        // Progression CE1
        id: "ce1",
        name: "CE1 (7-8 ans)",
        periods: [
            /* ... */
        ],
    },
    [DIFFICULTY_LEVELS.CE2]: {
        // Progression CE2
        id: "ce2",
        name: "CE2 (8-9 ans)",
        periods: [
            /* ... */
        ],
    },
};
```

### 3. Gestion d'état globale avec Context API

L'application utilise deux contextes principaux :

#### AuthContext (`src/contexts/AuthContext.js` et `src/contexts/AuthProvider.jsx`)

-   Gère l'authentification des utilisateurs
-   Stocke les informations de l'utilisateur actuel dans le localStorage
-   Fournit les fonctions `login`, `loginAsGuest`, `logout` et `updateProfile`

#### ProgressContext (`src/contexts/ProgressContext.js` et `src/contexts/ProgressProvider.jsx`)

-   Gère la progression d'apprentissage
-   Intègre l'algorithme de répétition espacée
-   Fournit les fonctions pour changer de niveau, de période et d'unité
-   Expose les statistiques de progression

### 4. Composants d'exercices

Les composants d'exercices sont situés dans `src/components/exercises/` et gèrent l'affichage et l'interaction lors des sessions d'apprentissage.

#### Principaux composants :

-   `ExerciseCard.jsx` : Carte principale pour afficher un exercice
-   `NumberInput.jsx` : Composant de saisie numérique adapté aux enfants
-   `ResultFeedback.jsx` : Feedback visuel après une réponse
-   `FactCard.jsx` : Affichage d'un fait numérique dans la vue de progression

### 5. Fonctionnalités PWA

Les fonctionnalités PWA sont implémentées principalement via le service worker et les services PWA.

#### Fichiers principaux :

-   `public/service-worker.js` : Service worker pour le mode hors ligne
-   `public/manifest.json` : Manifest pour l'installation de l'application
-   `src/services/pwaService.js` : Fonctions utilitaires pour la gestion PWA

## Fonctionnalités principales

### 1. Apprentissage avec répétition espacée

La fonctionnalité principale de l'application est l'apprentissage des faits numériques à l'aide de l'algorithme de répétition espacée. Les faits sont présentés à des intervalles optimaux en fonction des performances de l'élève.

#### Processus :

1. L'élève sélectionne un niveau (CP, CE1, CE2) sur la page d'accueil
2. L'algorithme détermine quels faits doivent être révisés aujourd'hui
3. L'élève effectue une session d'exercices sur ces faits
4. Les réponses sont enregistrées et l'algorithme ajuste les intervalles de répétition

### 2. Progression didactique adaptée

L'application propose une progression didactique structurée par niveau scolaire, avec une difficulté croissante.

#### Structure :

-   **CP** : Découverte des nombres, additions et soustractions simples
-   **CE1** : Additions avec retenue, soustractions, compléments à 100
-   **CE2** : Tables de multiplication, divisions, calcul mental avancé

### 3. Suivi de progression

L'application permet à l'élève de suivre sa progression et de visualiser son avancement.

#### Métriques disponibles :

-   Nombre de faits maîtrisés par niveau
-   Statistiques par type d'opération
-   Historique des sessions
-   Prochaines révisions prévues

### 4. Mode hors ligne (PWA)

L'application fonctionne hors ligne grâce aux technologies PWA et peut être installée sur l'écran d'accueil.

#### Fonctionnalités :

-   Mise en cache des ressources essentielles
-   Stockage local des données de progression
-   Installation sur l'écran d'accueil
-   Synchronisation lors de la reconnexion (à implémenter)

## Composants UI communs

### 1. Boutons et contrôles

Le composant `Button` (`src/components/common/Button.jsx`) fournit un bouton réutilisable avec plusieurs variantes :

-   `primary` : Bouton principal (bleu)
-   `secondary` : Bouton secondaire (gris)
-   `success` : Bouton de succès (vert)
-   `danger` : Bouton d'alerte (rouge)
-   `warning` : Bouton d'avertissement (jaune)

### 2. Cards et conteneurs

Le composant `Card` (`src/components/common/Card.jsx`) fournit un conteneur pour présenter du contenu, avec options pour l'élévation et les titres.

### 3. Feedback visuel

Les composants `ProgressBar` et `Icon` fournissent un feedback visuel pour l'interface utilisateur.

### 4. Mise en page

Le composant `Layout` (`src/components/layout/Layout.jsx`) fournit une structure cohérente pour toutes les pages, avec en-tête et pied de page.

## Workflow de développement

### Installation et démarrage

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualisation du build de production
npm run preview
```

### Structure des nouveaux composants

Les nouveaux composants devraient suivre cette structure :

```jsx
/**
 * @file ComponentName.jsx
 * @description Description du composant
 */

import React from "react";
import PropTypes from "prop-types";

/**
 * Description détaillée du composant
 * @param {Object} props - Propriétés du composant
 * @param {string} props.propName - Description de la propriété
 * @returns {JSX.Element} Composant ComponentName
 */
const ComponentName = ({ propName, ...rest }) => {
    // Code du composant
    return <div {...rest}>{propName}</div>;
};

ComponentName.propTypes = {
    propName: PropTypes.string,
};

export default ComponentName;
```

### Conventions de nommage

-   **Fichiers de composants** : PascalCase avec extension `.jsx` (ex: `Button.jsx`)
-   **Hooks personnalisés** : camelCase avec préfixe `use` (ex: `useSpacedRepetition.js`)
-   **Contextes** : PascalCase avec suffixe `Context` (ex: `AuthContext.js`)
-   **Providers** : PascalCase avec suffixe `Provider` (ex: `AuthProvider.jsx`)
-   **Services et utilitaires** : camelCase avec suffixe descriptif (ex: `pwaService.js`)

## Défis et limitations actuelles

### Défis techniques

1. **Gestion de l'état offline** : L'application stocke actuellement les données dans le localStorage, ce qui pourrait être insuffisant pour de grandes quantités de données. Une migration vers IndexedDB pourrait être nécessaire.

2. **Synchronisation des données** : Il n'y a pas encore de mécanisme de synchronisation des données entre différents appareils d'un même utilisateur.

3. **Tests unitaires et d'intégration** : Le projet nécessite une couverture de tests plus complète.

### Améliorations potentielles

1. **Backend et synchronisation cloud** : Ajout d'un backend pour la synchronisation des données et la gestion des comptes utilisateurs.

2. **Mode enseignant** : Développement d'une interface dédiée aux enseignants pour suivre la progression de plusieurs élèves.

3. **Gamification** : Ajout d'éléments de gamification (badges, niveaux, récompenses) pour motiver davantage les élèves.

4. **Accessibilité** : Amélioration de l'accessibilité selon les normes WCAG.

5. **Internationalisation** : Support pour plusieurs langues.

## Ressources et références

### Documentation technique

-   [React Documentation](https://reactjs.org/docs/getting-started.html)
-   [Tailwind CSS Documentation](https://tailwindcss.com/docs)
-   [Vite Documentation](https://vitejs.dev/guide/)
-   [PWA Documentation (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

### Références pédagogiques

-   Programmes scolaires de mathématiques du cycle 2 (Éducation nationale)
-   Études sur l'efficacité de la répétition espacée dans l'apprentissage

## Conclusion

MathMemo est une application éducative complète conçue pour aider les élèves du cycle 2 à mémoriser les faits numériques essentiels. Son architecture modulaire basée sur React et son algorithme de répétition espacée en font un outil puissant et adaptatif pour l'apprentissage des mathématiques.

Cette documentation devrait fournir toutes les informations nécessaires pour permettre à une nouvelle équipe de développeurs de comprendre l'architecture et de poursuivre le développement de l'application.
