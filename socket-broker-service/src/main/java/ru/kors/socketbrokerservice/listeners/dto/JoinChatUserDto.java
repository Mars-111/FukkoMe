package ru.kors.socketbrokerservice.listeners.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class JoinChatUserDto {
    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("chat_id")
    private Long chatId;
    //Тут еще может быть тип, но пока в нем нет смысла тут
}
