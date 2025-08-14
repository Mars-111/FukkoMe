package org.example.identityservice.exeptions;

public class NotSuchUserException extends RuntimeException {
    public NotSuchUserException(String message) {
        super(message);
    }
}
