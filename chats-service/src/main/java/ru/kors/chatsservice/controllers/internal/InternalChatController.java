//package ru.kors.chatsservice.controllers.internal;
//
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import ru.kors.chatsservice.controllers.internal.dto.ChangeChatDTO;
//import ru.kors.chatsservice.models.entity.Chat;
//import ru.kors.chatsservice.models.entity.ChatRole;
//import ru.kors.chatsservice.models.entity.JoinRequest;
//import ru.kors.chatsservice.services.ChatRoleService;
//import ru.kors.chatsservice.services.ChatService;
//import ru.kors.chatsservice.services.JoinRequestService;
//
//import java.util.List;
//
//@RestController("internalChatController")
//@RequestMapping("/internal/api/chats")
//@RequiredArgsConstructor
//@Slf4j
//public class InternalChatController {
//
//    private final ChatService chatService;
//    private final JoinRequestService joinRequestService;
//    private final ChatRoleService chatRoleService;
//
//    @GetMapping
//    public List<Chat> getAllChats() {
//        return chatService.findAll();
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Chat> getChatById(@PathVariable Long id) {
//        Chat chat = chatService.findById(id);
//        if (chat == null) {
//            return ResponseEntity.notFound().build();
//        }
//        return ResponseEntity.ok(chat);
//    }
//
//    @GetMapping("/tag/{chatTag}")
//    public ResponseEntity<Chat> getChatByTag(@PathVariable String chatTag) {
//        Chat chat = chatService.findByTag(chatTag);
//        if (chat == null) {
//            return ResponseEntity.notFound().build();
//        }
//        return ResponseEntity.ok(chat);
//    }
//
//    @GetMapping("/name/{name}")
//    public ResponseEntity<List<Chat>> getAllChatByName(@PathVariable String name) {
//        List<Chat> chat = chatService.findAllByName(name);
//        if (chat == null) {
//            return ResponseEntity.notFound().build();
//        }
//        return ResponseEntity.ok(chat);
//    }
//
//    @PostMapping
//    public Chat createChat(@RequestBody Chat chat) {
//        //TODO: переделать
//        return chatService.saveChat(chat);
//    } //Перенес в ChatController
//
////    @PutMapping("/{id}")
////    public Chat updateChat(@PathVariable Long id, @RequestBody ChangeChatDTO changeChatDTO) {
////        return chatService.changeChat(id, changeChatDTO);
////    }
//
//    @GetMapping("/{chatId}/roles/{userId}")
//    public ResponseEntity<List<ChatRole>> getRoles(
//            @PathVariable Long chatId,
//            @PathVariable Long userId) {
//        List<ChatRole> roles = chatRoleService.getUserRoles(chatId, userId);
//        return ResponseEntity.ok(roles);
//    }
//
//    @GetMapping("/{chatId}/join-request")
//    public ResponseEntity<List<JoinRequest>> getAllJoinRequest(@PathVariable Long chatId) {
//        return ResponseEntity.ok(joinRequestService.findByChatId(chatId));
//    }
//
//    @DeleteMapping("/join-request/{requestId}")
//    public ResponseEntity<Void> deleteRequest(@PathVariable Long requestId) {
//        joinRequestService.deleteById(requestId);
//        return ResponseEntity.noContent().build();
//    }
//}