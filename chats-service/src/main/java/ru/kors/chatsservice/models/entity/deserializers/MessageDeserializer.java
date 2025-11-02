package ru.kors.chatsservice.models.entity.deserializers;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.*;
import lombok.RequiredArgsConstructor;
import ru.kors.chatsservice.models.entity.FileMetadata;
import ru.kors.chatsservice.models.entity.Message;
import ru.kors.chatsservice.repositories.ChatRepository;
import ru.kors.chatsservice.repositories.MessageRepository;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class MessageDeserializer extends JsonDeserializer<Message> {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public Message deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        return readMessage(node);
    }

    private Message readMessage(JsonNode node) throws IOException {
        Message message = new Message();

        if (node.has("id")) {
            message.setId(node.get("id").asLong());
        }
        if (node.has("timeline_id")) {
            message.setTimelineId(node.get("timeline_id").asInt());
        }
        if (node.has("flags")) {
            message.setFlags(node.get("flags").asInt());
        }

        if (node.has("chat_id")) {
            message.setChat(chatRepository.getReferenceById(node.get("chat_id").asLong()));
        }

        if (node.has("sender_id")) {
            message.setSenderId(node.get("sender_id").asLong());
        }

        if (node.has("content")) {
            message.setContent(node.get("content").asText());
        }

        if (node.has("timestamp")) {
            message.setTimestamp(Instant.ofEpochMilli(node.get("timestamp").asLong()));
        }

        // reply_to
        if (node.has("reply_to")) {
            JsonNode replyNode = node.get("reply_to");
            message.setReplyTo(readMessage(replyNode));
        } //else if (node.has("reply_to_id")) {
//            message.setReplyTo(messageRepository.getReferenceById(node.get("reply_to_id").asLong()));
//        }

        // forwarded_from
        if (node.has("forwarded_from")) {
            JsonNode forwardedNode = node.get("forwarded_from");
            message.setForwardedFrom(readMessage(forwardedNode));
        } //else if (node.has("forwarded_from_id")) {
//            message.setForwardedFrom(messageRepository.getReferenceById(node.get("forwarded_from_id").asLong()));
//        }

        // files
        if (node.has("files") && node.get("files").isArray()) {
            List<FileMetadata> files = new ArrayList<>();
            for (JsonNode fileNode : node.get("files")) {
                FileMetadata file = mapper.treeToValue(fileNode, FileMetadata.class);
                files.add(file);
            }
            message.setFileList(files);
        }

        return message;
    }
}
