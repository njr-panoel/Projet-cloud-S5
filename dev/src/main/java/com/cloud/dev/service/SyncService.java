package com.cloud.dev.service;

import com.cloud.dev.entity.Signalement;
import com.cloud.dev.entity.SyncLog;
import com.cloud.dev.entity.User;
import com.cloud.dev.repository.SignalementRepository;
import com.cloud.dev.repository.SyncLogRepository;
import com.cloud.dev.repository.UserRepository;
import com.google.firebase.database.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncService {
    
    private final SignalementRepository signalementRepository;
    private final UserRepository userRepository;
    private final SyncLogRepository syncLogRepository;
    
    @Value("${app.firebase.enabled:false}")
    private Boolean firebaseEnabled;
    
    /**
     * Synchronise tous les signalements non synchronisés vers Firebase
     */
    @Transactional
    public void syncSignalementsToFirebase() {
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Synchronisation impossible");
            return;
        }
        
        List<Signalement> unsyncedSignalements = signalementRepository.findBySynced(false);
        log.info("Synchronisation de {} signalements vers Firebase", unsyncedSignalements.size());
        
        for (Signalement signalement : unsyncedSignalements) {
            try {
                syncSignalementToFirebase(signalement);
                signalement.setSynced(true);
                signalementRepository.save(signalement);
                
                logSync("Signalement", signalement.getId(), "CREATE", signalement.getFirebaseId(), true, null);
            } catch (Exception e) {
                log.error("Erreur lors de la sync du signalement {}", signalement.getId(), e);
                logSync("Signalement", signalement.getId(), "CREATE", null, false, e.getMessage());
            }
        }
    }
    
    /**
     * Synchronise un signalement spécifique vers Firebase
     */
    private void syncSignalementToFirebase(Signalement signalement) {
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("signalements");
        
        Map<String, Object> data = new HashMap<>();
        data.put("titre", signalement.getTitre());
        data.put("description", signalement.getDescription());
        data.put("typeTravaux", signalement.getTypeTravaux().name());
        data.put("statut", signalement.getStatut().name());
        data.put("latitude", signalement.getLatitude());
        data.put("longitude", signalement.getLongitude());
        data.put("adresse", signalement.getAdresse());
        data.put("photos", signalement.getPhotos());
        data.put("userId", signalement.getUser().getId());
        data.put("createdAt", signalement.getCreatedAt().toString());
        
        String firebaseId;
        if (signalement.getFirebaseId() != null) {
            firebaseId = signalement.getFirebaseId();
            ref.child(firebaseId).setValueAsync(data);
        } else {
            DatabaseReference newRef = ref.push();
            firebaseId = newRef.getKey();
            newRef.setValueAsync(data);
            signalement.setFirebaseId(firebaseId);
        }
        
        log.info("Signalement {} synchronisé vers Firebase avec l'ID {}", signalement.getId(), firebaseId);
    }
    
    /**
     * Récupère les signalements depuis Firebase et les synchronise en local
     */
    @Transactional
    public void syncSignalementsFromFirebase() {
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Synchronisation impossible");
            return;
        }
        
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("signalements");
        
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    try {
                        syncSignalementFromFirebase(snapshot);
                    } catch (Exception e) {
                        log.error("Erreur lors de la sync depuis Firebase", e);
                    }
                }
            }
            
            @Override
            public void onCancelled(DatabaseError error) {
                log.error("Erreur Firebase: {}", error.getMessage());
            }
        });
    }
    
    private void syncSignalementFromFirebase(DataSnapshot snapshot) {
        String firebaseId = snapshot.getKey();
        
        // Vérifier si le signalement existe déjà
        List<Signalement> existing = signalementRepository.findAll().stream()
                .filter(s -> firebaseId.equals(s.getFirebaseId()))
                .toList();
        
        if (existing.isEmpty()) {
            // Créer nouveau signalement
            // Note: Nécessite une logique plus complexe pour mapper les données
            log.info("Nouveau signalement depuis Firebase: {}", firebaseId);
        }
    }
    
    /**
     * Enregistre un log de synchronisation
     */
    private void logSync(String entityType, Long entityId, String action, 
                        String firebaseId, Boolean success, String errorMessage) {
        SyncLog log = new SyncLog();
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setFirebaseId(firebaseId);
        log.setSuccess(success);
        log.setErrorMessage(errorMessage);
        syncLogRepository.save(log);
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
        
        stats.put("totalSignalements", totalSignalements);
        stats.put("syncedSignalements", syncedSignalements);
        stats.put("unsyncedSignalements", unsyncedSignalements);
        stats.put("successfulSyncs", successfulSyncs);
        stats.put("failedSyncs", failedSyncs);
        stats.put("totalUsers", totalUsers);
        stats.put("firebaseEnabled", firebaseEnabled);
        
        return stats;
    }
    
    /**
     * Synchronise les comptes utilisateurs mobiles vers Firebase
     */
    @Transactional
    public void syncUsersToFirebase() {
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Synchronisation des utilisateurs impossible");
            return;
        }
        
        List<User> mobileUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("UTILISATEUR_MOBILE"))
                .toList();
        
        log.info("Synchronisation de {} comptes mobiles vers Firebase", mobileUsers.size());
        
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users");
        
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
                data.put("createdAt", user.getCreatedAt().toString());
                
                ref.child(user.getId().toString()).setValueAsync(data);
                
                logSync("User", user.getId(), "SYNC_TO_FIREBASE", user.getId().toString(), true, null);
                log.info("Utilisateur {} synchronisé vers Firebase", user.getEmail());
            } catch (Exception e) {
                log.error("Erreur lors de la sync de l'utilisateur {}", user.getId(), e);
                logSync("User", user.getId(), "SYNC_TO_FIREBASE", null, false, e.getMessage());
            }
        }
    }
}
