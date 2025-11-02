package org.example.identityservice.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.identityservice.models.entity.projection.UserProfileProjection;
import org.example.identityservice.utils.JsonUtils;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendUserUpdates(Long userId, UserProfileProjection user) {
        kafkaTemplate.send("user-updates", userId.toString(), JsonUtils.toNotNullJson(user));
    }


}
