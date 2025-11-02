package ru.kors.chatsservice.models.entity.serializers;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import ru.kors.chatsservice.models.entity.ChatRole;

import java.io.IOException;


public class ChatRoleSerializer extends JsonSerializer<ChatRole> {
    @Override
    public void serialize(ChatRole chatRole, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();
        gen.writeNumberField("id", chatRole.getId());
        gen.writeNumberField("chat_id", chatRole.getChat().getId());
        gen.writeStringField("name", chatRole.getName());
        gen.writeNumberField("version", chatRole.getVersion());
        gen.writeNumberField("rank", chatRole.getRank());
        gen.writeNumberField("access_flags", chatRole.getAccessFlags());
        gen.writeEndObject();
    }
}