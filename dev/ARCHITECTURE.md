# 🏗️ Architecture Backend - Suivi Travaux Routiers

## 📦 Structure des Packages

```
com.cloud.dev
├── config/
│   ├── SecurityConfig.java          # Configuration Spring Security + JWT
│   ├── SwaggerConfig.java           # Configuration OpenAPI/Swagger
│   └── FirebaseConfig.java          # Initialisation Firebase
│
├── controller/
│   ├── AuthController.java          # Endpoints authentification
│   ├── UserController.java          # Gestion utilisateurs
│   ├── SignalementController.java   # CRUD signalements
│   └── SyncController.java          # Synchronisation Firebase
│
├── service/
│   ├── AuthService.java             # Logique authentification hybride
│   ├── UserService.java             # Gestion utilisateurs
│   ├── SignalementService.java      # Logique métier signalements
│   └── SyncService.java             # Synchronisation bidirectionnelle
│
├── repository/
│   ├── UserRepository.java          # Accès données utilisateurs
│   ├── SignalementRepository.java   # Accès données signalements
│   ├── SessionRepository.java       # Gestion sessions JWT
│   └── SyncLogRepository.java       # Logs de synchronisation
│
├── entity/
│   ├── User.java                    # Entité utilisateur
│   ├── Signalement.java             # Entité signalement
│   ├── Session.java                 # Entité session
│   └── SyncLog.java                 # Log de sync
│
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   └── SignalementRequest.java
│   └── response/
│       ├── AuthResponse.java
│       ├── UserResponse.java
│       ├── SignalementResponse.java
│       └── ApiResponse.java
│
├── security/
│   ├── JwtAuthenticationFilter.java # Filtre JWT
│   └── CustomUserDetailsService.java # Chargement utilisateur
│
├── exception/
│   ├── GlobalExceptionHandler.java  # Gestionnaire global d'erreurs
│   ├── ResourceNotFoundException.java
│   ├── AccountLockedException.java
│   ├── InvalidCredentialsException.java
│   └── UserAlreadyExistsException.java
│
├── util/
│   └── JwtUtil.java                 # Utilitaires JWT
│
└── enums/
    ├── Role.java                    # VISITEUR, MANAGER, UTILISATEUR_MOBILE
    ├── StatutSignalement.java       # NOUVEAU, EN_COURS, TERMINE, ANNULE
    ├── TypeTravaux.java             # Types de problèmes routiers
    └── AuthProvider.java            # LOCAL, FIREBASE
```

## 🔐 Flux d'Authentification

### Authentification Locale (Offline)
```
Client -> POST /api/auth/login { useFirebase: false }
  ↓
AuthService vérifie credentials PostgreSQL
  ↓
Si OK: Génère JWT + Crée Session
  ↓
Retourne { token, user, expiresIn }
```

### Authentification Firebase (Online)
```
Client -> POST /api/auth/login { useFirebase: true, password: <FIREBASE_TOKEN> }
  ↓
AuthService vérifie token Firebase
  ↓
Si OK: Génère JWT local + Crée Session
  ↓
Retourne { token, user, expiresIn }
```

### Gestion des Tentatives Échouées
```
Tentative échouée
  ↓
loginAttempts++
  ↓
Si loginAttempts >= maxLoginAttempts
  ↓
accountLocked = true
lockedUntil = now + lockDuration
  ↓
AccountLockedException
```

## 🗄️ Modèle de Données

### User
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    password VARCHAR(255),              -- Hashé BCrypt (auth locale)
    firebase_uid VARCHAR(255) UNIQUE,   -- UID Firebase
    role VARCHAR(50) NOT NULL,
    auth_provider VARCHAR(20) NOT NULL,
    active BOOLEAN DEFAULT true,
    account_locked BOOLEAN DEFAULT false,
    locked_until TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_firebase_uid ON users(firebase_uid);
