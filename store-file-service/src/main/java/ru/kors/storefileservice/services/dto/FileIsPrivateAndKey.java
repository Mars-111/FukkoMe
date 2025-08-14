package ru.kors.storefileservice.services.dto;

public record FileIsPrivateAndKey(
        Boolean isPrivate,
        String key
) {
}
