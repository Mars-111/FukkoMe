package ru.kors.chatsservice.repositories.dto;

public interface ChatInsertResult {
    Long getChatId();
    Long getOwnerRoleId();
    Long getDefaultRoleId();
}
