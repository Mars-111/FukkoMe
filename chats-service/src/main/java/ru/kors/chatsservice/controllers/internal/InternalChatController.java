package ru.kors.chatsservice.controllers.internal;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.kors.chatsservice.services.ChatService;
import ru.kors.chatsservice.services.JoinRequestService;

import java.util.List;

@RestController("internalChatController")
@RequestMapping("/internal/api/chats")
@RequiredArgsConstructor
@Slf4j
public class InternalChatController {

    private final ChatService chatService;
    private final JoinRequestService joinRequestService;


    //TODO: Сделать защиту
    @GetMapping("/user-chats/{userId}/ids")
    public ResponseEntity<List<Long>> getUserChatIds(
            @PathVariable Long userId) {
        List<Long> chatIds = chatService.getUserChatIds(userId);
        return ResponseEntity.ok(chatIds);
    }
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
}