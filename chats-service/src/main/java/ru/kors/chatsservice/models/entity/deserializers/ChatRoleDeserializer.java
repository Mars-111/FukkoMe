package ru.kors.chatsservice.models.entity.deserializers;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import ru.kors.chatsservice.models.entity.Chat;
import ru.kors.chatsservice.models.entity.ChatRole;
import ru.kors.chatsservice.repositories.ChatRepository;

import java.io.IOException;

@RequiredArgsConstructor
public class ChatRoleDeserializer extends JsonDeserializer<ChatRole> {
    private final ChatRepository chatRepository;

    @Override
    public ChatRole deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JacksonException {
        JsonNode node = jsonParser.getCodec().readTree(jsonParser);

        ChatRole chatRole = new ChatRole();

        if (node.has("id")) {
            chatRole.setId(node.get("id").asLong());
        }

        if (node.has("chat_id")) {
            Chat chat = chatRepository.getReferenceById(node.get("chat_id").asLong());
            chatRole.setChat(chat);
        }

        if (node.has("name")) {
            chatRole.setName(node.get("name").asText());
        }

        if (node.has("version")) {
            chatRole.setVersion(node.get("version").asInt());
        }

        if (node.has("rank")) {
            chatRole.setRank(node.get("rank").asInt());
        }

        if (node.has("access_flags")) {
            chatRole.setAccessFlags(node.get("access_flags").asLong());
        }

        return chatRole;
    }
}
