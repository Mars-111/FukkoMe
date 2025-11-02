package org.example.identityservice.repositories.dto;

public record ModifyingAvatarDTO(
    Long originalAvatarId,
    Long smallAvatarId,
    Long largeAvatarId,
    Long fullscreenAvatarId
) {
}
