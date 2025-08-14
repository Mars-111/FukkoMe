package org.example.identityservice.controllers.extern.dto;

public record AuthenticateRequestDTO(
    String username,
    String password
) {
}
