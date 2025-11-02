package ru.kors.chatsservice.controllers.external.dto;


public record CreateChatDTO (
    String tag,
    String type,
    String name,
    String description
) {
}
