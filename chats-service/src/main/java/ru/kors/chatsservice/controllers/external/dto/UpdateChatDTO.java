package ru.kors.chatsservice.controllers.external.dto;

public record UpdateChatDTO(
        String tag,
        String name,
        String description
) {
}
