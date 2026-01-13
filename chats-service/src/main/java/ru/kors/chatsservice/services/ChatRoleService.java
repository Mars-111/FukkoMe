package ru.kors.chatsservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.kors.chatsservice.exceptions.*;
import ru.kors.chatsservice.models.entity.ChatRole;
import ru.kors.chatsservice.models.entity.projection.ChatMemberInfo;
import ru.kors.chatsservice.repositories.ChatRepository;
import ru.kors.chatsservice.repositories.ChatRoleRepository;
import ru.kors.chatsservice.repositories.ChatMemberRepository;
import ru.kors.chatsservice.repositories.dto.AccessFlagsAndRankDTO;
import ru.kors.chatsservice.repositories.dto.ChatMembersPage;
import ru.kors.chatsservice.repositories.dto.UserRolePairProjection;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ChatRoleService {
    private final ChatRoleRepository chatRoleRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final ChatRepository chatRepository;

    public ChatRole findById(Long roleId) {
        return chatRoleRepository.findById(roleId).orElseThrow(() -> new NotFoundEntityException("not found role by id: " + roleId));
    }

    public ChatRole findRoleByUserIdAndChat(long userId, long chatId) {
        return chatMemberRepository.findUserChatRole(userId, chatId)
                .orElseThrow(() -> new NotFoundEntityException("There is no role-user relationship for chat " + chatId));
    }

    public long findRoleAccessFlagsByUserIdAndChat(long userId, long chatId) {
        return chatMemberRepository.findRoleAccessFlagsByUserIdAndChatId(userId, chatId)
                .orElseThrow(() -> new NotFoundEntityException("There is no role-user relationship for chat " + chatId));
    }

    public AccessFlagsAndRankDTO findRoleAccessFlagsAndRankByUserIdAndChat(long userId, long chatId) {
        return chatMemberRepository.findRoleAccessFlagsAndRankByUserIdAndChatId(userId, chatId)
                .orElseThrow(() -> new NotFoundEntityException("There is no role-user relationship for chat " + chatId));
    }

    public void assignRole(long userId, long chatId, long roleId) {
        int countChanges = chatMemberRepository.assignUserAndRoleToChatMembers(chatId, userId, roleId);
        if (countChanges < 1) {
            throw new InternalException("Failed to associate user" + userId +" with role " + roleId + " for chat " + chatId);
        }
    }

    public boolean haveAccesses(long chatId, long userId, long accesses) {
        long roleAccessFlags = findRoleAccessFlagsByUserIdAndChat(userId, chatId);
        return (roleAccessFlags & accesses) == accesses;
    }

    public List<UserRolePairProjection> getTopRankRoleMembers(long chatId, int limit) {
        if (limit <= 0 ) {
            throw new BadRequestException("Limit must be greater than 0");
        }

        return chatRoleRepository.findTopRoleMembers(chatId, limit);
    }

    public ChatMembersPage getChatMembersByPages(long chatId, int offset, int limit) {
        if (limit <= 0 || offset < 0) {
            throw new BadRequestException("Limit and offset must be greater than 0");
        }

        return chatRepository.getChatMembersPage(chatId, offset, limit);
    }

    public List<ChatMemberInfo> getUserIdsAndRolesByChatId(Long chatId) {
        return chatMemberRepository.findUserIdsAndRolesByChatId(chatId);
    }

    public int getRoleVersion(Long id) {
        Integer version = chatRoleRepository.findVersionById(id);
        if (version == null) {
            throw new NotFoundEntityException("There is no role-user relationship for chat " + id);
        }
        return version;
    }
}
