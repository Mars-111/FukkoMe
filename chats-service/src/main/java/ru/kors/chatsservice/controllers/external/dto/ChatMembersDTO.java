package ru.kors.chatsservice.controllers.external.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ChatMembersDTO {
    @JsonProperty(value = "count")
    int countMembers;
    List<Long> membersIds;
}