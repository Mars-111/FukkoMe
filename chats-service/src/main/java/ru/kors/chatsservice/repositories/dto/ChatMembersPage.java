package ru.kors.chatsservice.repositories.dto;

import java.util.List;

public interface ChatMembersPage {
    List<Long> getIds();
    long getTotal();
    int getCurrentPage();
    int getTotalPages();
}
