package me.fukko.statusservice.listeners.dto;

public record OnlineStatusDTO(Long userId, String session, boolean online, String type) {}

