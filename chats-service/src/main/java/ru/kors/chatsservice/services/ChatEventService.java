package ru.kors.chatsservice.services;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.kors.chatsservice.models.entity.ChatEvent;
import ru.kors.chatsservice.models.entity.enums.ChatEventType;
import ru.kors.chatsservice.repositories.ChatEventRepository;
import ru.kors.chatsservice.repositories.ChatRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatEventService {
    private final ChatEventRepository chatEventRepository;
    private final TimelineService timelineService;
    private final ChatRepository chatRepository;

    public ChatEvent save(ChatEvent chatEvent) {
        return chatEventRepository.save(chatEvent);
    }


    public List<ChatEvent> getEventsAfterTimeline(long chatId, Long afterTimelineId, Integer limit) {
        long timelineStart = afterTimelineId != null ? afterTimelineId : 0L;

        if (limit == null) {
            // вернуть ВСЕ события
            return chatEventRepository.findAfterTimeline(
                    chatId,
                    timelineStart
            );
        }

        if (limit <= 0 || limit > 1000) {
            throw new IllegalArgumentException("Invalid limit");
        }

        return chatEventRepository.findAfterTimelineWithLimit(
                chatId,
                timelineStart,
                limit
        );
    }

    public ChatEvent createJoinChatEvent(Long chatId, Long userId) {
        ChatEvent chatEvent = new ChatEvent();
        chatEvent.setType(ChatEventType.JOIN);
        chatEvent.setTimelineId(timelineService.getNextEventOrderId(chatId));
        chatEvent.setChat(chatRepository.getReferenceById(chatId));
        ObjectNode json = JsonNodeFactory.instance.objectNode();
        json.put("userId", userId);
        chatEvent.setData(json);

        return chatEventRepository.save(chatEvent);
    }

    public ChatEvent createLeaveChatEvent(Long chatId, Long userId) {
        ChatEvent chatEvent = new ChatEvent();
        chatEvent.setType(ChatEventType.LEAVE);
        chatEvent.setTimelineId(timelineService.getNextEventOrderId(chatId));
        chatEvent.setChat(chatRepository.getReferenceById(chatId));
        ObjectNode json = JsonNodeFactory.instance.objectNode();
        json.put("userId", userId);
        chatEvent.setData(json);

        return chatEventRepository.save(chatEvent);
    }
}
