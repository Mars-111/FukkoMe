package org.example.identityservice.controllers.extern.dto;

import com.fasterxml.jackson.databind.ObjectMapper;

public record UpdateUserDTO(
        String username
) {
}
