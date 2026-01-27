# Guide de Configuration Firebase

## 📋 Prérequis
- Compte Firebase (gratuit)
- Projet Firebase créé

## 🔧 Étapes de Configuration

### 1. Créer un projet Firebase
1. Aller sur https://console.firebase.google.com/
2. Cliquer sur "Ajouter un projet"
3. Nommer : `travaux-routiers-antananarivo`
4. Activer/désactiver Google Analytics (optionnel)

### 2. Activer l'authentification
1. Dans le menu : **Authentication**
2. Onglet **Sign-in method**
3. Activer :
   - ✅ Email/Password
   - ✅ Google (optionnel)
4. Enregistrer

### 3. Activer Realtime Database
1. Dans le menu : **Realtime Database**
2. Cliquer sur **Créer une base de données**
3. Choisir localisation : `europe-west1`
4. Mode : **Démarrer en mode test** (pour le développement)

### 4. Configurer les règles de sécurité
Dans l'onglet **Règles** de Realtime Database :

```json
{
  "rules": {
    "signalements": {
      ".read": true,
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

### 5. Générer la clé de service
1. Paramètres du projet (⚙️) → **Comptes de service**
2. Cliquer sur **Générer une nouvelle clé privée**
3. Télécharger le fichier JSON
4. Renommer en `firebase-service-account.json`
5. Placer dans `src/main/resources/`

⚠️ **IMPORTANT** : Ne jamais commiter ce fichier !

### 6. Configuration application.properties

```properties
# Firebase
app.firebase.enabled=true
app.firebase.credentials-path=classpath:firebase-service-account.json
app.firebase.database-url=https://travaux-routiers-antananarivo-default-rtdb.europe-west1.firebasedatabase.app
```

Remplacer `travaux-routiers-antananarivo` par votre nom de projet.

## 🧪 Test de la configuration

### Vérifier l'initialisation
Au démarrage de l'application, vous devriez voir :
```
Firebase initialisé avec succès
```

### Tester l'authentification Firebase (depuis le frontend)
```javascript
// Connexion utilisateur
firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Obtenir le token ID
    return userCredential.user.getIdToken();
  })
  .then((idToken) => {
    // Utiliser ce token pour l'API
    fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: idToken,  // Le token Firebase
        useFirebase: true
      })
    });
  });
```

## 📱 Configuration Mobile (Ionic)

### Installation
```bash
npm install firebase @angular/fire
```

### Configuration
```typescript
// src/app/app.module.ts
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "travaux-routiers-antananarivo.firebaseapp.com",
  databaseURL: "https://travaux-routiers-antananarivo-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "travaux-routiers-antananarivo",
  storageBucket: "travaux-routiers-antananarivo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

@NgModule({
  imports: [
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule
  ]
})
```

## 🔒 Sécurité - Production

### Règles strictes
```json
{
  "rules": {
    "signalements": {
      ".read": true,
      ".write": "auth != null",
      "$signalementId": {
        ".validate": "newData.hasChildren(['titre', 'latitude', 'longitude', 'typeTravaux'])"
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid == $uid || root.child('users').child(auth.uid).child('role').val() == 'MANAGER')",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

## 🌍 Variables d'environnement

### Développement
```properties
app.firebase.enabled=true
```

### Production (Docker)
```yaml
environment:
  APP_FIREBASE_ENABLED: "true"
  FIREBASE_DB_URL: "https://votre-projet.firebaseio.com"
```

### Désactiver Firebase (mode offline uniquement)
```properties
app.firebase.enabled=false
```

## 📊 Monitoring

### Firebase Console
- **Authentication** : Nombre d'utilisateurs
- **Realtime Database** : Requêtes, stockage
- **Performance** : Temps de réponse

### Logs Application
```
2024-01-21 10:00:00 INFO  FirebaseConfig - Firebase initialisé avec succès
2024-01-21 10:05:23 INFO  SyncService - Signalement 123 synchronisé vers Firebase avec l'ID abc123
```

## ❓ Troubleshooting

### Erreur "Firebase not initialized"
- Vérifier que `firebase-service-account.json` existe
- Vérifier les permissions du fichier
- Vérifier que `app.firebase.enabled=true`

### Erreur "Invalid token"
- Token Firebase expiré (durée : 1h)
- Demander un nouveau token au frontend

### Erreur de connexion database
- Vérifier l'URL de la database
- Vérifier les règles de sécurité

---

**Pour plus d'infos** : https://firebase.google.com/docs
