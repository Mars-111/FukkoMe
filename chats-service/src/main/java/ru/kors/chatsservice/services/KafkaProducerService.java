package ru.kors.chatsservice.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import ru.kors.chatsservice.models.entity.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {
    private final KafkaTemplate<Long, String> kafkaTemplate;
    private final ObjectMapper objectMapper;


    public void send(Message message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            log.info("Message sent to chat-messages: " + jsonMessage);
            kafkaTemplate.send("chat-messages", message.getChat().getId(), jsonMessage);
        } catch (Exception e) {
            log.error("Ошибка при отправке сообщения в Kafka", e);
        }
    }

    public void send(ChatEvent event) {
        try {
            String jsonEvent = objectMapper.writeValueAsString(event);
            kafkaTemplate.send("chat-events", event.getChat().getId(), jsonEvent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendTest(String topic, String message) {
        kafkaTemplate.send(topic, message);
    }

    public void sendCreateChat(Chat chat) {
        try {
            String jsonChat = objectMapper.writeValueAsString(chat);
            kafkaTemplate.send("new-chats", jsonChat);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendJoinChatUser(Long userId, Long chatId) {
        String data = "{\"user_id\": " + userId + ", \"chat_id\": " + chatId + "}";
        kafkaTemplate.send("join-chat-users", data);
    }
}
