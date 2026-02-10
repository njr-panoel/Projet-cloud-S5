package com.cloud.dev.service;

import com.cloud.dev.dto.request.LoginRequest;
import com.cloud.dev.dto.request.RegisterRequest;
import com.cloud.dev.dto.response.AuthResponse;
import com.cloud.dev.dto.response.UserResponse;
import com.cloud.dev.entity.LoginAttempt;
import com.cloud.dev.entity.Session;
import com.cloud.dev.entity.User;
import com.cloud.dev.enums.AuthProvider;
import com.cloud.dev.exception.AccountLockedException;
import com.cloud.dev.exception.InvalidCredentialsException;
import com.cloud.dev.exception.UserAlreadyExistsException;
import com.cloud.dev.repository.LoginAttemptRepository;
import com.cloud.dev.repository.SessionRepository;
import com.cloud.dev.repository.UserRepository;
import com.cloud.dev.util.JwtUtil;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final FirebaseAuthService firebaseAuthService;
    
    @Value("${app.security.max-login-attempts}")
    private Integer maxLoginAttempts;
    
    @Value("${app.security.account-lock-duration}")
    private Long lockDuration;
    
    @Value("${app.firebase.enabled:false}")
    private Boolean firebaseEnabled;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Vérifier si l'utilisateur existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Un utilisateur avec cet email existe déjà");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setTelephone(request.getTelephone());
        user.setRole(request.getRole());
        
        // Si Firebase UID fourni
        if (request.getFirebaseUid() != null && !request.getFirebaseUid().isEmpty()) {
            user.setFirebaseUid(request.getFirebaseUid());
            user.setAuthProvider(AuthProvider.FIREBASE);
        } else {
            // Sinon, auth locale
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setAuthProvider(AuthProvider.LOCAL);
        }
        
        user = userRepository.save(user);
        
        // Créer le compte Firebase Auth immédiatement pour les utilisateurs mobiles
        if (user.getRole() == com.cloud.dev.enums.Role.UTILISATEUR_MOBILE && firebaseEnabled) {
            boolean firebaseCreated = firebaseAuthService.createFirebaseAccount(user, request.getPassword());
            if (firebaseCreated) {
                log.info("Compte Firebase Auth créé pour l'utilisateur mobile: {}", user.getEmail());
            } else {
                log.warn("Échec de la création du compte Firebase Auth pour: {}", user.getEmail());
            }
        }
        
        // Générer token JWT
        String token = jwtUtil.generateToken(user.getEmail());
        
        // Créer session
        createSession(user, token, null);
        
        return buildAuthResponse(user, token);
    }
    
    @Transactional(noRollbackFor = {InvalidCredentialsException.class, AccountLockedException.class})
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Email ou mot de passe incorrect"));
        
        // Vérifier si le compte est verrouillé
        checkAccountLock(user);
        
        // Authentification hybride
        if (request.getUseFirebase() && firebaseEnabled) {
            authenticateWithFirebase(request.getPassword(), user);
        } else {
            authenticateLocal(request.getPassword(), user);
        }
        
        // Réinitialiser les tentatives en cas de succès
        user.setLoginAttempts(0);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Enregistrer la connexion réussie
        recordLoginAttempt(user, true, null);
        
        // Générer token JWT
        String token = jwtUtil.generateToken(user.getEmail());
        
        // Créer session
        createSession(user, token, request.getDeviceInfo());
        
        return buildAuthResponse(user, token);
    }
    
    private void authenticateLocal(String password, User user) {
        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            handleFailedLogin(user, "Mot de passe incorrect");
            throw new InvalidCredentialsException("Email ou mot de passe incorrect");
        }
    }
    
    private void authenticateWithFirebase(String idToken, User user) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String firebaseUid = decodedToken.getUid();
            
            if (!firebaseUid.equals(user.getFirebaseUid())) {
                handleFailedLogin(user, "UID Firebase ne correspond pas");
                throw new InvalidCredentialsException("Token Firebase invalide");
            }
        } catch (FirebaseAuthException e) {
            log.error("Erreur Firebase Auth", e);
            handleFailedLogin(user, "Erreur vérification Firebase: " + e.getMessage());
            throw new InvalidCredentialsException("Authentification Firebase échouée");
        }
    }
    
    private void checkAccountLock(User user) {
        if (user.getAccountLocked() != null && user.getAccountLocked()) {
            // Le compte reste bloqué jusqu'à ce qu'un manager le débloque
            // Pas de déblocage automatique basé sur le temps
            Integer attempts = user.getLoginAttempts() != null ? user.getLoginAttempts() : 0;
            throw new AccountLockedException(
                "Compte verrouillé après " + attempts + " tentatives échouées. Contactez un manager pour le déblocage."
            );
        }
    }
    
    private void handleFailedLogin(User user, String failureReason) {
        // Initialiser à 0 si NULL
        if (user.getLoginAttempts() == null) {
            user.setLoginAttempts(0);
        }
        
        user.setLoginAttempts(user.getLoginAttempts() + 1);
        
        // Enregistrer la tentative échouée
        recordLoginAttempt(user, false, failureReason);
        
        if (user.getLoginAttempts() >= maxLoginAttempts) {
            user.setAccountLocked(true);
            user.setLockedUntil(null); // Pas de déblocage automatique
            log.warn("Compte verrouillé définitivement pour l'utilisateur: {} après {} tentatives", 
                    user.getEmail(), maxLoginAttempts);
        }
        
        userRepository.save(user);
    }
    
    private void recordLoginAttempt(User user, boolean success, String failureReason) {
        LoginAttempt attempt = new LoginAttempt();
        attempt.setUser(user);
        attempt.setSuccess(success);
        attempt.setFailureReason(failureReason);
        
        // Récupérer l'adresse IP et User-Agent
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                attempt.setIpAddress(getClientIpAddress(request));
                attempt.setUserAgent(request.getHeader("User-Agent"));
            } else {
                attempt.setIpAddress("unknown");
            }
        } catch (Exception e) {
            attempt.setIpAddress("unknown");
        }
        
        loginAttemptRepository.save(attempt);
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
    
    private void createSession(User user, String token, String deviceInfo) {
        Session session = new Session();
        session.setToken(token);
        session.setUser(user);
        session.setExpiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getExpirationInSeconds()));
        session.setDeviceInfo(deviceInfo);
        sessionRepository.save(session);
    }
    
    private AuthResponse buildAuthResponse(User user, String token) {
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .telephone(user.getTelephone())
                .role(user.getRole())
                .authProvider(user.getAuthProvider())
                .active(user.getActive())
                .accountLocked(user.getAccountLocked())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
        
        return AuthResponse.builder()
                .token(token)
                .user(userResponse)
                .expiresIn(jwtUtil.getExpirationInSeconds())
                .build();
    }
    
    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Utilisateur non trouvé"));
        
        sessionRepository.deleteByUser(user);
    }
}
