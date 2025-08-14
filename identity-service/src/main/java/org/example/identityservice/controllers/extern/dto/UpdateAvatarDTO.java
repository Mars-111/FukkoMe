package org.example.identityservice.controllers.extern.dto;

public record UpdateAvatarDTO(
        Long originalAvatarId,
        Long smallAvatarId,
        Long bigAvatarId
) {
}