```

### Signalement
```sql
CREATE TABLE signalements (
    id BIGSERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    type_travaux VARCHAR(50) NOT NULL,
    statut VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    adresse VARCHAR(500),
    photos TEXT,                        -- URLs séparées par virgules
    user_id BIGINT REFERENCES users(id),
    synced BOOLEAN DEFAULT false,
    firebase_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_statut ON signalements(statut);
CREATE INDEX idx_user ON signalements(user_id);
CREATE INDEX idx_created ON signalements(created_at);
```

## 📡 Endpoints REST

### Authentification
| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| POST | /api/auth/register | ❌ | - | Inscription |
| POST | /api/auth/login | ❌ | - | Connexion |
| POST | /api/auth/logout | ✅ | Tous | Déconnexion |
| GET | /api/auth/me | ✅ | Tous | Info utilisateur |

### Utilisateurs
| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| GET | /api/users | ✅ | MANAGER | Liste tous |
| GET | /api/users/{id} | ✅ | Tous | Détails |
| GET | /api/users/role/{role} | ✅ | MANAGER | Par rôle |
| GET | /api/users/locked | ✅ | MANAGER | Comptes bloqués |
| POST | /api/users/unlock/{id} | ✅ | MANAGER | **Débloquer** |
| PUT | /api/users/{id}/role | ✅ | MANAGER | Changer rôle |
| DELETE | /api/users/{id} | ✅ | MANAGER | Supprimer |

### Signalements
| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| POST | /api/signalements | ✅ | Tous | Créer |
| GET | /api/signalements | ❌ | - | Liste (public) |
| GET | /api/signalements/{id} | ❌ | - | Détails (public) |
| GET | /api/signalements/statut/{statut} | ❌ | - | Par statut |
| GET | /api/signalements/type/{type} | ❌ | - | Par type |
| GET | /api/signalements/unsynced | ✅ | MANAGER/MOBILE | Non sync |
| PUT | /api/signalements/{id} | ✅ | MANAGER/MOBILE | Modifier |
| PATCH | /api/signalements/{id}/statut | ✅ | MANAGER | Changer statut |
| DELETE | /api/signalements/{id} | ✅ | MANAGER | Supprimer |

### Synchronisation
| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| POST | /api/sync/to-firebase | ✅ | MANAGER/MOBILE | → Firebase |
| POST | /api/sync/from-firebase | ✅ | MANAGER/MOBILE | ← Firebase |
| GET | /api/sync/stats | ✅ | MANAGER | Statistiques |

## 🔒 Sécurité

### Spring Security Configuration
```java
- Public: /api/auth/**, /swagger-ui/**, /api-docs/**
- Public GET: /api/signalements/**
- MANAGER only: /api/users/unlock/**
- Authenticated: Tout le reste
```

### JWT Token
- **Algorithme**: HS512
- **Durée de vie**: 24h (configurable)
- **Header**: `Authorization: Bearer <token>`
- **Claims**: email (subject)

### Password Encoding
- **Algorithme**: BCrypt
- **Strength**: Default (10 rounds)

## 🔄 Synchronisation Firebase/PostgreSQL

### Flux de synchronisation

#### Vers Firebase
```
1. Récupérer signalements non sync (synced = false)
2. Pour chaque signalement:
   - Convertir en Map<String, Object>
   - Envoyer à Firebase Realtime DB
   - Mettre à jour firebaseId
   - Marquer synced = true
   - Logger dans SyncLog
```

#### Depuis Firebase
```
1. Écouter changements Firebase
2. Pour chaque nouveau signalement:
   - Vérifier s'il existe (par firebaseId)
   - Si non: créer en local
   - Si oui: mettre à jour
   - Logger dans SyncLog
```

## 🧪 Tests

### Exemples de requêtes (curl)

#### Inscription
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@test.com",
    "password": "password123",
    "nom": "Rakoto",
    "prenom": "Jean",
    "role": "MANAGER"
  }'
```

#### Connexion
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@test.com",
    "password": "password123"
  }'
```

#### Créer un signalement
```bash
curl -X POST http://localhost:8080/api/signalements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "titre": "Nid de poule avenue de l'Indépendance",
    "description": "Important nid de poule dangereux",
    "typeTravaux": "NIDS_DE_POULE",
    "latitude": -18.8792,
    "longitude": 47.5079,
    "adresse": "Avenue de l'Indépendance, Antananarivo"
  }'
```

#### Débloquer un utilisateur
```bash
curl -X POST http://localhost:8080/api/users/unlock/1 \
  -H "Authorization: Bearer <MANAGER_TOKEN>"
```

## 📊 Configuration

### Variables clés

```properties
# Sécurité
app.security.max-login-attempts=3           # Tentatives avant blocage
app.security.account-lock-duration=3600000  # Durée blocage (ms) = 1h
app.security.jwt.expiration=86400000        # Durée token (ms) = 24h

# Firebase
app.firebase.enabled=true                   # Activer Firebase
app.firebase.credentials-path=classpath:firebase-service-account.json
```

## 🚀 Déploiement

### Docker
```bash
# Build
docker build -t travaux-routiers-api .

# Run
docker-compose up -d

# Logs
docker-compose logs -f app
```

### Production
1. Changer `app.security.jwt.secret`
2. Configurer Firebase credentials
3. `spring.jpa.hibernate.ddl-auto=validate`
4. Activer HTTPS
5. Configurer logging vers fichier

---

**Architecture conçue pour scalabilité, sécurité et mode offline-first** 🚀
