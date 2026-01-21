package com.roadissues.api.exceptions;

/**
 * Exception thrown when user is not authorized
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
