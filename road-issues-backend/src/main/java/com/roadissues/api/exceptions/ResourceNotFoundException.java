package com.roadissues.api.exceptions;

/**
 * Exception thrown when resource is not found
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
