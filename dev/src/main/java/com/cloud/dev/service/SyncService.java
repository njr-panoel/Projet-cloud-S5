package com.cloud.dev.service;

import com.cloud.dev.entity.Signalement;
import com.cloud.dev.entity.SyncLog;
import com.cloud.dev.entity.User;
import com.cloud.dev.enums.AuthProvider;
import com.cloud.dev.enums.Role;
import com.cloud.dev.enums.StatutSignalement;
import com.cloud.dev.enums.TypeTravaux;
import com.cloud.dev.repository.SignalementRepository;
import com.cloud.dev.repository.SyncLogRepository;
import com.cloud.dev.repository.UserRepository;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncService {
    
    private final SignalementRepository signalementRepository;
    private final UserRepository userRepository;
    private final SyncLogRepository syncLogRepository;
    private final FirebaseAuthService firebaseAuthService;
    
    @Value("${app.firebase.enabled:false}")
    private Boolean firebaseEnabled;
    
    private static final String SIGNALEMENTS_COLLECTION = "signalements";
    private static final String USERS_COLLECTION = "users";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    /**
     * Obtient l'instance Firestore
     */
    private Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }
    
    // =====================================================
    // SYNCHRONISATION AUTOMATIQUE
    // =====================================================
    
    /**
     * Synchronisation automatique toutes les 30 secondes
     * - Synchronise les signalements non synchronisés vers Firestore
     * - Synchronise les utilisateurs mobiles vers Firebase Auth
     */
    @Scheduled(fixedRate = 30000)
    public void autoSyncToFirebase() {
        if (firebaseEnabled) {
            // 1. Synchroniser les signalements vers Firestore
            int signalementsSynced = syncSignalementsToFirebase();
            if (signalementsSynced > 0) {
                log.info("Auto-sync: {} signalement(s) synchronisé(s) vers Firestore", signalementsSynced);
            }
            
            // 2. Synchroniser les utilisateurs mobiles vers Firebase Auth
            try {
                Map<String, Object> usersResult = syncUsersToFirebaseAuth();
                int usersSynced = (int) usersResult.getOrDefault("syncedCount", 0);
                if (usersSynced > 0) {
                    log.info("Auto-sync: {} utilisateur(s) mobile(s) synchronisé(s) vers Firebase Auth", usersSynced);
                }
            } catch (Exception e) {
                log.error("Erreur lors de la synchronisation automatique des utilisateurs: {}", e.getMessage());
            }
        }
    }
    
    /**
     * Import automatique des signalements depuis Firestore toutes les 60 secondes
     */
    @Scheduled(fixedRate = 60000, initialDelay = 15000)
    public void autoSyncFromFirebase() {
        if (firebaseEnabled) {
            try {
                Map<String, Object> result = syncSignalementsFromFirebaseSync();
                int imported = (int) result.getOrDefault("imported", 0);
                int updated = (int) result.getOrDefault("updated", 0);
                if (imported > 0 || updated > 0) {
                    log.info("Auto-import: {} signalement(s) importé(s), {} mis à jour depuis Firestore", imported, updated);
                }
            } catch (Exception e) {
                log.error("Erreur lors de l'import automatique depuis Firestore: {}", e.getMessage());
            }
        }
    }
    
    // =====================================================
    // SYNCHRONISATION BIDIRECTIONNELLE COMPLETE
    // =====================================================
    
    /**
     * Synchronisation bidirectionnelle complète
     * Compare les données PostgreSQL et Firestore, synchronise dans les deux sens
     * @return Map avec les statistiques de synchronisation
     */
    @Transactional
    public Map<String, Object> fullBidirectionalSync() {
        Map<String, Object> result = new HashMap<>();
        
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Synchronisation bidirectionnelle impossible");
            result.put("error", "Firebase désactivé");
            return result;
        }
        
        log.info("=== Début de la synchronisation bidirectionnelle (Firestore) ===");
        
        // 1. Synchroniser les utilisateurs (PostgreSQL → Firebase Auth)
        Map<String, Object> usersResult = syncUsersToFirebaseAuth();
        result.put("users", usersResult);
        
        // 2. Synchroniser les signalements PostgreSQL → Firestore
        int toFirebase = syncSignalementsToFirebase();
        result.put("signalementsToFirebase", toFirebase);
        
        // 3. Synchroniser les signalements Firestore → PostgreSQL
        Map<String, Object> fromFirebase = syncSignalementsFromFirebaseSync();
        result.put("signalementsFromFirebase", fromFirebase);
        
        // 4. Synchroniser les métadonnées utilisateurs vers Firestore
        syncUsersMetadataToFirebase();
        
        log.info("=== Synchronisation bidirectionnelle terminée ===");
        result.put("success", true);
        result.put("syncedAt", LocalDateTime.now().toString());
        
        return result;
    }
    
    // =====================================================
    // SIGNALEMENTS: PostgreSQL → Firestore
    // =====================================================
    
    /**
     * Synchronise tous les signalements non synchronisés vers Firestore
     */
    @Transactional
    public int syncSignalementsToFirebase() {
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Synchronisation impossible");
            return 0;
        }
        
        List<Signalement> unsyncedSignalements = signalementRepository.findBySynced(false);
        log.info("Synchronisation de {} signalements vers Firestore", unsyncedSignalements.size());
        
        int synced = 0;
        for (Signalement signalement : unsyncedSignalements) {
            try {
                syncSignalementToFirestore(signalement);
                signalement.setSynced(true);
                signalementRepository.save(signalement);
                synced++;
                
                logSync("Signalement", signalement.getId(), "SYNC_TO_FIRESTORE", signalement.getFirebaseId(), true, null);
            } catch (Exception e) {
                log.error("Erreur lors de la sync du signalement {}", signalement.getId(), e);
                logSync("Signalement", signalement.getId(), "SYNC_TO_FIRESTORE", null, false, e.getMessage());
            }
        }
        
        log.info("Synchronisation terminée: {}/{} signalements envoyés vers Firestore", synced, unsyncedSignalements.size());
        return synced;
    }
    
    /**
     * Force la synchronisation de TOUS les signalements vers Firestore
     */
    @Transactional
    public int forceFullSyncToFirebase() {
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Synchronisation impossible");
            return 0;
        }
        
        List<Signalement> allSignalements = signalementRepository.findAll();
        log.info("Force sync de {} signalements vers Firestore", allSignalements.size());
        
        int synced = 0;
        for (Signalement signalement : allSignalements) {
            try {
                syncSignalementToFirestore(signalement);
                signalement.setSynced(true);
                signalementRepository.save(signalement);
                synced++;
                
                logSync("Signalement", signalement.getId(), "FORCE_SYNC_TO_FIRESTORE", signalement.getFirebaseId(), true, null);
            } catch (Exception e) {
                log.error("Erreur lors de la sync du signalement {}", signalement.getId(), e);
                logSync("Signalement", signalement.getId(), "FORCE_SYNC_TO_FIRESTORE", null, false, e.getMessage());
            }
        }
        
        log.info("Force sync terminée: {}/{} signalements envoyés vers Firestore", synced, allSignalements.size());
        return synced;
    }
    
    /**
     * Synchronise un signalement spécifique vers Firestore
     */
    private void syncSignalementToFirestore(Signalement signalement) throws ExecutionException, InterruptedException {
        Firestore db = getFirestore();
        CollectionReference collection = db.collection(SIGNALEMENTS_COLLECTION);
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", signalement.getId());
        data.put("titre", signalement.getTitre());
        data.put("description", signalement.getDescription());
        data.put("typeTravaux", signalement.getTypeTravaux().name());
        data.put("statut", signalement.getStatut().name());
        data.put("latitude", signalement.getLatitude());
        data.put("longitude", signalement.getLongitude());
        data.put("adresse", signalement.getAdresse());
        data.put("photos", signalement.getPhotos());
        data.put("surfaceM2", signalement.getSurfaceM2());
        data.put("budget", signalement.getBudget());
        data.put("entreprise", signalement.getEntreprise());
        data.put("userId", signalement.getUser().getId());
        data.put("userEmail", signalement.getUser().getEmail());
        data.put("createdAt", signalement.getCreatedAt() != null ? signalement.getCreatedAt().toString() : null);
        data.put("updatedAt", signalement.getUpdatedAt() != null ? signalement.getUpdatedAt().toString() : null);
        data.put("completedAt", signalement.getCompletedAt() != null ? signalement.getCompletedAt().toString() : null);
        data.put("lastSyncedAt", LocalDateTime.now().toString());
        
        String firebaseId;
        if (signalement.getFirebaseId() != null) {
            // Mise à jour du document existant
            firebaseId = signalement.getFirebaseId();
            ApiFuture<WriteResult> result = collection.document(firebaseId).set(data);
            result.get(); // Attendre la fin de l'opération
            log.info("Signalement {} mis à jour sur Firestore avec l'ID {}", signalement.getId(), firebaseId);
        } else {
            // Création d'un nouveau document
            ApiFuture<DocumentReference> result = collection.add(data);
            DocumentReference docRef = result.get();
            firebaseId = docRef.getId();
            signalement.setFirebaseId(firebaseId);
            log.info("Signalement {} créé sur Firestore avec l'ID {}", signalement.getId(), firebaseId);
        }
    }
    
    // =====================================================
    // SIGNALEMENTS: Firestore → PostgreSQL
    // =====================================================
    
    /**
     * Récupère les signalements depuis Firestore (version asynchrone)
     */
    @Transactional
    public void syncSignalementsFromFirebase() {
        syncSignalementsFromFirebaseSync();
    }
    
    /**
     * Récupère les signalements depuis Firestore et les synchronise en local (version synchrone)
     * @return Map avec les statistiques de synchronisation
     */
    @Transactional
    public Map<String, Object> syncSignalementsFromFirebaseSync() {
        Map<String, Object> result = new HashMap<>();
        result.put("created", 0);
        result.put("updated", 0);
        result.put("errors", 0);
        
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Synchronisation impossible");
            result.put("error", "Firebase désactivé");
            return result;
        }
        
        try {
            Firestore db = getFirestore();
            ApiFuture<QuerySnapshot> future = db.collection(SIGNALEMENTS_COLLECTION).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            log.info("Récupération de {} signalements depuis Firestore", documents.size());
            
            int created = 0;
            int updated = 0;
            int errors = 0;
            
            for (QueryDocumentSnapshot document : documents) {
                try {
                    Map<String, Object> fbData = document.getData();
                    String firebaseId = document.getId();
                    fbData.put("firebaseId", firebaseId);
                    
                    // Log des données reçues pour debug
                    log.info("Données Firestore reçues: {}", fbData.keySet());
                    
                    Long postgresId = parseLong(fbData.get("id"));
                    
                    // Chercher si le signalement existe déjà
                    Optional<Signalement> existingByFirebaseId = signalementRepository.findAll().stream()
                            .filter(s -> firebaseId.equals(s.getFirebaseId()))
                            .findFirst();
                    
                    Optional<Signalement> existingById = postgresId != null 
                            ? signalementRepository.findById(postgresId) 
                            : Optional.empty();
                    
                    Signalement signalement;
                    boolean isNew = false;
                    
                    if (existingByFirebaseId.isPresent()) {
                        signalement = existingByFirebaseId.get();
                    } else if (existingById.isPresent()) {
                        signalement = existingById.get();
                        signalement.setFirebaseId(firebaseId);
                    } else {
                        // Nouveau signalement depuis Firestore
                        signalement = new Signalement();
                        signalement.setFirebaseId(firebaseId);
                        isNew = true;
                    }
                    
                    // Mettre à jour les champs depuis Firestore
                    updateSignalementFromFirestoreData(signalement, fbData);
                    
                    // Vérification finale des champs obligatoires
                    if (signalement.getTitre() == null || signalement.getTitre().isEmpty()) {
                        signalement.setTitre("Signalement importé #" + firebaseId.substring(0, 8));
                    }
                    if (signalement.getDescription() == null || signalement.getDescription().isEmpty()) {
                        signalement.setDescription("Description non fournie");
                    }
                    if (signalement.getTypeTravaux() == null) {
                        signalement.setTypeTravaux(TypeTravaux.AUTRE);
                    }
                    if (signalement.getStatut() == null) {
                        signalement.setStatut(StatutSignalement.NOUVEAU);
                    }
                    if (signalement.getLatitude() == null) {
                        signalement.setLatitude(-18.8792);
                    }
                    if (signalement.getLongitude() == null) {
                        signalement.setLongitude(47.5079);
                    }
                    
                    signalement.setSynced(true);
                    signalementRepository.save(signalement);
                    
                    if (isNew) {
                        created++;
                        logSync("Signalement", signalement.getId(), "SYNC_FROM_FIRESTORE_CREATE", firebaseId, true, null);
                    } else {
                        updated++;
                        logSync("Signalement", signalement.getId(), "SYNC_FROM_FIRESTORE_UPDATE", firebaseId, true, null);
                    }
                    
                } catch (Exception e) {
                    errors++;
                    log.error("Erreur lors de la synchronisation d'un signalement depuis Firestore: {}", e.getMessage());
                }
            }
            
            log.info("Synchronisation depuis Firestore terminée: {} créés, {} mis à jour, {} erreurs", created, updated, errors);
            
            result.put("created", created);
            result.put("updated", updated);
            result.put("errors", errors);
            result.put("total", documents.size());
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erreur lors de la récupération depuis Firestore: {}", e.getMessage());
            result.put("error", e.getMessage());
            Thread.currentThread().interrupt();
        }
        
        return result;
    }
    
    /**
     * Met à jour un signalement avec les données provenant de Firestore
     */
    private void updateSignalementFromFirestoreData(Signalement signalement, Map<String, Object> fbData) {
        // Titre (obligatoire) - vérifier plusieurs noms possibles
        String titre = getStringValue(fbData, "titre", "title", "nom", "name");
        if (titre != null && !titre.isEmpty()) {
            signalement.setTitre(titre);
        } else if (signalement.getTitre() == null) {
            // Utiliser la description comme titre si disponible
            String desc = getStringValue(fbData, "description", "desc");
            if (desc != null && !desc.isEmpty()) {
                signalement.setTitre(desc.length() > 50 ? desc.substring(0, 50) + "..." : desc);
            } else {
                signalement.setTitre("Signalement importé depuis mobile");
            }
        }
        
        // Description (obligatoire)
        String description = getStringValue(fbData, "description", "desc", "details");
        if (description != null && !description.isEmpty()) {
            signalement.setDescription(description);
        } else if (signalement.getDescription() == null) {
            signalement.setDescription("Aucune description");
        }
        
        // Type de travaux (avec valeur par défaut)
        String typeTravaux = getStringValue(fbData, "typeTravaux", "type", "typeProbleme");
        if (typeTravaux != null) {
            try {
                signalement.setTypeTravaux(TypeTravaux.valueOf(typeTravaux.toUpperCase().replace(" ", "_")));
            } catch (IllegalArgumentException e) {
                log.warn("Type de travaux inconnu: {}", typeTravaux);
                if (signalement.getTypeTravaux() == null) {
                    signalement.setTypeTravaux(TypeTravaux.AUTRE);
                }
            }
        } else if (signalement.getTypeTravaux() == null) {
            signalement.setTypeTravaux(TypeTravaux.AUTRE);
        }
        
        // Statut (avec valeur par défaut) - convertir en majuscules
        String statut = getStringValue(fbData, "statut", "status", "etat");
        if (statut != null) {
            try {
                signalement.setStatut(StatutSignalement.valueOf(statut.toUpperCase().replace(" ", "_")));
            } catch (IllegalArgumentException e) {
                log.warn("Statut inconnu: {}", fbData.get("statut"));
                if (signalement.getStatut() == null) {
                    signalement.setStatut(StatutSignalement.NOUVEAU);
                }
            }
        } else if (signalement.getStatut() == null) {
            signalement.setStatut(StatutSignalement.NOUVEAU);
        }
        
        // Géolocalisation (valeurs par défaut: Antananarivo)
        Double lat = parseDouble(fbData.get("latitude"));
        if (lat != null) {
            signalement.setLatitude(lat);
        } else if (signalement.getLatitude() == null) {
            signalement.setLatitude(-18.8792);
        }
        Double lng = parseDouble(fbData.get("longitude"));
        if (lng != null) {
            signalement.setLongitude(lng);
        } else if (signalement.getLongitude() == null) {
            signalement.setLongitude(47.5079);
        }
        
        // Adresse
        if (fbData.get("adresse") != null) {
            signalement.setAdresse((String) fbData.get("adresse"));
        }
        
        // Photos
        if (fbData.get("photos") != null) {
            signalement.setPhotos((String) fbData.get("photos"));
        }
        
        // Informations complémentaires
        Double surface = parseDouble(fbData.get("surfaceM2"));
        if (surface != null) {
            signalement.setSurfaceM2(surface);
        }
        Double budget = parseDouble(fbData.get("budget"));
        if (budget != null) {
            signalement.setBudget(budget);
        }
        if (fbData.get("entreprise") != null) {
            signalement.setEntreprise((String) fbData.get("entreprise"));
        }
        
        // Utilisateur - trouver par email ou ID
        if (signalement.getUser() == null) {
            User user = null;
            
            if (fbData.get("userEmail") != null) {
                user = userRepository.findByEmail((String) fbData.get("userEmail")).orElse(null);
            }
            
            if (user == null && fbData.get("userId") != null) {
                Long userId = parseLong(fbData.get("userId"));
                if (userId != null) {
                    user = userRepository.findById(userId).orElse(null);
                }
            }
            
            // Si aucun utilisateur trouvé, utiliser un utilisateur par défaut (le premier manager)
            if (user == null) {
                user = userRepository.findAll().stream()
                        .filter(u -> u.getRole() == Role.MANAGER)
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Aucun manager trouvé pour associer le signalement"));
            }
            
            signalement.setUser(user);
        }
    }
    
    // =====================================================
    // UTILISATEURS: Import depuis Firebase vers PostgreSQL
    // =====================================================
    
    /**
     * Importe les utilisateurs mobiles depuis Firestore vers PostgreSQL
     * Note: Firebase Auth ne permet pas de lister tous les utilisateurs via le SDK,
     * donc on utilise la collection Firestore "users" comme source
     * @return Map avec les statistiques d'import
     */
    @Transactional
    public Map<String, Object> syncUsersFromFirebase() {
        Map<String, Object> result = new HashMap<>();
        
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Import des utilisateurs impossible");
            result.put("error", "Firebase désactivé");
            return result;
        }
        
        log.info("=== Début de l'import des utilisateurs depuis Firestore ===");
        
        int imported = 0;
        int updated = 0;
        int errors = 0;
        List<String> importedEmails = new ArrayList<>();
        List<String> updatedEmails = new ArrayList<>();
        
        try {
            Firestore db = getFirestore();
            ApiFuture<QuerySnapshot> future = db.collection(USERS_COLLECTION).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            log.info("Trouvé {} utilisateurs dans Firestore", documents.size());
            
            for (QueryDocumentSnapshot document : documents) {
                try {
                    Map<String, Object> data = document.getData();
                    String email = (String) data.get("email");
                    String firebaseUid = (String) data.get("firebaseUid");
                    
                    if (email == null || email.isEmpty()) {
                        log.warn("Utilisateur Firestore sans email, ignoré: {}", document.getId());
                        continue;
                    }
                    
                    // Vérifier si l'utilisateur existe déjà
                    Optional<User> existingUser = userRepository.findByEmail(email);
                    
                    if (existingUser.isEmpty() && firebaseUid != null) {
                        existingUser = userRepository.findByFirebaseUid(firebaseUid);
                    }
                    
                    if (existingUser.isPresent()) {
                        // Mettre à jour l'utilisateur existant
                        User user = existingUser.get();
                        updateUserFromFirestoreData(user, data);
                        userRepository.save(user);
                        updated++;
                        updatedEmails.add(email);
                        log.debug("Utilisateur mis à jour depuis Firestore: {}", email);
                    } else {
                        // Créer un nouvel utilisateur
                        User newUser = createUserFromFirestoreData(data);
                        userRepository.save(newUser);
                        imported++;
                        importedEmails.add(email);
                        log.info("Nouvel utilisateur importé depuis Firestore: {}", email);
                    }
                    
                    logSync("User", null, "IMPORT_FROM_FIRESTORE", document.getId(), true, null);
                } catch (Exception e) {
                    errors++;
                    log.error("Erreur lors de l'import de l'utilisateur {}: {}", document.getId(), e.getMessage());
                    logSync("User", null, "IMPORT_FROM_FIRESTORE", document.getId(), false, e.getMessage());
                }
            }
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erreur lors de la récupération des utilisateurs depuis Firestore: {}", e.getMessage());
            result.put("error", e.getMessage());
        }
        
        result.put("imported", imported);
        result.put("updated", updated);
        result.put("errors", errors);
        result.put("importedEmails", importedEmails);
        result.put("updatedEmails", updatedEmails);
        
        log.info("=== Import terminé: {} importés, {} mis à jour, {} erreurs ===", imported, updated, errors);
        
        return result;
    }
    
    /**
     * Crée un utilisateur à partir des données Firestore
     */
    private User createUserFromFirestoreData(Map<String, Object> data) {
        User user = new User();
        user.setEmail((String) data.get("email"));
        user.setNom((String) data.getOrDefault("nom", "Inconnu"));
        user.setPrenom((String) data.getOrDefault("prenom", "Inconnu"));
        user.setTelephone((String) data.get("telephone"));
        user.setFirebaseUid((String) data.get("firebaseUid"));
        user.setAuthProvider(AuthProvider.FIREBASE);
        
        // Définir le rôle
        String roleStr = (String) data.get("role");
        if (roleStr != null) {
            try {
                user.setRole(Role.valueOf(roleStr));
            } catch (IllegalArgumentException e) {
                user.setRole(Role.UTILISATEUR_MOBILE);
            }
        } else {
            user.setRole(Role.UTILISATEUR_MOBILE);
        }
        
        // Définir l'état actif
        Object activeObj = data.get("active");
        if (activeObj instanceof Boolean) {
            user.setActive((Boolean) activeObj);
        } else {
            user.setActive(true);
        }
        
        return user;
    }
    
    /**
     * Met à jour un utilisateur existant avec les données Firestore
     */
    private void updateUserFromFirestoreData(User user, Map<String, Object> data) {
        // Ne met à jour que si le firebaseUid n'est pas déjà défini
        if (user.getFirebaseUid() == null && data.get("firebaseUid") != null) {
            user.setFirebaseUid((String) data.get("firebaseUid"));
            user.setAuthProvider(AuthProvider.FIREBASE);
        }
        
        // Mettre à jour le téléphone si vide
        if ((user.getTelephone() == null || user.getTelephone().isEmpty()) && data.get("telephone") != null) {
            user.setTelephone((String) data.get("telephone"));
        }
    }
    
    // =====================================================
    // UTILISATEURS: Synchronisation vers Firebase
    // =====================================================
    
    /**
     * Synchronise les utilisateurs mobiles vers Firebase Auth (création de comptes)
     * @return Map avec les statistiques de synchronisation
     */
    @Transactional
    public Map<String, Object> syncUsersToFirebaseAuth() {
        Map<String, Object> result = new HashMap<>();
        
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Synchronisation des utilisateurs impossible");
            result.put("error", "Firebase désactivé");
            return result;
        }
        
        List<User> syncedUsers = firebaseAuthService.syncAllMobileUsersToFirebase();
        
        result.put("syncedCount", syncedUsers.size());
        result.put("syncedEmails", syncedUsers.stream().map(User::getEmail).toList());
        
        log.info("{} utilisateurs mobiles synchronisés vers Firebase Auth", syncedUsers.size());
        
        return result;
    }
    
    /**
     * Synchronise les métadonnées des utilisateurs vers Firestore
     */
    @Transactional
    public void syncUsersMetadataToFirebase() {
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Synchronisation des métadonnées utilisateurs impossible");
            return;
        }
        
        List<User> mobileUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("UTILISATEUR_MOBILE"))
                .toList();
        
        log.info("Synchronisation des métadonnées de {} comptes mobiles vers Firestore", mobileUsers.size());
        
        try {
            Firestore db = getFirestore();
            CollectionReference collection = db.collection(USERS_COLLECTION);
            
            for (User user : mobileUsers) {
                try {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", user.getId());
                    data.put("email", user.getEmail());
                    data.put("nom", user.getNom());
                    data.put("prenom", user.getPrenom());
                    data.put("telephone", user.getTelephone());
                    data.put("role", user.getRole().name());
                    data.put("active", user.getActive());
                    data.put("firebaseUid", user.getFirebaseUid());
                    data.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
                    data.put("lastSyncedAt", LocalDateTime.now().toString());
                    
                    // Utiliser l'ID PostgreSQL comme ID du document
                    ApiFuture<WriteResult> result = collection.document(user.getId().toString()).set(data);
                    result.get(); // Attendre la fin de l'opération
                    
                    logSync("User", user.getId(), "SYNC_METADATA_TO_FIRESTORE", user.getId().toString(), true, null);
                    log.debug("Métadonnées utilisateur {} synchronisées vers Firestore", user.getEmail());
                } catch (Exception e) {
                    log.error("Erreur lors de la sync des métadonnées de l'utilisateur {}", user.getId(), e);
                    logSync("User", user.getId(), "SYNC_METADATA_TO_FIRESTORE", null, false, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'accès à Firestore: {}", e.getMessage());
        }
    }
    
    /**
     * Ancienne méthode pour compatibilité
     */
    @Transactional
    public void syncUsersToFirebase() {
        syncUsersToFirebaseAuth();
        syncUsersMetadataToFirebase();
    }
    
    // =====================================================
    // UTILITAIRES
    // =====================================================
    
    /**
     * Enregistre un log de synchronisation
     */
    private void logSync(String entityType, Long entityId, String action, 
                        String firebaseId, Boolean success, String errorMessage) {
        SyncLog syncLog = new SyncLog();
        syncLog.setEntityType(entityType);
        syncLog.setEntityId(entityId);
        syncLog.setAction(action);
        syncLog.setFirebaseId(firebaseId);
        syncLog.setSuccess(success);
        syncLog.setErrorMessage(errorMessage);
        syncLogRepository.save(syncLog);
    }
    
    /**
     * Obtient les statistiques de synchronisation
     */
    public Map<String, Object> getSyncStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalSignalements = signalementRepository.count();
        long syncedSignalements = signalementRepository.findBySynced(true).size();
        long unsyncedSignalements = signalementRepository.findBySynced(false).size();
        
        long successfulSyncs = syncLogRepository.findBySuccess(true).size();
        long failedSyncs = syncLogRepository.findBySuccess(false).size();
        
        long totalUsers = userRepository.count();
        long mobileUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("UTILISATEUR_MOBILE"))
                .count();
        long mobileUsersWithFirebaseUid = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("UTILISATEUR_MOBILE"))
                .filter(u -> u.getFirebaseUid() != null)
                .count();
        
        // Statistiques Firestore
        if (firebaseEnabled) {
            try {
                Firestore db = getFirestore();
                ApiFuture<QuerySnapshot> signalementsFuture = db.collection(SIGNALEMENTS_COLLECTION).get();
                ApiFuture<QuerySnapshot> usersFuture = db.collection(USERS_COLLECTION).get();
                
                stats.put("firestoreSignalements", signalementsFuture.get().size());
                stats.put("firestoreUsers", usersFuture.get().size());
            } catch (Exception e) {
                log.warn("Impossible de récupérer les stats Firestore: {}", e.getMessage());
            }
        }
        
        stats.put("totalSignalements", totalSignalements);
        stats.put("syncedSignalements", syncedSignalements);
        stats.put("unsyncedSignalements", unsyncedSignalements);
        stats.put("successfulSyncs", successfulSyncs);
        stats.put("failedSyncs", failedSyncs);
        stats.put("totalUsers", totalUsers);
        stats.put("mobileUsers", mobileUsers);
        stats.put("mobileUsersWithFirebaseAuth", mobileUsersWithFirebaseUid);
        stats.put("firebaseEnabled", firebaseEnabled);
        
        return stats;
    }
    
    /**
     * Parse un Long depuis un Object qui peut être String ou Number
     */
    private Long parseLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                log.warn("Impossible de parser Long: {}", value);
                return null;
            }
        }
        return null;
    }
    
    /**
     * Parse un Double depuis un Object qui peut être String ou Number
     */
    private Double parseDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).doubleValue();
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                log.warn("Impossible de parser Double: {}", value);
                return null;
            }
        }
        return null;
    }
    
    /**
     * Récupère une valeur String depuis la map avec plusieurs clés possibles
     */
    private String getStringValue(Map<String, Object> data, String... keys) {
        for (String key : keys) {
            Object value = data.get(key);
            if (value != null) {
                return value.toString();
            }
        }
        return null;
    }
}
