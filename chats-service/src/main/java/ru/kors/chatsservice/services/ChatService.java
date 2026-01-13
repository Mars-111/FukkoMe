package ru.kors.chatsservice.services;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kors.chatsservice.controllers.external.dto.ChatMembersDTO;
import ru.kors.chatsservice.controllers.external.dto.CreateChatDTO;
import ru.kors.chatsservice.controllers.external.dto.UpdateAvatarDTO;
import ru.kors.chatsservice.controllers.internal.dto.UpdateChatDTO;
import ru.kors.chatsservice.exceptions.*;
import ru.kors.chatsservice.models.constants.ChatRoleAccessFlags;
import ru.kors.chatsservice.models.entity.Chat;
import ru.kors.chatsservice.models.entity.ChatEvent;
import ru.kors.chatsservice.models.entity.ChatRole;
import ru.kors.chatsservice.models.entity.enums.ChatEventType;
import ru.kors.chatsservice.models.entity.enums.ChatType;
import ru.kors.chatsservice.models.entity.projection.ChatInfoProjection;
import ru.kors.chatsservice.repositories.ChatEventRepository;
import ru.kors.chatsservice.repositories.ChatMemberRepository;
import ru.kors.chatsservice.repositories.ChatRepository;
import ru.kors.chatsservice.repositories.ChatRoleRepository;
import ru.kors.chatsservice.repositories.dto.ChatInsertResult;
import ru.kors.chatsservice.repositories.dto.ModifyingAvatarDTO;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatRoleRepository chatRoleRepository;
    private final KafkaProducerService kafkaProducerService;
    private final ChatEventService chatEventService;
    private final FileJWTService fileJWTService;
    private final ChatRoleService chatRoleService;
    private final ChatMemberRepository chatMemberRepository;
    private final ChatEventRepository chatEventRepository;
    private final TimelineService timelineService;

    public ChatInfoProjection findById(long chatId) {
        return chatRepository.findInfoProjectionById(chatId).orElseThrow(() -> new NotFoundEntityException("Chat not found"));
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

    public ChatInfoProjection createChat(CreateChatDTO chatDTO, long ownerId) {
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
        chat.setOriginalAvatarId(-1L);
        chat.setSmallAvatarId(-1L);
        chat.setLargeAvatarId(-1L);
        chat.setFullscreenAvatarId(-1L);
        chat.setChatRoles(new HashSet<>());

        //создаем default роль
        ChatRole defaultRole = new ChatRole();
        defaultRole.setRank(10);
        defaultRole.setChat(chat);
        defaultRole.setName("default");
        defaultRole.setAccessFlags(ChatRoleAccessFlags.defaultRoleAccessFlags());

        chat.getChatRoles().add(defaultRole);
        chat.setDefaultRole(defaultRole);
        //

        //создаем owner роль
        ChatRole ownerRole = new ChatRole();
        ownerRole.setRank(9999);
        ownerRole.setChat(chat);
        ownerRole.setName("owner");
        ownerRole.setAccessFlags(ChatRoleAccessFlags.ownerAccessFlags());

        chat.getChatRoles().add(ownerRole);
        //


        try {
            chatRepository.save(chat);
            chatMemberRepository.assignUserAndRoleToChatMembers(chat.getId(), ownerId, ownerRole.getId());
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("unknown");
        }
        catch (Exception e) {
            throw new InternalException("Failed to create chat: " + e.getMessage());
        }

        ChatInfoProjection chatInfoProjection = chatRepository.findInfoProjectionById(chat.getId()).orElseThrow(() -> new InternalException("Chat not found after creation"));


        kafkaProducerService.send(chatEventService.createJoinChatEvent(chatInfoProjection.getId(), ownerId));


        return chatInfoProjection;
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
        return chatRepository.isUserInChat(chatId, userId);
    }

    public List<ChatInfoProjection> findAllByUserId(long userId) {
        return chatRepository.findAllByUserId(userId);
    }

    public boolean isOwner(long chatId, long userId) {
        return chatRepository.existsByIdAndOwnerId(chatId, userId);
    }

    private boolean verifyAvatarToken(Claims tokenClaim, Set<String> allowedExtensions, Integer side) {
        log.info("111");
        if (tokenClaim == null) {
            return false;
        }
        log.info("222");
        log.info("token private: " + tokenClaim.get("private", Boolean.class));
        if (tokenClaim.get("private", Boolean.class)) {
            return false;
        }
        log.info("333");
        String extension = tokenClaim.get("extension", String.class);
        if (!allowedExtensions.contains(extension)) {
            return false;
        }
        log.info("444");
        if (side != null) {
            Map<String, Object> fileMetadata = tokenClaim.get("fileMetadata", Map.class);
            Integer tokenWidth = (Integer) fileMetadata.get("width");
            Integer tokenHeight = (Integer) fileMetadata.get("height");
            if (!tokenWidth.equals(tokenHeight) || tokenWidth > side) {
                return false;
            }
        }
        log.info("555");

        return true;
    }

    @Transactional
    public void updateAvatar(Long chatId, Long userExecutorId, UpdateAvatarDTO updateAvatarDTO) {
        if (!chatRoleService.haveAccesses(chatId, userExecutorId, ChatRoleAccessFlags.CHANGE_CHAT_INFO)) {
            throw new DoesNotHaveAccessException("User not have access");
        }

        Claims originalClaim =
                fileJWTService.verifyUserCreatedAndGetClaims(updateAvatarDTO.originalAvatarToken(), userExecutorId);
        boolean originalAvatarValid = verifyAvatarToken(
                originalClaim,
                Set.of("jpg", "jpeg", "png"),
                null
        );
        if (!originalAvatarValid) {
            throw new InvalidFileToken("Invalid original avatar token");
        }

        Claims smallClaim =
                fileJWTService.verifyUserCreatedAndGetClaims(updateAvatarDTO.smallAvatarToken(), userExecutorId);
        boolean smallAvatarValid = verifyAvatarToken(
                smallClaim,
                Set.of("webp"),
                128
        );
        if (!smallAvatarValid) {
            throw new InvalidFileToken("Invalid small avatar token");
        }

        Claims largeClaim =
                fileJWTService.verifyUserCreatedAndGetClaims(updateAvatarDTO.largeAvatarToken(), userExecutorId);
        boolean largeAvatarValid = verifyAvatarToken(
                largeClaim,
                Set.of("webp"),
                512
        );
        if (!largeAvatarValid) {
            throw new InvalidFileToken("Invalid big avatar token");
        }

        Claims fullscreenClaim =
                fileJWTService.verifyUserCreatedAndGetClaims(updateAvatarDTO.largeAvatarToken(), userExecutorId);
        boolean fullscreenAvatarValid = verifyAvatarToken(
                largeClaim,
                Set.of("webp"),
                1280
        );
        if (!fullscreenAvatarValid) {
            throw new InvalidFileToken("Invalid big avatar token");
        }

        int modify = chatRepository.updateAvatar(chatId, new ModifyingAvatarDTO(
                        originalClaim.get("fileId", Long.class),
                        smallClaim.get("fileId", Long.class),
                        largeClaim.get("fileId", Long.class),
                        fullscreenClaim.get("fileId", Long.class)
                )
        );
        if (modify == 0) {
            throw new BadRequestException("Chat not found or the data does not differ for ID: " + chatId);
        }
        ChatEvent chatEvent = new ChatEvent();
        chatEvent.setChat(chatRepository.getReferenceById(chatId));
        chatEvent.setTimelineId(timelineService.getNextEventOrderId(chatId));
        chatEvent.setType(ChatEventType.EDIT_CHAT);
        kafkaProducerService.send(chatEventRepository.save(chatEvent));
    }

    @Transactional
    public void update(Long chatId, Long userExecutorId, UpdateChatDTO updateChatDTO) {
        if (!chatRoleService.haveAccesses(chatId, userExecutorId, ChatRoleAccessFlags.CHANGE_CHAT_INFO)) {
            throw new DoesNotHaveAccessException("User not have access");
        }

        log.info("updateChatDTO: " + updateChatDTO);

        int modify = chatRepository.update(chatId, updateChatDTO);
        if (modify == 0) {
            throw new BadRequestException("Chat not found or the data does not differ for ID: " + chatId);
        }
    }

    public Integer findVersionById(Long chatId) {
        return chatRepository.findVersionById(chatId);
    }

    public ChatMembersDTO getMemberCountAndIdsIfWithinLimit(long chatId, int limitForReturnIds) {
        ChatMembersDTO chatMembersDTO = new ChatMembersDTO();

        chatMembersDTO.setCountMembers(chatRepository.getMemberCount(chatId));

        if (chatMembersDTO.getCountMembers() <= limitForReturnIds) {
            chatMembersDTO.setMembersIds(chatRepository.getMemberIds(chatId));
        }

        return chatMembersDTO;
    }

    public int getCountMember(long chatId) {
        return chatRepository.getMemberCount(chatId);
    }

    public boolean isPublicChat(long chatId) {
        Boolean isPublic = chatRepository.isPublicChat(chatId);
        if (isPublic == null)
            throw new NotFoundEntityException("Chat not found for ID: " + chatId);
        return isPublic;
    }

    public void joinToChat(long chatId, long userId) {
        if (!isPublicChat(chatId)) {
            throw new BadRequestException("Chat is not public");
        }
        if (isUserInChat(chatId, userId)) {
            throw new ConflictException("user already in chat");
        }

        chatRepository.addUserToChat(chatId, userId);

        ChatEvent event = chatEventService.createJoinChatEvent(chatId, userId);

        kafkaProducerService.send(event);
    }

    public void exitChat(long chatId, long currentUserId) {
        int countModifying = chatRepository.removeUserFromChat(chatId, currentUserId);
        if (countModifying < 1) {
            throw new NotFoundEntityException("The user is not in the chat or chat not found for ID: " + chatId);
        }

        ChatEvent event = chatEventService.createLeaveChatEvent(chatId, currentUserId);

        kafkaProducerService.send(event);
    }

    public List<Long> getUserChatIds(Long userId) {
        return chatMemberRepository.findAllChatIdsByUserId(userId);
    }
}