package com.roadissues.api.exceptions;

/**
 * Exception thrown when validation fails
 */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
