package ru.kors.chatsservice.exceptions;

public class InvalidFileToken extends RuntimeException {
    public InvalidFileToken(String message) {
        super(message);
    }
}
