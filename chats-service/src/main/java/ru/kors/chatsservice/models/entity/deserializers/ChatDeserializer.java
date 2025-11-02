package ru.kors.chatsservice.models.entity.deserializers;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import ru.kors.chatsservice.models.entity.Chat;
import ru.kors.chatsservice.models.entity.enums.ChatType;

import java.io.IOException;
import java.time.Instant;

@RequiredArgsConstructor
public class ChatDeserializer extends JsonDeserializer<Chat> {


    @Override
    public Chat deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JacksonException {
        JsonNode node = jsonParser.getCodec().readTree(jsonParser);

        Chat chat = new Chat();

        if (node.has("id")) {
            chat.setId(node.get("id").asLong());
        }

        if (node.has("version")) {
            chat.setVersion(node.get("version").asInt());
        }

        if (node.has("tag")) {
            chat.setTag(node.get("tag").asText());
        }

        if (node.has("name")) {
            chat.setName(node.get("name").asText());
        }

        if (node.has("description")) {
            chat.setDescription(node.get("description").asText());
        }

        if (node.has("type")) {
            chat.setType(ChatType.fromString(node.get("type").asText()));
        }

        if (node.has("owner_id")) {
            chat.setOwnerId(node.get("owner_id").asLong());
        }

        if (node.has("created_at")) {
            chat.setCreatedAt(Instant.ofEpochMilli(node.get("created_at").asLong()));
        }

        return chat;
    }
}
