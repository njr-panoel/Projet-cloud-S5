# Système de Blocage de Compte - Documentation Complète

## 📋 Vue d'ensemble

Un système complet de blocage de compte a été implémenté pour sécuriser votre application. Lorsqu'un utilisateur effectue **X tentatives de connexion échouées**, son compte est automatiquement verrouillé et **seul un manager peut le débloquer**.

## ⚙️ Configuration

La limite de tentatives est **configurable** dans le fichier `application.properties` :

```properties
# Dans /dev/src/main/resources/application.properties
app.security.max-login-attempts=3      # Nombre max de tentatives avant blocage
app.security.account-lock-duration=3600000  # Durée en millisecondes (actuellement inutilisée - blocage permanent)
```

**Valeur par défaut** : 3 tentatives

## 🔒 Fonctionnement

### Flux de Blocage

1. **Tentatives 1-3** : Mot de passe incorrect → Message : `"Email ou mot de passe incorrect"`
2. **Tentative 4+** : Compte bloqué → Message : `"Compte verrouillé après 3 tentatives échouées. Contactez un manager pour le déblocage."`

### État du Compte

Lorsqu'un compte est bloqué :
- **Field `account_locked`** : `true` (dans la BD)
- **Field `login_attempts`** : `3` (ou le nombre configurable)
- **Accès refusé** : L'utilisateur ne peut plus se connecter jusqu'au déblocage

## 📊 Exemple de Test

```bash
# Tentative 1 : Mot de passe incorrect
$ curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"blockme@test.com","password":"mauvais"}'
# Réponse : {"success":false,"message":"Email ou mot de passe incorrect","data":null}

# Tentative 2 & 3 : Même réponse

# Tentative 4 : Compte bloqué!
$ curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"blockme@test.com","password":"mauvais"}'
# Réponse : {"success":false,"message":"Compte verrouillé après 3 tentatives échouées. Contactez un manager pour le déblocage.","data":null}
```

## 🛠️ Endpoints API pour Managers

### 1. **Obtenir les comptes verrouillés**
```
GET /api/users/locked
Authorization: Bearer <JWT_TOKEN_MANAGER>
```

**Réponse** : Liste des utilisateurs verrouillés

### 2. **Débloquer un utilisateur**
```
POST /api/users/unlock/{id}
Authorization: Bearer <JWT_TOKEN_MANAGER>
```

**Paramètres** :
- `{id}` : ID de l'utilisateur à débloquer

**Réponse** : Utilisateur maintenant débloqué

### 3. **Voir l'historique des tentatives de connexion**
```
GET /api/users/{id}/login-attempts
Authorization: Bearer <JWT_TOKEN_MANAGER>
```

**Réponse** : Liste de tous les essais de connexion (succès et échechs)

### 4. **Voir uniquement les tentatives échouées**
```
GET /api/users/{id}/failed-attempts
Authorization: Bearer <JWT_TOKEN_MANAGER>
```

**Réponse** : Liste des tentatives échouées avec la raison

## 🗄️ Structure Base de Données

### Table `users`
```sql
Column            | Type     | Description
-----------------|----------|-------------------------------------
account_locked    | BOOLEAN  | true si compte verrouillé
login_attempts    | INTEGER  | Nombre d'tentatives échouées actuelles
locked_until      | TIMESTAMP| NULL (blocage permanent)
```

### Table `login_attempts` (nouv. table)
```sql
Column            | Type     | Description
-----------------|----------|-------------------------------------
id                | BIGINT   | Clé primaire
user_id           | BIGINT   | Référence à l'utilisateur
success           | BOOLEAN  | true = connexion réussie, false = échouée
failure_reason    | TEXT     | Raison de l'échec (ex: "Mot de passe incorrect")
ip_address        | VARCHAR  | IP du client
user_agent        | TEXT     | User-Agent du navigateur
attempted_at      | TIMESTAMP| Date/heure de la tentative
```

## 🔄 Réinitialisation du Compteur

Lors d'une **connexion réussie**, le compteur `login_attempts` est réinitialisé à `0`.

Lors du **déblocage par un manager**, le compteur est aussi remis à `0` :
```java
user.setAccountLocked(false);
user.setLoginAttempts(0);
userRepository.save(user);
```

