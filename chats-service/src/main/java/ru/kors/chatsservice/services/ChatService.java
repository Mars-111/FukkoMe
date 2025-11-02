package ru.kors.chatsservice.services;


import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kors.chatsservice.controllers.external.dto.CreateChatDTO;
import ru.kors.chatsservice.controllers.external.dto.UpdateChatDTO;
import ru.kors.chatsservice.exceptions.*;
import ru.kors.chatsservice.models.constants.ChatRoleAccessFlags;
import ru.kors.chatsservice.models.entity.Chat;
import ru.kors.chatsservice.models.entity.ChatRole;
import ru.kors.chatsservice.models.entity.UserChatRoleMapping;
import ru.kors.chatsservice.models.entity.embeddable.UserChatRoleId;
import ru.kors.chatsservice.models.entity.enums.ChatType;
import ru.kors.chatsservice.models.entity.projection.ChatInfoProjection;
import ru.kors.chatsservice.repositories.ChatRepository;
import ru.kors.chatsservice.repositories.ChatRoleRepository;
import ru.kors.chatsservice.repositories.dto.ChatInsertResult;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatRoleRepository chatRoleRepository;
    private final KafkaProducerService kafkaProducerService;
    private final ChatEventService chatEventService;

    public List<Chat> findAll() {
        return chatRepository.findAll();
    }

    public Chat findById(long chatId) {
        return chatRepository.findById(chatId).orElseThrow(() -> new NotFoundEntityException("Chat not found"));
    }

    public ChatInfoProjection findByTag(String chatTag) {
        return chatRepository.findByTag(chatTag).orElseThrow(() -> new NotFoundEntityException("Chat not found"));
    }

    public List<ChatInfoProjection> findLikedTag(String chatTag, int limit) {
        return chatRepository.findAllLikedTag(chatTag, limit);
    }

    public List<ChatInfoProjection> findLikedName(String name, int limit) {
        return chatRepository.findAllLikedName(name, limit);
    }

    public Chat createChat(CreateChatDTO chatDTO, long ownerId) {
        if (chatDTO == null) {
            throw new BadRequestException("Invalid data in saveChat method.");
        }

        ChatType chatType = ChatType.fromString(chatDTO.type());
        if (chatType == null) {
            throw new BadRequestException("Invalid chat type.");
        }

        if (chatDTO.name().isEmpty()) {
            throw new BadRequestException("Chat name cannot be empty.");
        }

        if (chatRepository.existsByTag(chatDTO.tag())) {
            throw new ConflictException("tag");
        }

        Chat chat = new Chat();
        chat.setTag(chatDTO.tag());
        chat.setName(chatDTO.name());
        chat.setType(chatType);
        chat.setOwnerId(ownerId);
        chat.setDescription(chatDTO.description());
        chat.getUserIds().add(ownerId);

        //создаем owner роль
        ChatRole chatRole = new ChatRole();
        chatRole.setRank(9999);
        chatRole.setChat(chat);
        chatRole.setName("owner");
        chatRole.setAccessFlags(ChatRoleAccessFlags.ownerAccessFlag());

        chat.setChatRoles(new HashSet<>());
        chat.getChatRoles().add(chatRole);
        //
        try {
            ChatInsertResult result = chatRepository.insertChatWithOwnerRoleAndMapping(chat, chatRole);
            chat.setId(result.getChatId());
            chatRole.setId(result.getRoleId());
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("unknown");
        }
        catch (Exception e) {
            throw new InternalException("Failed to create chat: " + e.getMessage());
        }

        chat = chatRepository.findById(chat.getId()).orElseThrow(() -> new InternalException("Chat not found after creation"));

        kafkaProducerService.sendCreateChat(chat);
        kafkaProducerService.sendJoinChatUser(ownerId, chat.getId());

        return chat;
    }

//    public boolean updateChat(long chatId, long executorId, UpdateChatDTO dto) {
//        return chatRepository.updateChatIfCorrectOwnerId(ownerIdForVerify, chatId, dto.tag(), dto.name(), dto.description()) > 0;
//    }
//
//    public void deleteChat(long chatId, long executorId) {
//        int changes = chatRepository.deleteByIdIfCorrectOwnerId(ownerIdForVerify, chatId);
//        if (changes < 1)
//            throw new DoesNotHaveAccessException("You not owner");
//    }

    public boolean isUserInChat(long chatId, long userId) {
        return chatRepository.existsByIdAndUserId(chatId, userId);
    }

    public List<ChatInfoProjection> findAllByUserId(long userId) {
        return chatRepository.findAllByUserId(userId);
    }
}