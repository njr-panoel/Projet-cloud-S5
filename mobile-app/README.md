# Mobile - Cloud S5 (Ionic 7 + Vue 3 + Firebase)

Application mobile de signalement de problèmes routiers à Antananarivo (offline-first, Firebase-only, aucune API REST).

## Installation
```bash
ionic start road-report tabs --type=vue
npm install firebase leaflet vue-leaflet pinia
npm install @capacitor/geolocation @capacitor/camera @capacitor/network @capacitor/preferences
ionic cap add android
```

## Développement
```bash
ionic serve
```

## Build & Android
```bash
ionic build --prod
ionic cap sync
ionic cap open android
```

## Configuration
Définir les variables Firebase dans `.env` :
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
