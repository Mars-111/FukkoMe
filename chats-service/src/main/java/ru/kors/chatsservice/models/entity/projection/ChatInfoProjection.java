package ru.kors.chatsservice.models.entity.projection;

import com.fasterxml.jackson.annotation.JsonProperty;

public interface ChatInfoProjection {
    @JsonProperty(value = "id")
    Long getId();
    @JsonProperty(value = "version")
    Integer getVersion();
    @JsonProperty(value = "tag")
    Long getTag();
    @JsonProperty(value = "name")
    String getName();
    @JsonProperty(value = "type")
    String getType(); //Отказываемся от ChatTypes, тк может плохо мапится
    @JsonProperty(value = "owner_id")
    Long getOwnerId();
}