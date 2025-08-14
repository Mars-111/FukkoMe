package org.example.identityservice.repositories.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public final class UserUpdateFields {
    private Long userId;
    private String username;
    private Long avatarId;

    public UserUpdateFields(Long userId) {
        this.userId = userId;
    }
}
