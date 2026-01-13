package ru.kors.chatsservice.models.entity.projection;

import com.fasterxml.jackson.annotation.JsonProperty;

public interface ChatInfoProjection {
    @JsonProperty(value = "id")
    Long getId();
    @JsonProperty(value = "version")
    Integer getVersion();
    @JsonProperty(value = "tag")
    String getTag();
    @JsonProperty(value = "name")
    String getName();
    @JsonProperty(value = "type")
    String getType(); //Отказываемся от ChatTypes, тк может плохо мапится
    @JsonProperty(value = "description")
    String getDescription();
    @JsonProperty(value = "owner_id")
    Long getOwnerId();
    @JsonProperty(value = "small_avatar_id")
    Long getSmallAvatarId();
    @JsonProperty(value = "large_avatar_id")
    Long getLargeAvatarId();
    @JsonProperty(value = "fullscreen_avatar_id")
    Long getFullscreenAvatarId();
    @JsonProperty(value = "default_role_id")
    Long getDefaultRoleId();
}