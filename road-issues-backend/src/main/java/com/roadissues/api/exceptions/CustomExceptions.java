package com.roadissues.api.exceptions;

/**
 * Exception thrown when authentication fails
 */
class AuthenticationExceptionLegacy extends RuntimeException {
    public AuthenticationExceptionLegacy(String message) {
        super(message);
    }

    public AuthenticationExceptionLegacy(String message, Throwable cause) {
        super(message, cause);
    }
}

/**
 * Exception thrown when user is blocked due to too many login attempts
 */
class UserBlockedExceptionLegacy extends RuntimeException {
    private final Long blockedUntilTime;

    public UserBlockedExceptionLegacy(String message, Long blockedUntilTime) {
        super(message);
        this.blockedUntilTime = blockedUntilTime;
    }

    public Long getBlockedUntilTime() {
        return blockedUntilTime;
    }
}

/**
 * Exception thrown when resource is not found
 */
class ResourceNotFoundExceptionLegacy extends RuntimeException {
    public ResourceNotFoundExceptionLegacy(String message) {
        super(message);
    }
}

/**
 * Exception thrown when validation fails
 */
class ValidationExceptionLegacy extends RuntimeException {
    public ValidationExceptionLegacy(String message) {
        super(message);
    }
}

/**
 * Exception thrown when user is not authorized
 */
class UnauthorizedExceptionLegacy extends RuntimeException {
    public UnauthorizedExceptionLegacy(String message) {
        super(message);
    }
}