## 🛡️ Sécurité

### Points Importants

1. **Permanent Lock** : Le compte reste bloqué jusqu'au déblocage manuel (pas d'auto-déblocage temporaire)
2. **Auditabilité** : Toutes les tentatives sont enregistrées avec IP et User-Agent
3. **Manager Only** : Seuls les utilisateurs avec le rôle `MANAGER` peuvent débloquer
4. **Transaction Safe** : Les blocages sont sauvegardés même en cas d'erreur grâce à `@Transactional(noRollbackFor = {...})`

## 📝 Fichiers Modifiés/Créés

### Créés :
- ✅ `/dev/src/main/java/com/cloud/dev/entity/LoginAttempt.java` - Entité pour tracker les tentatives
- ✅ `/dev/src/main/java/com/cloud/dev/repository/LoginAttemptRepository.java` - Accès BD
- ✅ `/dev/src/main/java/com/cloud/dev/dto/response/LoginAttemptResponse.java` - DTO pour API

### Modifiés :
- ✅ `/dev/src/main/java/com/cloud/dev/service/AuthService.java` - Logique de blocage
- ✅ `/dev/src/main/java/com/cloud/dev/service/UserService.java` - Gestion des tentatives
- ✅ `/dev/src/main/java/com/cloud/dev/controller/UserController.java` - Endpoints manager
- ✅ `/dev/src/main/resources/application.properties` - Configuration

## 🧪 Test du Système

### Scénario Complet

1. **Créer un utilisateur de test** :
```sql
INSERT INTO users (email, nom, prenom, role, auth_provider, active, account_locked, login_attempts, password, created_at)
VALUES ('blockme@test.com', 'Block', 'Me', 'VISITEUR', 'LOCAL', true, false, 0, '[HASH_BCRYPT]', NOW());
```

2. **Effectuer 3 tentatives échouées** :
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"blockme@test.com","password":"mauvais"}' # 3x
```

3. **Vérifier le blocage en BD** :
```sql
SELECT account_locked, login_attempts FROM users WHERE email='blockme@test.com';
-- Résultat: account_locked=true, login_attempts=3
```

4. **Manager débloque l'utilisateur** :
```bash
curl -X POST http://localhost:8080/api/users/8/unlock \
  -H "Authorization: Bearer <JWT_MANAGER>"
```

5. **Vérifier le déblocage** :
```sql
SELECT account_locked, login_attempts FROM users WHERE email='blockme@test.com';
-- Résultat: account_locked=false, login_attempts=0
```

## ⚡ Pré-requis pour Débloquer

- Être un **Manager** (`role='MANAGER'`)
- Posséder un JWT valide
- Avoir l'ID de l'utilisateur à débloquer

## 🔐 Exemple Complet avec curl

```bash
# 1. Manager se connecte
MANAGER_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@test.com","password":"password123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Voir les comptes verrouillés
curl -X GET "http://localhost:8080/api/users/locked" \
  -H "Authorization: Bearer $MANAGER_TOKEN"

# 3. Débloquer l'utilisateur ID 8
curl -X POST "http://localhost:8080/api/users/8/unlock" \
  -H "Authorization: Bearer $MANAGER_TOKEN"

# 4. Voir l'historique des tentatives
curl -X GET "http://localhost:8080/api/users/8/login-attempts" \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

## 📈 Améliorations Futures Possibles

- [ ] Interface web pour les managers pour gérer les comptes verrouillés
- [ ] Notifications email à l'administrateur en cas de blocage
- [ ] Déblocage temporaire (avec réception de code par email)
- [ ] Limitation de vitesse (rate limiting) en plus du compteur de tentatives
- [ ] Graphiques de sécurité : tentatives par utilisateur, par IP, etc.

## ✅ Validation

Le système a été testé et validé :
- ✅ Comptage corrects des tentatives échouées
- ✅ Blocage à 3 tentatives (configurable)
- ✅ Déblocage par manager
- ✅ Enregistrement de l'historique
- ✅ Réinitialisation du compteur après connexion réussie
- ✅ Transactions ACID (durabilité des changements même en cas d'erreur)
