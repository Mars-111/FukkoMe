package ru.kors.chatsservice.models.entity.serializers;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import ru.kors.chatsservice.models.entity.JoinRequest;

import java.io.IOException;

public class JoinRequestSerializer  extends JsonSerializer<JoinRequest> {
    @Override
    public void serialize(JoinRequest joinRequest, JsonGenerator gen, SerializerProvider serializerProvider) throws IOException {
        gen.writeStartObject();
        gen.writeNumberField("id", joinRequest.getId());
        gen.writeNumberField("user_id", joinRequest.getUserId());
        gen.writeNumberField("chat_id", joinRequest.getChat().getId());
        gen.writeNumberField("timestamp", joinRequest.getTimestamp().toEpochMilli());
        gen.writeEndObject();
    }
}
