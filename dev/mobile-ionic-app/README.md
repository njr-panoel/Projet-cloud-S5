# RoadIssuesMobile (Ionic + Vue 3 + Capacitor)

Application mobile hybride pour signaler les problèmes routiers à Antananarivo.

Important: AUCUNE communication avec l'API Spring Boot — tout passe par Firebase.

## Technologies
- Ionic 7 + Vue 3 (Composition API)
- Capacitor 5 (Camera, Geolocation, Network, Preferences)
- Firebase (Auth, Firestore, Storage)
- Leaflet (intégration manuelle via l'API Leaflet)
- Pinia

## Structure

See `src/` for main files: `main.ts`, `App.vue`, `router`, `stores/signalement.ts`, `views`, `components`, `services`.

## Installation

1. Installer Ionic & Capacitor (globally si souhaité):

```bash
npm install -g @ionic/cli
npm install -g @capacitor/cli
```

2. Initialiser le projet (si vous le copiez):

```bash
cd dev/mobile-ionic-app
npm install
```

3. Ajouter Android (optionnel):

```bash
npx cap add android
```

4. Construire et déployer:

```bash
npm run build
npx cap sync
npx cap open android
```

## Firebase configuration

- Créez un projet Firebase, activez Authentication (Email/Password), Firestore et Storage.
- Créez une Web App et copiez la configuration dans `src/environments/firebaseConfig.ts`.

> Astuce: Leaflet utilise des icônes via des images statiques; si les marqueurs n'apparaissent pas, suivez les solutions décrites dans la doc Leaflet + Vite (copier `node_modules/leaflet/dist/images` vers `public/assets` ou configurer les imports).

## Fonctionnalités principales

- Authentification Email/Password (Firebase Auth)
- Carte (Leaflet) centrée sur Antananarivo, ajout de signalement par long-press ou bouton
- Stockage en ligne dans Firestore (collection `signalements`)
- Upload de photo dans Firebase Storage
- Mode offline: signalements stockés localement via Capacitor `Preferences` et synchronisés automatiquement quand la connexion revient
- Détection réseau via `@capacitor/network` et synchronisation automatique

## Commandes utiles

- Développement: `npm run dev`
- Build: `npm run build`
- Sync Capacitor: `npm run capacitor:sync` (alias `npx cap sync`)
- Ouvrir Android Studio: `npm run android` (alias `npx cap open android`)

## Installer les plugins Capacitor (exemples)

```bash
npm install @capacitor/camera @capacitor/geolocation @capacitor/network @capacitor/preferences
npx cap sync
```

## Build APK rapide

```bash
npm run build
npx cap sync android
npx cap open android
# Puis construire depuis Android Studio (Build > Build Bundle/APK > Build APK)
```

## Remarques

- La stratégie de résolution des conflits est simple: last-write-wins via timestamp (serverTimestamp) et queue locale.
- Le projet utilise `Preferences` pour le stockage hors-ligne des signalements non envoyés.

---

Bonne mise en place !