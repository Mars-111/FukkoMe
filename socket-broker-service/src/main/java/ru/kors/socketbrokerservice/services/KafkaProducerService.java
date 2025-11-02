package ru.kors.socketbrokerservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import ru.kors.socketbrokerservice.services.dto.OnlineStatusDTO;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {
    private final KafkaTemplate<String, String> kafkaTemplate;


    public void sendOnlineStatus(Long userId, String session, boolean online) {
        kafkaTemplate.send("user-online-status", userId.toString(),
                "{\"type\": \"status\", \"userId\": " + userId + ", \"session\": \"" + session + "\", \"online\": " + online + "}");
    }
}
