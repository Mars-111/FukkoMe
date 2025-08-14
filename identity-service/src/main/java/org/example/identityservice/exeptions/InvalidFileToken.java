package org.example.identityservice.exeptions;

public class InvalidFileToken extends RuntimeException {
    public InvalidFileToken(String message) {
        super(message);
    }
}
