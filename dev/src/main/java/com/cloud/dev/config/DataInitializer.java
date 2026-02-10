package com.cloud.dev.config;

import com.cloud.dev.entity.User;
import com.cloud.dev.enums.AuthProvider;
import com.cloud.dev.enums.Role;
import com.cloud.dev.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.default-manager.email}")
    private String defaultManagerEmail;

    @Value("${app.default-manager.password}")
    private String defaultManagerPassword;

    @Value("${app.default-manager.nom}")
    private String defaultManagerNom;

    @Value("${app.default-manager.prenom}")
    private String defaultManagerPrenom;

    @Value("${server.port:8080}")
    private String serverPort;

    @Override
    public void run(String... args) {
        createDefaultManagerIfNotExists();
        printStartupMessage();
    }

    private void printStartupMessage() {
        log.info("");
        log.info("╔═══════════════════════════════════════════════════════════════╗");
        log.info("║                                                               ║");
        log.info("║   🚀 SERVEUR DÉMARRÉ AVEC SUCCÈS !                            ║");
        log.info("║                                                               ║");
        log.info("║   API Backend:    http://localhost:{}                       ║", serverPort);
        log.info("║   Swagger UI:     http://localhost:{}/swagger-ui.html       ║", serverPort);
        log.info("║   API Docs:       http://localhost:{}/v3/api-docs           ║", serverPort);
        log.info("║                                                               ║");
        log.info("║   Manager par défaut:                                         ║");
        log.info("║     Email:        {}                       ║", defaultManagerEmail);
        log.info("║     Mot de passe: {}                                   ║", defaultManagerPassword);
        log.info("║                                                               ║");
        log.info("╚═══════════════════════════════════════════════════════════════╝");
        log.info("");
    }

    private void createDefaultManagerIfNotExists() {
        if (userRepository.findByEmail(defaultManagerEmail).isEmpty()) {
            User manager = new User();
            manager.setEmail(defaultManagerEmail);
            manager.setPassword(passwordEncoder.encode(defaultManagerPassword));
            manager.setNom(defaultManagerNom);
            manager.setPrenom(defaultManagerPrenom);
            manager.setRole(Role.MANAGER);
            manager.setAuthProvider(AuthProvider.LOCAL);
            manager.setActive(true);
            manager.setAccountLocked(false);
            manager.setLoginAttempts(0);

            userRepository.save(manager);
            
            log.info("===========================================");
            log.info("   MANAGER PAR DÉFAUT CRÉÉ");
            log.info("===========================================");
            log.info("   Email: {}", defaultManagerEmail);
            log.info("   Mot de passe: {}", defaultManagerPassword);
            log.info("===========================================");
        } else {
            log.info("Manager par défaut existe déjà: {}", defaultManagerEmail);
        }
    }
}
