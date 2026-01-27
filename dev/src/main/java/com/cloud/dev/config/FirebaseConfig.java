package com.cloud.dev.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
    
    @Value("${app.firebase.database-url:}")
    private String databaseUrl;
    
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
                        .setDatabaseUrl(databaseUrl)
                        .build();
                
                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                    log.info("Firebase initialisé avec succès");
                }
            } else {
                log.warn("Fichier de credentials Firebase non trouvé. Firebase désactivé.");
            }
        } catch (IOException e) {
            log.error("Erreur lors de l'initialisation de Firebase", e);
        }
    }
}
