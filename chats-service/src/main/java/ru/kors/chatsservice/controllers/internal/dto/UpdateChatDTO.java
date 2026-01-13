package ru.kors.chatsservice.controllers.internal.dto;


public record UpdateChatDTO(
        String tag,
        String name,
        String description
) {

}
