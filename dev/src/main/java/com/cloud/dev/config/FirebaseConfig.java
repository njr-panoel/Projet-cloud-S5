package com.cloud.dev.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;

@Slf4j
@Configuration
public class FirebaseConfig {
    
    @Value("${app.firebase.enabled:false}")
    private Boolean firebaseEnabled;
    
    @Value("${app.firebase.credentials-path:}")
    private Resource credentialsPath;
    
    @PostConstruct
    public void initialize() {
        if (!firebaseEnabled) {
            log.info("Firebase est désactivé");
            return;
        }
        
        try {
            if (credentialsPath != null && credentialsPath.exists()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(credentialsPath.getInputStream()))
                        .build();
                
                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                    log.info("Firebase initialisé avec succès (Firestore)");
                }
            } else {
                log.warn("Fichier de credentials Firebase non trouvé. Firebase désactivé.");
            }
        } catch (IOException e) {
            log.error("Erreur lors de l'initialisation de Firebase", e);
        }
    }
    
    @Bean
    public Firestore firestore() {
        if (!firebaseEnabled) {
            log.warn("Firestore non disponible - Firebase désactivé");
            return null;
        }
        return FirestoreClient.getFirestore();
    }
}
