package ru.kors.chatsservice.repositories.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public interface UserRolePairProjection {
    @JsonProperty("user_id")
    Long getUserId();
    @JsonProperty("role_id")
    Long getRoleId();
}
