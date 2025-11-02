package ru.kors.chatsservice.models.entity.deserializers;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import ru.kors.chatsservice.models.entity.JoinRequest;
import ru.kors.chatsservice.repositories.ChatRepository;
import java.io.IOException;
import java.time.Instant;

@RequiredArgsConstructor
public class JoinRequestDeserializer extends JsonDeserializer<JoinRequest> {
    private final ChatRepository chatRepository;

    @Override
    public JoinRequest deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JacksonException {
        JsonNode node = jsonParser.getCodec().readTree(jsonParser);

        JoinRequest joinRequest = new JoinRequest();

        if (node.has("id")) {
            joinRequest.setId(node.get("id").asLong());
        }

        if (node.has("user_id")) {
            joinRequest.setUserId(node.get("user_id").asLong());
        }

        if (node.has("chat_id")) {
            joinRequest.setChat(chatRepository.getReferenceById(node.get("chat_id").asLong()));
        }

        if (node.has("timestamp")) {
            joinRequest.setTimestamp(Instant.ofEpochMilli(node.get("timestamp").asLong()));
        }

        return joinRequest;
    }
}
