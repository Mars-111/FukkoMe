package ru.kors.chatsservice.controllers.external;

import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.kors.chatsservice.controllers.external.dto.ChatMembersDTO;
import ru.kors.chatsservice.controllers.external.dto.UpdateAvatarDTO;
import ru.kors.chatsservice.controllers.external.utils.CurrentUserUtil;
import ru.kors.chatsservice.controllers.external.dto.CreateChatDTO;
import ru.kors.chatsservice.controllers.internal.dto.UpdateChatDTO;
import ru.kors.chatsservice.models.entity.Chat;
import ru.kors.chatsservice.models.entity.ChatEvent;
import ru.kors.chatsservice.models.entity.projection.ChatInfoProjection;
import ru.kors.chatsservice.models.entity.projection.ChatMemberInfo;
import ru.kors.chatsservice.repositories.ChatRepository;
import ru.kors.chatsservice.repositories.dto.ChatMembersPage;
import ru.kors.chatsservice.repositories.dto.UserRolePairProjection;
import ru.kors.chatsservice.services.*;
import ru.kors.chatsservice.utils.ChatMemberBinaryEncoder;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@Slf4j
public class ChatController  {

    private final ChatService chatService;
    private final JoinRequestService joinRequestService;
    private final CurrentUserUtil currentUserUtil;
    private final ChatRoleService chatRoleService;
    private final KafkaProducerService kafkaProducerService;
    private final ChatEventService chatEventService;

    @GetMapping("/{id}")
    public ResponseEntity<ChatInfoProjection> getChatById(@PathVariable Long id) {
        ChatInfoProjection chat = chatService.findById(id);
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/{id}/version")
    public ResponseEntity<Integer> getChatVersionById(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.findVersionById(id));
    }

