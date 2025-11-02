package ru.kors.chatsservice.models.entity.serializers;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import ru.kors.chatsservice.models.entity.Message;

import java.io.IOException;

public class MessageSerializer extends JsonSerializer<Message> {

    @Override
    public void serialize(Message message, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();
        writeMessage(gen, message, true);
        gen.writeEndObject();
    }

    private void writeMessage(JsonGenerator gen, Message message, boolean nested) throws IOException {
        gen.writeStartObject();
        gen.writeNumberField("id", message.getId());
        gen.writeNumberField("timeline_id", message.getTimelineId());
        gen.writeNumberField("flags", message.getFlags());
        gen.writeNumberField("chat_id", message.getChat().getId());
        gen.writeNumberField("sender_id", message.getSenderId());

        if (message.getContent() != null) {
            gen.writeStringField("content", message.getContent());
        }

        writeReplyOrForward(gen, "reply_to", message.getReplyTo(), nested);
        writeReplyOrForward(gen, "forwarded_from", message.getForwardedFrom(), nested);

        if (message.getFileList() != null && !message.getFileList().isEmpty()) {
            gen.writeArrayFieldStart("files");
            for (var file : message.getFileList()) {
                gen.writeObject(file);
            }
            gen.writeEndArray();
        }
        gen.writeNumberField("timestamp", message.getTimestamp().toEpochMilli());
        gen.writeEndObject();
    }

    private void writeReplyOrForward(JsonGenerator gen, String fieldName, Message nestedMessage, boolean parentIsNested) throws IOException {
        if (nestedMessage == null) return;

        if (!parentIsNested) {
            gen.writeObjectFieldStart(fieldName);
            writeMessage(gen, nestedMessage, false);
            gen.writeEndObject();
        } else {
            gen.writeNumberField(fieldName + "_id", nestedMessage.getId());
        }
    }
}
