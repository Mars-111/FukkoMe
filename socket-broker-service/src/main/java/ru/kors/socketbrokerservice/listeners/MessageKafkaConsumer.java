package ru.kors.socketbrokerservice.listeners;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import ru.kors.socketbrokerservice.listeners.dto.UserProfileProjection;
import ru.kors.socketbrokerservice.models.entity.ChatEvent;
import ru.kors.socketbrokerservice.models.entity.Message;
import ru.kors.socketbrokerservice.services.SessionManager;
import ru.kors.socketbrokerservice.services.dto.OnlineStatusDTO;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class MessageKafkaConsumer {
    private final ObjectMapper objectMapper;
    private final SessionManager sessionManager;

    @KafkaListener(topics = "chat-messages")
    public void consumeMessage(@Payload String messageJson, Acknowledgment ack) throws JsonProcessingException {
        // Логирование полученного сообщения (для отладки)
        System.out.println("Получено сообщение: " + messageJson);
        // Преобразование JSON в объект Message
        Message message = objectMapper.readValue(messageJson, Message.class);

        sessionManager.sendMessage(message);

        ack.acknowledge(); //подтверждение обработки сообщения
    }

    @KafkaListener(topics = "chat-events")
    public void consumeChatEvent(@Payload String eventJson, Acknowledgment ack) throws JsonProcessingException {
        // Преобразование JSON в объект Message
        log.info("Получено событие: " + eventJson);
        ChatEvent event = objectMapper.readValue(eventJson, ChatEvent.class);
        // Логирование полученного сообщения (для отладки)
        System.out.println("Получено событие: " + eventJson);
        //TODO: изменить ChatEvent и реализовать sendChatEvent
        sessionManager.sendChatEvent(event);

        ack.acknowledge(); //подтверждение обработки сообщения
    }

    @KafkaListener(topics = "join-chat-users") // либо статичный groupId, либо каждому сервису свой редис + балансировщик нагрузки по пользователю
    public void consumeJoinChatUsers(@Payload String messageJson, Acknowledgment ack) throws JsonProcessingException {
        // Преобразование JSON в объект Message
        Map<String, Long> data = objectMapper.readValue(messageJson, new TypeReference<Map<String, Long>>() {});
        Long userId = data.get("user_id");
        Long chatId = data.get("chat_id");

        sessionManager.subscribeUserToChat(userId, "c:" + chatId);

        ack.acknowledge(); //подтверждение обработки сообщения
    }

    @KafkaListener(topics = "user-online-status")
    public void consumeOnlineStatus(String messageJson, Acknowledgment ack) throws JsonProcessingException {
        ack.acknowledge();
        OnlineStatusDTO status = objectMapper.readValue(messageJson, OnlineStatusDTO.class);

        sessionManager.send("u:" + status.userId(), messageJson);
    }

    @KafkaListener(topics = "user-updates")
    public void consumeUserUpdate(String messageJson, Acknowledgment ack) throws JsonProcessingException {
        ack.acknowledge();
        Map<String, Object> userData = objectMapper.readValue(messageJson, new TypeReference<>() {});

        String finalMessageJson = "{\"type\": \"user_update\", \"data\": " + messageJson + "}";
        sessionManager.send("u:" + userData.get("id"), finalMessageJson);
    }

//
//    @KafkaListener(topics = "chat-events")
//    public void consumeChatEvent(ChatEvent event) {
//        log.info("Getting new chat event: ", event);
//
//        messagingTemplate.convertAndSend("/chat/" + event.getChatId(), event); // + "/events"
//    }
//
//    @KafkaListener(topics = "user-events")
//    public void consumeUserEvent(UserEvent event) {
//        log.info("Getting new user event: ", event);
//
//        messagingTemplate.convertAndSend("/user/" + event.getUserId(), event);
//    }
//
//    @KafkaListener(topics = "personal-events")
//    public void consumePersonalEvent(UserEvent event) {
//        log.info("Getting new personal event: ", event);
//
//        messagingTemplate.convertAndSend("/personal/" + event.getUserId(), event);
//    }
//
//    @KafkaListener(topics = "test")
//    public void consumeTest(String message) {
//        System.out.println("Получено message: " + message);
//    }
}

