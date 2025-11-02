package ru.kors.chatsservice.models.entity.deserializers;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.kors.chatsservice.models.entity.Chat;
import ru.kors.chatsservice.models.entity.ChatEvent;
import ru.kors.chatsservice.models.entity.enums.ChatEventType;
import ru.kors.chatsservice.models.entity.enums.ChatType;
import ru.kors.chatsservice.repositories.ChatRepository;
import ru.kors.chatsservice.services.ChatService;

import java.io.IOException;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class ChatEventDeserializer extends JsonDeserializer<ChatEvent> {

    private final ChatRepository chatRepository;

    @Override
    public ChatEvent deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JacksonException {
        ObjectMapper mapper = (ObjectMapper) jsonParser.getCodec();
        JsonNode node = mapper.readTree(jsonParser);

        ChatEvent chatEvent = new ChatEvent();

        if (node.has("id")) {
            chatEvent.setId(node.get("id").asLong());
        }

        if (node.has("timeline_id")) {
            chatEvent.setTimelineId(node.get("timeline_id").asInt());
        }

        if (node.has("type")) {
            chatEvent.setType(ChatEventType.fromString(node.get("type").asText()));
        }

        if (node.has("chat_id")) {
            Chat chat = chatRepository.getReferenceById(node.get("chat_id").asLong());
            chatEvent.setChat(chat);
        }
        if (node.has("data")) {
            chatEvent.setData(node.get("data"));
        }
        if (node.has("timestamp")) {
            chatEvent.setTimestamp(Instant.ofEpochMilli(node.get("timestamp").asLong()));
        }

        return chatEvent;
    }
}
