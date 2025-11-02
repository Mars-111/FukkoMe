package ru.kors.chatsservice.models;

public record AccessFileJWT(
        long fileId,
        long userId,
        String subject,
        String filename,
        String extension,
        long size,
        Integer width,
        Integer height
) {
}
