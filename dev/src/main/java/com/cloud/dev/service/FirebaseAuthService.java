package com.cloud.dev.service;

import com.cloud.dev.entity.User;
import com.cloud.dev.enums.AuthProvider;
import com.cloud.dev.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service pour gérer l'authentification Firebase
 * Permet de créer, mettre à jour et supprimer des comptes dans Firebase Auth
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FirebaseAuthService {
    
    private final UserRepository userRepository;
    
    @Value("${app.firebase.enabled:false}")
    private Boolean firebaseEnabled;
    
    @Value("${app.firebase.default-mobile-password:Mobile@123}")
    private String defaultMobilePassword;
    
    /**
     * Crée un compte Firebase Auth pour un utilisateur et stocke son UID
     * @param user L'utilisateur local
     * @param password Le mot de passe en clair
     * @return true si la création a réussi
     */
    @Transactional
    public boolean createFirebaseAccount(User user, String password) {
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Impossible de créer le compte Firebase pour {}", user.getEmail());
            return false;
        }
        
        // Vérifier si l'utilisateur a déjà un UID Firebase
        if (user.getFirebaseUid() != null) {
            log.info("L'utilisateur {} a déjà un compte Firebase (UID: {})", user.getEmail(), user.getFirebaseUid());
            return true;
        }
        
        try {
            // Vérifier si le compte existe déjà dans Firebase
            UserRecord existingUser = null;
            try {
                existingUser = FirebaseAuth.getInstance().getUserByEmail(user.getEmail());
            } catch (FirebaseAuthException e) {
                // L'utilisateur n'existe pas, on peut le créer
            }
            
            String firebaseUid;
            if (existingUser != null) {
                // Le compte existe déjà, on récupère son UID
                firebaseUid = existingUser.getUid();
                log.info("Compte Firebase existant trouvé pour {} (UID: {})", user.getEmail(), firebaseUid);
            } else {
                // Créer le compte dans Firebase Auth
                UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                        .setEmail(user.getEmail())
                        .setPassword(password)
                        .setDisplayName(user.getPrenom() + " " + user.getNom())
                        .setEmailVerified(true)
                        .setDisabled(!user.getActive());
                
                if (user.getTelephone() != null && !user.getTelephone().isEmpty()) {
                    // Firebase requiert un format E.164 pour le téléphone
                    String phone = formatPhoneNumber(user.getTelephone());
                    if (phone != null) {
                        request.setPhoneNumber(phone);
                    }
                }
                
                UserRecord firebaseUser = FirebaseAuth.getInstance().createUser(request);
                firebaseUid = firebaseUser.getUid();
                log.info("Compte Firebase créé pour {} (UID: {})", user.getEmail(), firebaseUid);
            }
            
            // Mettre à jour l'utilisateur local avec le UID Firebase
            user.setFirebaseUid(firebaseUid);
            user.setAuthProvider(AuthProvider.FIREBASE);
            userRepository.save(user);
            
            return true;
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de la création du compte Firebase pour {}: {}", user.getEmail(), e.getMessage());
            return false;
        }
    }
    
    /**
     * Met à jour un compte Firebase Auth existant
     */
    @Transactional
    public boolean updateFirebaseAccount(User user) {
        if (!firebaseEnabled || user.getFirebaseUid() == null) {
            return false;
        }
        
        try {
            UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(user.getFirebaseUid())
                    .setEmail(user.getEmail())
                    .setDisplayName(user.getPrenom() + " " + user.getNom())
                    .setDisabled(!user.getActive());
            
            FirebaseAuth.getInstance().updateUser(request);
            log.info("Compte Firebase mis à jour pour {} (UID: {})", user.getEmail(), user.getFirebaseUid());
            return true;
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de la mise à jour du compte Firebase pour {}: {}", user.getEmail(), e.getMessage());
            return false;
        }
    }
    
    /**
     * Supprime un compte Firebase Auth
     */
    public boolean deleteFirebaseAccount(String firebaseUid) {
        if (!firebaseEnabled || firebaseUid == null) {
            return false;
        }
        
        try {
            FirebaseAuth.getInstance().deleteUser(firebaseUid);
            log.info("Compte Firebase supprimé (UID: {})", firebaseUid);
            return true;
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de la suppression du compte Firebase (UID: {}): {}", firebaseUid, e.getMessage());
            return false;
        }
    }
    
    /**
     * Met à jour le mot de passe d'un compte Firebase Auth
     */
    public boolean updateFirebasePassword(User user, String newPassword) {
        if (!firebaseEnabled || user.getFirebaseUid() == null) {
            return false;
        }
        
        try {
            UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(user.getFirebaseUid())
                    .setPassword(newPassword);
            
            FirebaseAuth.getInstance().updateUser(request);
            log.info("Mot de passe Firebase mis à jour pour {} (UID: {})", user.getEmail(), user.getFirebaseUid());
            return true;
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de la mise à jour du mot de passe Firebase pour {}: {}", user.getEmail(), e.getMessage());
            return false;
        }
    }
    
    /**
     * Vérifie si un compte Firebase existe pour cet email
     */
    public boolean firebaseAccountExists(String email) {
        if (!firebaseEnabled) {
            return false;
        }
        
        try {
            FirebaseAuth.getInstance().getUserByEmail(email);
            return true;
        } catch (FirebaseAuthException e) {
            return false;
        }
    }
    
    /**
     * Récupère les informations d'un utilisateur Firebase par email
     */
    public UserRecord getFirebaseUserByEmail(String email) {
        if (!firebaseEnabled) {
            return null;
        }
        
        try {
            return FirebaseAuth.getInstance().getUserByEmail(email);
        } catch (FirebaseAuthException e) {
            return null;
        }
    }
    
    /**
     * Synchronise tous les utilisateurs mobiles vers Firebase Auth
     * @return Liste des utilisateurs synchronisés avec succès
     */
    @Transactional
    public List<User> syncAllMobileUsersToFirebase() {
        List<User> syncedUsers = new ArrayList<>();
        
        if (!firebaseEnabled) {
            log.warn("Firebase désactivé - Synchronisation des utilisateurs impossible");
            return syncedUsers;
        }
        
        List<User> mobileUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("UTILISATEUR_MOBILE"))
                .filter(u -> u.getFirebaseUid() == null) // Seulement ceux sans UID Firebase
                .toList();
        
        log.info("Synchronisation de {} comptes mobiles vers Firebase Auth", mobileUsers.size());
        
        for (User user : mobileUsers) {
            // Utilise le mot de passe par défaut configurable
            if (createFirebaseAccount(user, defaultMobilePassword)) {
                syncedUsers.add(user);
                log.info("Utilisateur {} synchronisé vers Firebase Auth avec mot de passe par défaut", user.getEmail());
            }
        }
        
        return syncedUsers;
    }
    
    /**
     * Génère un mot de passe temporaire sécurisé
     */
    private String generateTempPassword() {
        // Génère un mot de passe de 12 caractères
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            int index = (int) (Math.random() * chars.length());
            password.append(chars.charAt(index));
        }
        return password.toString();
    }
    
    /**
     * Formate un numéro de téléphone au format E.164 (Madagascar)
     */
    private String formatPhoneNumber(String phone) {
        if (phone == null || phone.isEmpty()) {
            return null;
        }
        
        // Nettoyer le numéro
        String cleaned = phone.replaceAll("[^0-9+]", "");
        
        // Si déjà au format international
        if (cleaned.startsWith("+")) {
            return cleaned;
        }
        
        // Si commence par 0, remplacer par +261
        if (cleaned.startsWith("0")) {
            return "+261" + cleaned.substring(1);
        }
        
        // Si commence par 261
        if (cleaned.startsWith("261")) {
            return "+" + cleaned;
        }
        
        // Sinon, ajouter +261
        return "+261" + cleaned;
    }
}
