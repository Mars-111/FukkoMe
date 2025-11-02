package ru.kors.socketbrokerservice.services.dto;

public record OnlineStatusDTO(Long userId, String session, boolean online, String type) {}

