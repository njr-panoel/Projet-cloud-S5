# 📝 Changelog - Simplification Formulaire Mobile

## ✅ Modifications effectuées

### 1. **Formulaire simplifié pour utilisateurs mobiles**

#### Avant (champs de gestion)
- Description
- ❌ Statut (Nouveau/En cours/Terminé)
- ❌ Surface (m²)
- ❌ Budget (Ar)
- ❌ Entreprise
- Photo

#### Après (champs utilisateurs)
- ✅ **Type de problème** (obligatoire)
  - Nids de poule
  - Fissure
  - Affaissement
  - Inondation
  - Obstacle sur la route
  - Autre
- ✅ **Description** (obligatoire)
- ✅ **Photo** (optionnelle)
- ✅ **Localisation** (automatique via carte)

### 2. **Valeurs par défaut automatiques**
- `statut`: Toujours "nouveau" à la création
- `surface_m2`: null
- `budget`: null
- `entreprise`: null

→ Ces champs seront gérés par les **Managers** via l'interface admin

### 3. **Optimisations de performance**

#### Gestion d'erreur améliorée
- ✅ Try/catch sur l'upload de photos
- ✅ Logs détaillés pour déboguer
- ✅ Messages d'erreur clairs pour l'utilisateur
- ✅ Continue même si l'upload photo échoue

#### Upload photo non-bloquant
```typescript
// Si l'upload photo échoue, le signalement est quand même créé
if (input.photo) {
  try {
    photoUrl = await storageService.uploadSignalementPhoto(userId, input.photo);
  } catch (error) {
    console.warn('⚠️ Erreur upload photo, continue sans photo:', error);
    // Continue sans photo
  }
}
```

### 4. **Validation des champs**
- Type de problème: obligatoire
- Description: obligatoire (non vide)
- Photo: optionnelle

### 5. **Affichage amélioré**
- Popups montrent le type de problème
- Surface et budget masqués si null
- Date de création au lieu de dernière mise à jour

## 🔧 Fichiers modifiés

1. `src/models/signalement.model.ts`
   - Ajout type `TypeProbleme`
   - Ajout constante `TYPE_PROBLEME_LABELS`
   - Simplification `SignalementInput`

2. `src/components/SignalementForm.vue`
   - Retrait champs: statut, surface, budget, entreprise
   - Ajout champ: type de problème
   - Validation des champs obligatoires
   - Gestion d'erreur améliorée

3. `src/services/signalement.service.ts`
   - Upload photo non-bloquant
   - Statut par défaut "nouveau"
   - Logs de débogage
   - Gestion d'erreur robuste

4. `src/stores/signalement.store.ts`
   - Logs détaillés
   - Gestion d'erreur avec throw

5. `src/components/MapView.vue`
   - Affichage du type de problème
   - Masquage conditionnel des champs null

## 🚀 Comment tester

1. **Ouvrir la carte**
2. **Clic droit** ou **appui long** sur la carte
3. Remplir:
   - Type de problème (sélection)
   - Description (texte)
   - Photo (optionnel)
4. **Enregistrer**

→ Le signalement sera créé avec `statut: "nouveau"` automatiquement

## 📊 Impact

- ⚡ **Formulaire plus rapide** à remplir
- 🎯 **Rôles clarifiés**: Utilisateurs signalent, Managers gèrent
- 🐛 **Moins d'erreurs**: Moins de champs = moins d'erreurs de saisie
- 📱 **Meilleure UX mobile**: Interface simplifiée adaptée au terrain
