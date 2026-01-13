package ru.kors.chatsservice.models.entity.serializers;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import ru.kors.chatsservice.models.entity.ChatEvent;

import java.io.IOException;

public class ChatEventSerializer extends JsonSerializer<ChatEvent> {
    @Override
    public void serialize(ChatEvent chatEvent, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        jsonGenerator.writeStartObject();

        if (chatEvent.getId() != null) {
            jsonGenerator.writeNumberField("id", chatEvent.getId());
        }
        jsonGenerator.writeNumberField("timeline_id", chatEvent.getTimelineId());
        jsonGenerator.writeStringField("type", chatEvent.getType().name());
        jsonGenerator.writeNumberField("chat_id", chatEvent.getChat().getId());

        if (chatEvent.getData() != null) {
            jsonGenerator.writeFieldName("data");
            jsonGenerator.writeTree(chatEvent.getData());
        }

        jsonGenerator.writeEndObject();
    }
}
