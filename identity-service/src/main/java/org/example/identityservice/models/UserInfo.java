package org.example.identityservice.models;

import java.time.Instant;

public interface UserInfo {
    Long getId();
    String getUsername();
    Long getAvatarId();
    Integer getVersion();
    boolean isEnabled();
    Instant getCreatedAt(); // Или LocalDateTime, если нужно
}
