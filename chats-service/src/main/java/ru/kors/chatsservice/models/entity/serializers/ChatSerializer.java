package ru.kors.chatsservice.models.entity.serializers;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import ru.kors.chatsservice.models.entity.Chat;

import java.io.IOException;

public class ChatSerializer extends JsonSerializer<Chat> {
    @Override
    public void serialize(Chat chat, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();
        gen.writeNumberField("id", chat.getId());
        gen.writeNumberField("version", chat.getVersion());
        gen.writeStringField("tag", chat.getTag());
        gen.writeStringField("name", chat.getName());
        gen.writeStringField("description", chat.getDescription());
        gen.writeStringField("type", chat.getType().name());
        gen.writeNumberField("owner_id", chat.getOwnerId());
        gen.writeNumberField("created_at", chat.getCreatedAt().toEpochMilli());
        gen.writeEndObject();
    }
}
