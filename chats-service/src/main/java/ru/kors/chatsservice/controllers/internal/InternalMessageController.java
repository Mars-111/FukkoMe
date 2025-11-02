//package ru.kors.chatsservice.controllers.internal;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import ru.kors.chatsservice.models.entity.Message;
//import ru.kors.chatsservice.services.MessageService;
//
//import java.util.List;
//import java.util.Set;
//
//@RestController
//@RequestMapping("/internal/api/messages")
//@RequiredArgsConstructor
//public class InternalMessageController {
//
//    private final MessageService messageService;
//
//    @GetMapping
//    public List<Message> getAllMessages() {
//        return messageService.findAll();
//    }
//
//    @GetMapping("/{messageId}")
//    public ResponseEntity<Message> getMessageById(@PathVariable Long messageId) {
//        Message message = messageService.findById(messageId);
//        if (message == null) {
//            return ResponseEntity.notFound().build();
//        }
//        return ResponseEntity.ok(message);
//    }
//
//    @GetMapping("/chat/{chatId}")
//    public ResponseEntity<Set<Message>> getMessagesByChatId(@PathVariable Long chatId) {
//        Set<Message> messages = messageService.findAllByChatId(chatId);
//        return ResponseEntity.ok(messages);
//    }
//
//    /**
//     * Example JSON payload:
//     * {
//     *   "chatId": 1,
//     *   "senderId": 1,
//     *   "content": "11",
//     *   "type": "CHAT"
//     * }
//     */
////    @PostMapping
////    public ResponseEntity<Message> createMessage(@RequestBody Message messagePayload) {
////        Message message = messageService.createMessage(messagePayload);
////        //message.setSender(userService.findById(message.getSender().getId())); //Зачем??? Лан пока оставим, мб я тупой?
////        return ResponseEntity.ok(message);
////    }
//
//    @DeleteMapping("/{messageId}")
//    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId) {
//        messageService.deleteMessage(messageId);
//        return ResponseEntity.noContent().build();
//    }
//}