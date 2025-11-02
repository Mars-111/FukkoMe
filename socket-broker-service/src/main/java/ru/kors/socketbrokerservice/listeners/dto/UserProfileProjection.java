package ru.kors.socketbrokerservice.listeners.dto;


import com.fasterxml.jackson.annotation.JsonProperty;


public interface UserProfileProjection {
    @JsonProperty(value = "id")
    Long getId();
    @JsonProperty(value = "username")
    String getUsername();
    @JsonProperty(value = "small_avatar")
    Long getSmallAvatarId();
    @JsonProperty(value = "large_avatar")
    Long getLargeAvatarId();
    @JsonProperty(value = "fullscreen_avatar")
    Long getFullscreenAvatarId();
    @JsonProperty(value = "version")
    Integer getVersion();
    @JsonProperty(value = "is_enabled")
    Boolean getEnabled();
}
