package com.roadissues.api.models.dto;

// Export all DTOs for easy importing

// Auth DTOs
public class AuthDtosExport {
    public static class Register extends RegisterRequest {}
    public static class Login extends LoginRequest {}
    public static class Auth extends AuthResponse {}
    public static class UpdateProfile extends UpdateProfileRequest {}
    public static class UserProfile extends UserProfileDto {}
}

// Signalement DTOs
class SignalementDtosExport {
    public static class Create extends CreateSignalementRequest {}
    public static class Update extends UpdateSignalementRequest {}
    public static class Response extends SignalementDto {}
}

// General DTOs
class GeneralDtosExport {
    public static class Stats extends StatsDto {}
    public static class Sync extends SyncRequest {}
    public static class SyncSignal extends SignalementSyncDto {}
    public static class SyncResp extends SyncResponse {}
}

// Historique DTOs
class HistoriqueDtosExport {
    public static class Response extends HistoriqueDto {}
}
