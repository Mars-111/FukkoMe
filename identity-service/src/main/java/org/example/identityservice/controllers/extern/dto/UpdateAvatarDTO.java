package org.example.identityservice.controllers.extern.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public record UpdateAvatarDTO(
        @NotNull
        @JsonProperty(value = "original")
        String originalAvatarToken,
        @NotNull
        @JsonProperty(value = "small")
        String smallAvatarToken,
        @NotNull
        @JsonProperty(value = "large")
        String largeAvatarToken,
        @NotNull
        @JsonProperty(value = "fullscreen")
        String fullscreenAvatarToken
) {
}
