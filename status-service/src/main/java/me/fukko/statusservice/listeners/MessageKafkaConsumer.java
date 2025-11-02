package me.fukko.statusservice.listeners;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.fukko.statusservice.listeners.dto.OnlineStatusDTO;
import me.fukko.statusservice.services.StatusService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class MessageKafkaConsumer {

    private final ObjectMapper objectMapper;
    private final StatusService statusService;

    //Убрать groupId ели нужно будет что бы каждый инстант сервиса обрабатывал все сообщения, а не делил их
    @KafkaListener(topics = "user-online-status", groupId = "write-to-redis")
    public void consumeOnlineStatus(String messageJson, Acknowledgment ack) throws JsonProcessingException {
        ack.acknowledge();
        // Логирование полученного сообщения (для отладки)
        log.info("Получено сообщение о статусе пользователя: {}", messageJson);

        OnlineStatusDTO status = objectMapper.readValue(messageJson, OnlineStatusDTO.class);

        if (!"status".equals(status.type())) {
            log.warn("Received message with unsupported type: {}", status.type());
            return;
        }

        statusService.setUserOnline(status.userId(), status.session(), status.online());
    }
}
