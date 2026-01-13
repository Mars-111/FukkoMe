package ru.kors.chatsservice.exceptions;

public class BlockingTooLargeRequest extends RuntimeException {
    public BlockingTooLargeRequest(String message) {
        super(message);
    }
}
