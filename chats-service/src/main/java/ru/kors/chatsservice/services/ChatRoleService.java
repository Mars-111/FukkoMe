package ru.kors.chatsservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import ru.kors.chatsservice.exceptions.BadRequestException;
import ru.kors.chatsservice.exceptions.DoesNotHaveAccessException;
import ru.kors.chatsservice.exceptions.InternalException;
import ru.kors.chatsservice.exceptions.NotFoundEntityException;
import ru.kors.chatsservice.models.entity.Chat;
import ru.kors.chatsservice.models.entity.ChatRole;
import ru.kors.chatsservice.repositories.ChatRoleRepository;
import ru.kors.chatsservice.repositories.UserChatRoleMappingRepository;
import ru.kors.chatsservice.repositories.dto.AccessFlagsAndRankDTO;

import java.util.List;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class ChatRoleService {
    private final ChatRoleRepository chatRoleRepository;
    private final UserChatRoleMappingRepository userChatRoleMappingRepository;

    public ChatRole findById(Long roleId) {
        return chatRoleRepository.findById(roleId).orElse(null);
    }

    public ChatRole findRoleByUserIdAndChat(long userId, long chatId) {
        return userChatRoleMappingRepository.findUserChatRole(userId, chatId)
                .orElseThrow(() -> new NotFoundEntityException("There is no role-user relationship for chat " + chatId));
    }

    public long findRoleAccessFlagsByUserIdAndChat(long userId, long chatId) {
        return userChatRoleMappingRepository.findRoleAccessFlagsByUserIdAndChatId(userId, chatId)
                .orElseThrow(() -> new NotFoundEntityException("There is no role-user relationship for chat " + chatId));
    }

    public AccessFlagsAndRankDTO findRoleAccessFlagsAndRankByUserIdAndChat(long userId, long chatId) {
        return userChatRoleMappingRepository.findRoleAccessFlagsAndRankByUserIdAndChatId(userId, chatId)
                .orElseThrow(() -> new NotFoundEntityException("There is no role-user relationship for chat " + chatId));
    }

    public void assignRole(long userId, long chatId, long roleId) {
        int countChanges = userChatRoleMappingRepository.assignRoleToUser(userId, chatId, roleId);
        if (countChanges < 1) {
            throw new InternalException("Failed to associate user" + userId +" with role " + roleId + " for chat " + chatId);
        }
    }
}
