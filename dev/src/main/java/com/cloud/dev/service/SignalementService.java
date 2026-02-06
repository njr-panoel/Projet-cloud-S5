package com.cloud.dev.service;

import com.cloud.dev.dto.StatistiquesResponse;
import com.cloud.dev.dto.request.SignalementRequest;
import com.cloud.dev.dto.response.SignalementResponse;
import com.cloud.dev.dto.response.UserResponse;
import com.cloud.dev.entity.Signalement;
import com.cloud.dev.entity.User;
import com.cloud.dev.enums.StatutSignalement;
import com.cloud.dev.enums.TypeTravaux;
import com.cloud.dev.exception.ResourceNotFoundException;
import com.cloud.dev.repository.SignalementRepository;
import com.cloud.dev.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SignalementService {
    
    private final SignalementRepository signalementRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public SignalementResponse createSignalement(SignalementRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        
        Signalement signalement = new Signalement();
        signalement.setTitre(request.getTitre());
        signalement.setDescription(request.getDescription());
        signalement.setTypeTravaux(request.getTypeTravaux());
        signalement.setStatut(request.getStatut() != null ? request.getStatut() : StatutSignalement.NOUVEAU);
        signalement.setLatitude(request.getLatitude());
        signalement.setLongitude(request.getLongitude());
        signalement.setAdresse(request.getAdresse());
        signalement.setPhotos(request.getPhotos());
        signalement.setUser(user);
        signalement.setFirebaseId(request.getFirebaseId());
        
        // Initialiser la date de création (dateNouveau)
        signalement.setDateNouveau(LocalDateTime.now());
        
        signalement = signalementRepository.save(signalement);
        log.info("Nouveau signalement créé: {} par {}", signalement.getId(), user.getEmail());
        
        return mapToResponse(signalement);
    }
    
    public List<SignalementResponse> getAllSignalements() {
        return signalementRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public SignalementResponse getSignalementById(Long id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé"));
        return mapToResponse(signalement);
    }
    
    public List<SignalementResponse> getSignalementsByStatut(StatutSignalement statut) {
        return signalementRepository.findByStatut(statut).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<SignalementResponse> getSignalementsByType(TypeTravaux type) {
        return signalementRepository.findByTypeTravaux(type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<SignalementResponse> getUnsyncedSignalements() {
        return signalementRepository.findBySynced(false).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public SignalementResponse updateSignalement(Long id, SignalementRequest request) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé"));
        
        if (request.getTitre() != null) signalement.setTitre(request.getTitre());
        if (request.getDescription() != null) signalement.setDescription(request.getDescription());
        if (request.getTypeTravaux() != null) signalement.setTypeTravaux(request.getTypeTravaux());
        if (request.getStatut() != null) {
            signalement.setStatut(request.getStatut());
            if (request.getStatut() == StatutSignalement.TERMINE) {
                signalement.setCompletedAt(LocalDateTime.now());
            }
        }
        if (request.getLatitude() != null) signalement.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) signalement.setLongitude(request.getLongitude());
        if (request.getAdresse() != null) signalement.setAdresse(request.getAdresse());
        if (request.getPhotos() != null) signalement.setPhotos(request.getPhotos());
        if (request.getSurfaceM2() != null) signalement.setSurfaceM2(request.getSurfaceM2());
        if (request.getBudget() != null) signalement.setBudget(request.getBudget());
        if (request.getEntreprise() != null) signalement.setEntreprise(request.getEntreprise());
        
        // Marquer comme non synchronisé pour la prochaine sync Firebase
        signalement.setSynced(false);
        
        signalement = signalementRepository.save(signalement);
        log.info("Signalement mis à jour: {} (marked for Firebase sync)", signalement.getId());
        
        return mapToResponse(signalement);
    }
    
    @Transactional
    public SignalementResponse updateStatut(Long id, StatutSignalement statut) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé"));
        
        StatutSignalement ancienStatut = signalement.getStatut();
        signalement.setStatut(statut);
        
        // Enregistrer les dates selon le nouveau statut
        LocalDateTime maintenant = LocalDateTime.now();
        switch (statut) {
            case NOUVEAU:
                if (signalement.getDateNouveau() == null) {
                    signalement.setDateNouveau(maintenant);
                }
                break;
            case EN_COURS:
                if (signalement.getDateEnCours() == null) {
                    signalement.setDateEnCours(maintenant);
                }
                break;
            case TERMINE:
                signalement.setDateTermine(maintenant);
                signalement.setCompletedAt(maintenant);
                break;
            case ANNULE:
                // Pas de date spécifique pour annulé
                break;
        }
        
        // Marquer comme non synchronisé pour la prochaine sync Firebase
        signalement.setSynced(false);
        
        signalement = signalementRepository.save(signalement);
        log.info("Statut du signalement {} changé: {} → {} (marked for Firebase sync)", id, ancienStatut, statut);
        
        return mapToResponse(signalement);
    }
    
    @Transactional
    public void deleteSignalement(Long id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé"));
        
        signalementRepository.delete(signalement);
        log.info("Signalement supprimé: {}", id);
    }
    
    @Transactional
    public void markAsSynced(Long id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé"));
        
        signalement.setSynced(true);
        signalementRepository.save(signalement);
    }
    
    /**
     * Calcule les statistiques des signalements pour le tableau de bord manager
     */
    public StatistiquesResponse getStatistiques() {
        List<Signalement> tous = signalementRepository.findAll();
        
        // Comptages par statut
        long nouveaux = tous.stream()
                .filter(s -> s.getStatut() == StatutSignalement.NOUVEAU).count();
        long enCours = tous.stream()
                .filter(s -> s.getStatut() == StatutSignalement.EN_COURS).count();
        long termines = tous.stream()
                .filter(s -> s.getStatut() == StatutSignalement.TERMINE).count();
        long annules = tous.stream()
                .filter(s -> s.getStatut() == StatutSignalement.ANNULE).count();
        
        // Délai moyen de traitement (NOUVEAU -> TERMINE)
        List<Long> delaisTraitement = tous.stream()
                .filter(s -> s.getDelaiTraitementJours() != null)
                .map(Signalement::getDelaiTraitementJours)
                .collect(Collectors.toList());
        
        Double delaiMoyenTraitement = delaisTraitement.isEmpty() ? null :
                delaisTraitement.stream().mapToLong(Long::longValue).average().orElse(0);
        
        Long delaiMinTraitement = delaisTraitement.isEmpty() ? null :
                delaisTraitement.stream().min(Long::compareTo).orElse(null);
        
        Long delaiMaxTraitement = delaisTraitement.isEmpty() ? null :
                delaisTraitement.stream().max(Long::compareTo).orElse(null);
        
        // Délai moyen de prise en charge (NOUVEAU -> EN_COURS)
        List<Long> delaisPriseEnCharge = tous.stream()
                .filter(s -> s.getDelaiPriseEnChargeJours() != null)
                .map(Signalement::getDelaiPriseEnChargeJours)
                .collect(Collectors.toList());
        
        Double delaiMoyenPriseEnCharge = delaisPriseEnCharge.isEmpty() ? null :
                delaisPriseEnCharge.stream().mapToLong(Long::longValue).average().orElse(0);
        
        // Statistiques par type de travaux
        Map<String, Long> parTypeTravaux = new HashMap<>();
        for (TypeTravaux type : TypeTravaux.values()) {
            long count = tous.stream()
                    .filter(s -> s.getTypeTravaux() == type).count();
            if (count > 0) {
                parTypeTravaux.put(type.name(), count);
            }
        }
        
        // Avancement moyen (exclut les annulés)
        List<Integer> avancements = tous.stream()
                .filter(s -> s.getStatut() != StatutSignalement.ANNULE)
                .map(Signalement::getAvancement)
                .filter(a -> a != null)
                .collect(Collectors.toList());
        
        Double avancementMoyen = avancements.isEmpty() ? 0.0 :
                avancements.stream().mapToInt(Integer::intValue).average().orElse(0);
        
        // Budget total par statut
        Double budgetTotal = tous.stream()
                .filter(s -> s.getBudget() != null)
                .mapToDouble(Signalement::getBudget).sum();
        
        Double budgetTermine = tous.stream()
                .filter(s -> s.getStatut() == StatutSignalement.TERMINE && s.getBudget() != null)
                .mapToDouble(Signalement::getBudget).sum();
        
        Double budgetEnCours = tous.stream()
                .filter(s -> s.getStatut() == StatutSignalement.EN_COURS && s.getBudget() != null)
                .mapToDouble(Signalement::getBudget).sum();
        
        log.info("Statistiques calculées: {} signalements, {} terminés, délai moyen: {} jours",
                tous.size(), termines, delaiMoyenTraitement);
        
        return StatistiquesResponse.builder()
                .totalSignalements((long) tous.size())
                .nouveaux(nouveaux)
                .enCours(enCours)
                .termines(termines)
                .annules(annules)
                .delaiMoyenTraitement(delaiMoyenTraitement)
                .delaiMoyenPriseEnCharge(delaiMoyenPriseEnCharge)
                .delaiMinTraitement(delaiMinTraitement)
                .delaiMaxTraitement(delaiMaxTraitement)
                .parTypeTravaux(parTypeTravaux)
                .avancementMoyen(avancementMoyen)
                .budgetTotal(budgetTotal)
                .budgetTermine(budgetTermine)
                .budgetEnCours(budgetEnCours)
                .build();
    }
    
    private SignalementResponse mapToResponse(Signalement signalement) {
        UserResponse userResponse = UserResponse.builder()
                .id(signalement.getUser().getId())
                .email(signalement.getUser().getEmail())
                .nom(signalement.getUser().getNom())
                .prenom(signalement.getUser().getPrenom())
                .role(signalement.getUser().getRole())
                .build();
        
        return SignalementResponse.builder()
                .id(signalement.getId())
                .titre(signalement.getTitre())
                .description(signalement.getDescription())
                .typeTravaux(signalement.getTypeTravaux())
                .statut(signalement.getStatut())
                .latitude(signalement.getLatitude())
                .longitude(signalement.getLongitude())
                .adresse(signalement.getAdresse())
                .photos(signalement.getPhotos())
                .surfaceM2(signalement.getSurfaceM2())
                .budget(signalement.getBudget())
                .entreprise(signalement.getEntreprise())
                .user(userResponse)
                .synced(signalement.getSynced())
                .firebaseId(signalement.getFirebaseId())
                .createdAt(signalement.getCreatedAt())
                .updatedAt(signalement.getUpdatedAt())
                .completedAt(signalement.getCompletedAt())
                // Dates de suivi d'avancement
                .dateNouveau(signalement.getDateNouveau())
                .dateEnCours(signalement.getDateEnCours())
                .dateTermine(signalement.getDateTermine())
                // Avancement et délais calculés
                .avancement(signalement.getAvancement())
                .delaiTraitementJours(signalement.getDelaiTraitementJours())
                .delaiPriseEnChargeJours(signalement.getDelaiPriseEnChargeJours())
                .build();
    }
}
