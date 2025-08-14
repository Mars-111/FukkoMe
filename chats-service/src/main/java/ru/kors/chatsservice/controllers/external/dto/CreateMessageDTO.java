package ru.kors.chatsservice.controllers.external.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record CreateMessageDTO(
        String type,
        String content,
        @JsonProperty("chat_id")
        Long chatId,
        @JsonProperty("file_tokens")
        List<String> fileTokens,
        @JsonProperty("reply_to")
        Long replyToId,
        @JsonProperty("forwarded_from")
        Long forwardedFromId,
        @JsonProperty("flags")
        Integer flags
        )
{
}