    @GetMapping("/tag/{chatTag}")
    public ResponseEntity<ChatInfoProjection> getChatByTag(@PathVariable String chatTag) {
        ChatInfoProjection chat = chatService.findByTag(chatTag);
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/like/tag/{chatTag}")
    public ResponseEntity<List<ChatInfoProjection>> getAllLikedChatByTag(@PathVariable String chatTag, @PathParam("limit") Integer limit) {
        List<ChatInfoProjection> chats = chatService.findLikedTag(chatTag, limit);
        return ResponseEntity.ok(chats);
    }

    @GetMapping("/like/name/{name}")
    public ResponseEntity<List<ChatInfoProjection>> getAllLikedChatByName(@PathVariable String name, @PathParam("limit") Integer limit) {
        List<ChatInfoProjection> chats = chatService.findLikedName(name, limit);
        return ResponseEntity.ok(chats);
    }

    @PostMapping
    public ResponseEntity<ChatInfoProjection> createChat(@RequestBody CreateChatDTO chatDTO) {
        Long userId = currentUserUtil.getCurrentUserId();
        return ResponseEntity.ok(chatService.createChat(chatDTO, userId));
    }

    @GetMapping("/me/chats")
    public ResponseEntity<List<ChatInfoProjection>> getAllChatsByCurrentUser() {
        Long userId = currentUserUtil.getCurrentUserId();
        return ResponseEntity.ok(chatService.findAllByUserId(userId));
    }

    @PutMapping("/{chatId}/avatar")
    public ResponseEntity<ChatInfoProjection> updateChatAvatar(@PathVariable Long chatId, @RequestBody UpdateAvatarDTO dto) {
        chatService.updateAvatar(chatId, currentUserUtil.getCurrentUserId(), dto);
        return ResponseEntity.ok(chatService.findById(chatId));
    }

    @PutMapping("/{chatId}")
    public ResponseEntity<ChatInfoProjection> updateChat(@PathVariable Long chatId, @RequestBody UpdateChatDTO updateChatDTO) {
        chatService.update(chatId, currentUserUtil.getCurrentUserId(), updateChatDTO);
        ChatInfoProjection chat = chatService.findById(chatId);
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/{chatId}/members/count")
    public ResponseEntity<Integer> getMembers(@PathVariable Long chatId) {
        return ResponseEntity.ok(chatService.getCountMember(chatId));
    }

    @GetMapping("/{chatId}/members/top-ranked")
    public ResponseEntity<List<UserRolePairProjection>> getTopRankRoleMembers(@PathVariable Long chatId, @PathParam(value = "limit") Integer limit) {
        if (limit > 100) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        return ResponseEntity.ok(chatRoleService.getTopRankRoleMembers(chatId, limit));
    }

//    @GetMapping("/{chatId}/members")
//    public ResponseEntity<ChatMembersPage> getUserPages(@PathVariable Long chatId, @PathParam(value = "offset") Integer offset, @PathParam(value = "limit") Integer limit) {
//        if (limit > 1000) {
//            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
//        }
//        return ResponseEntity.ok(chatRoleService.getChatMembersByPages(chatId, offset, limit));
//    }

    @GetMapping("/{chatId}/members")
    public ResponseEntity<?> getAllUserIdsAndRoleIds(@PathVariable Long chatId, @RequestParam(value = "b", required = false) boolean binary) {
        List<ChatMemberInfo> list = chatRoleService.getUserIdsAndRolesByChatId(chatId);

        if (!binary) {
            // Обычный JSON
            return ResponseEntity.ok(list);
        }

        // Бинарный формат: [ [userId, roleId], ... ] → byte[]
        byte[] bytes = ChatMemberBinaryEncoder.encode(list);

        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }

    @PostMapping("/{chatId}/join")
    public ResponseEntity<Void> joinToChat(@PathVariable Long chatId) {
        chatService.joinToChat(chatId, currentUserUtil.getCurrentUserId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{chatId}/exit")
    public ResponseEntity<Void> exitChat(@PathVariable Long chatId) {
        chatService.exitChat(chatId, currentUserUtil.getCurrentUserId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{chatId}/events")
    public ResponseEntity<List<ChatEvent>> getChatEvents(@PathVariable Long chatId, @RequestParam(value = "afterTimelineId", required = false) Long afterTimelineId, @RequestParam(value = "limit", required = false) Integer limit) {
        if (chatId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.ok(chatEventService.getEventsAfterTimeline(chatId, afterTimelineId, limit));
    }



//    @GetMapping("/{chatId}/join-request")
//    public ResponseEntity<List<JoinRequest>> getAllJoinRequest(@PathVariable Long chatId) {
//        if (!chatService.isOwner(chatId, currentUserUtil.getCurrentUser().getId())) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//        }
//        return ResponseEntity.ok(joinRequestService.findByChatId(chatId));
//    }

//    @PostMapping("/{chatId}/join-request")
//    public ResponseEntity<JoinRequest> createRequest(@PathVariable Long chatId) {
//        User user = currentUserUtil.getCurrentUser();
//        Chat chat = chatService.findById(chatId);
//        JoinRequest request = joinRequestService.createJoinRequest(user, chat);
//
//        //TODO: Отправка уведомления о запросах на вступление владельцу чата
//         //personal event
//
//        return ResponseEntity.ok(request);
//    }
//
//    @PostMapping("/join-request/{requestId}")
//    public ResponseEntity<Void> acceptRequest(@PathVariable Long requestId) {
//        User user = currentUserUtil.getCurrentUser();
//        JoinRequest request = joinRequestService.findById(requestId);
//        if (chatService.isOwner(request.getChat().getId(), user.getId())) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//        }
//        joinRequestService.acceptJoinRequest(request);
//
//        //TODO: Отправка уведомления пользователю о принятии запроса
//
//        return ResponseEntity.ok().build();
//    }
//
//
//    @DeleteMapping("/join-request/{requestId}")
//    public ResponseEntity<Void> deleteRequest(@PathVariable Long requestId) {
//        JoinRequest request = joinRequestService.findById(requestId);
//        if (!chatService.isOwner(request.getChat().getId(), currentUserUtil.getCurrentUser().getId())) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//        }
//        joinRequestService.deleteById(requestId);
//        return ResponseEntity.noContent().build();
//    }
//
//    @DeleteMapping("/{chatId}")
//    public ResponseEntity<Void> deleteChat(@PathVariable Long chatId) {
//        if (!chatService.isOwner(chatId, currentUserUtil.getCurrentUser().getId())) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//        }
//        chatService.deleteChatIfCorrectOwnerId(chatId);
//        return ResponseEntity.noContent().build();
//    }
//
//    //TODO: прродолжить ниже
//
//    @PostMapping("/{chatId}/roles/{userId}")
//    public ResponseEntity<Void> assignRole(
//            @PathVariable Long chatId,
//            @PathVariable Long userId,
//            @RequestParam String role) {
//        chatRoleService.assignRole(chatId, userId, role, currentUserUtil.getCurrentUser().getId());
//        return ResponseEntity.ok().build();
//    }
//
//    @GetMapping("/{chatId}/roles/{userId}")
//    public ResponseEntity<List<ChatRole>> getRoles(
//            @PathVariable Long chatId,
//            @PathVariable Long userId) {
//        List<ChatRole> roles = chatRoleService.getUserRoles(chatId, userId);
//        return ResponseEntity.ok(roles);
//    }
//
//    @DeleteMapping("/{chatId}/roles/{userId}")
//    public ResponseEntity<Void> unassignRole(
//            @PathVariable Long chatId,
//            @PathVariable Long userId,
//            @RequestParam String role) {
//        chatRoleService.unassignRole(chatId, userId, role, currentUserUtil.getCurrentUser().getId());
//        return ResponseEntity.ok().build();
//    }

}
