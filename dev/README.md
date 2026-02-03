# API Suivi Travaux Routiers - Antananarivo

## 📋 Description
API REST pour la gestion des signalements de travaux routiers avec authentification hybride Firebase/PostgreSQL.

## 🏗️ Architecture

### Technologies
- **Backend**: Spring Boot 4.0.1
- **Base de données**: PostgreSQL 15
- **Sécurité**: Spring Security + JWT
- **Authentification**: Firebase Auth (online) / PostgreSQL (offline)
- **Documentation**: Swagger/OpenAPI
- **Containerisation**: Docker

### Modules
```
com.cloud.dev
├── config/          # Security, Swagger, Firebase
├── controller/      # REST API Endpoints
├── service/         # Business Logic
├── repository/      # JPA Data Access
├── entity/          # Domain Models
├── dto/             # Request/Response Objects
├── security/        # JWT & Auth Filters
├── exception/       # Error Handling
├── util/            # Utilities
└── enums/           # Enumerations
```

## 🚀 Démarrage Rapide

### Prérequis
- Java 17+
- Maven 3.9+
- Docker & Docker Compose (optionnel)
- PostgreSQL 15+ (si sans Docker)

### Option 1 : Docker Compose (Recommandé)

```bash
# Lancer l'ensemble de la stack
docker-compose up -d

# Vérifier les logs
docker-compose logs -f app

# Arrêter
docker-compose down
```

L'API sera accessible sur `http://localhost:8080`

### Option 2 : Exécution locale

```bash
# 1. Démarrer PostgreSQL (ou via Docker)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15

# 2. Compiler et lancer
mvn clean install
mvn spring-boot:run
```

## 📚 Documentation API

Une fois l'application démarrée, accédez à :
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

## 🔐 Authentification

### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "nom": "Doe",
  "prenom": "John",
  "role": "VISITEUR"
}
```

### Connexion (Local)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "useFirebase": false
}
```

### Connexion (Firebase)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "<FIREBASE_ID_TOKEN>",
  "useFirebase": true
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "VISITEUR"
    },
    "expiresIn": 86400
  }
}
```

### Utilisation du token
Ajouter le header dans toutes les requêtes authentifiées :
```
Authorization: Bearer <votre_token_jwt>
```

## 📡 Endpoints Principaux

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur actuel

### Utilisateurs (Manager uniquement)
- `GET /api/users` - Liste tous les utilisateurs
- `GET /api/users/{id}` - Détails d'un utilisateur
- `POST /api/users/unlock/{id}` - ⭐ Débloquer un compte
- `PUT /api/users/{id}/role` - Changer le rôle
- `DELETE /api/users/{id}` - Supprimer un utilisateur

### Signalements
- `POST /api/signalements` - Créer un signalement (Auth requise)
- `GET /api/signalements` - Liste tous (Public)
- `GET /api/signalements/{id}` - Détails (Public)
- `GET /api/signalements/statut/{statut}` - Par statut
- `GET /api/signalements/type/{type}` - Par type
- `PUT /api/signalements/{id}` - Modifier (Auth)
- `PATCH /api/signalements/{id}/statut` - Changer statut (Manager)
- `DELETE /api/signalements/{id}` - Supprimer (Manager)

### Synchronisation
- `POST /api/sync/to-firebase` - Sync vers Firebase
- `POST /api/sync/from-firebase` - Sync depuis Firebase
- `GET /api/sync/stats` - Statistiques

## 🔒 Sécurité

### Limite de tentatives de connexion
- **Maximum**: 3 tentatives (configurable via `app.security.max-login-attempts`)
- **Blocage**: Automatique après échec
- **Durée**: 1 heure (configurable via `app.security.account-lock-duration`)
- **Déblocage**: Automatique ou via endpoint `/api/users/unlock/{id}` (Manager)

### Rôles
| Rôle | Description | Permissions |
|------|-------------|-------------|
| `VISITEUR` | Consultation uniquement | Lecture signalements |
| `UTILISATEUR_MOBILE` | Utilisateur terrain | Création/modification signalements |
| `MANAGER` | Administrateur | Toutes permissions + déblocage comptes |

## ⚙️ Configuration

### application.properties

```properties
# Base de données
spring.datasource.url=jdbc:postgresql://localhost:5432/travaux_routiers
spring.datasource.username=postgres
spring.datasource.password=postgres

# Sécurité JWT
app.security.jwt.secret=CHANGE_ME_IN_PRODUCTION
app.security.jwt.expiration=86400000
app.security.max-login-attempts=3
app.security.account-lock-duration=3600000

# Firebase (optionnel)
app.firebase.enabled=false
app.firebase.credentials-path=classpath:firebase-service-account.json
```

### Variables d'environnement Docker

```yaml
environment:
  SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/travaux_routiers
  APP_SECURITY_JWT_SECRET: your-secret-key
  APP_FIREBASE_ENABLED: "true"
```

## 🗄️ Modèle de données

### Entités principales

#### User
- Authentification hybride (Firebase/Local)
- Gestion des tentatives de connexion
- Verrouillage automatique

#### Signalement
- Géolocalisation (lat/lng)
- Photos multiples
- Statuts: NOUVEAU, EN_COURS, TERMINE, ANNULE
- Types: NIDS_DE_POULE, FISSURE, AFFAISSEMENT, etc.

#### Session
- Tokens JWT
- Durée de vie configurable
- Tracking device/IP

## 🔄 Synchronisation Firebase

### Configuration Firebase
1. Télécharger `firebase-service-account.json` depuis Firebase Console
2. Placer dans `src/main/resources/`
3. Configurer dans `application.properties`

### Flux de synchronisation
1. **Mode online** : Firebase Auth + sync automatique
2. **Mode offline** : PostgreSQL local uniquement
3. **Reconnexion** : Sync bidirectionnelle automatique

## 🧪 Tests

```bash
# Lancer les tests
mvn test

# Avec couverture
mvn test jacoco:report
```

## 📦 Build & Déploiement

### Build local
```bash
mvn clean package
java -jar target/dev-0.0.1-SNAPSHOT.jar
```

### Build Docker
```bash
docker build -t travaux-routiers-api .
docker run -p 8080:8080 travaux-routiers-api
```

### Production
```bash
# Avec profil production
java -jar app.jar --spring.profiles.active=prod

# Ou via Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 🌍 Environnements

| Environnement | URL | Base de données |
|---------------|-----|-----------------|
| Développement | http://localhost:8080 | PostgreSQL local |
| Staging | https://staging.api.travaux.mg | PostgreSQL Azure |
| Production | https://api.travaux.mg | PostgreSQL Azure |

## 📝 Logs

Les logs sont disponibles :
- Console : pendant le développement
- Fichier : `/var/log/travaux-routiers/app.log` (production)
- Docker : `docker-compose logs -f app`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit (`git commit -m 'Ajout de ma feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Pull Request

## 📄 Licence

MIT License - voir LICENSE.md

## 👥 Équipe

- **Backend Lead** : [Votre Nom]
- **DevOps** : [Nom]
- **Contact** : dev@travaux-routiers.mg

---

**Made with ❤️ for Antananarivo**
