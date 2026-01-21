package com.roadissues.api.exceptions;

/**
 * Exception thrown when user is blocked due to too many login attempts
 */
public class UserBlockedException extends RuntimeException {
    private final Long blockedUntilTime;

    public UserBlockedException(String message, Long blockedUntilTime) {
        super(message);
        this.blockedUntilTime = blockedUntilTime;
    }

    public Long getBlockedUntilTime() {
        return blockedUntilTime;
    }
}
