package ru.kors.timelineservice.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.kors.timelineservice.services.TimelineService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat/")
public class TimelineController {
    private final TimelineService timelineService;

    @GetMapping("/{chatId}/messages/next")
    public long getNextMessageOrderId(@PathVariable Long chatId) {
        return timelineService.getNextMessageTimelineId(chatId);
    }

    @GetMapping("/{chatId}/events/next")
    public long getNextEventOrderId(@PathVariable Long chatId) {
        return timelineService.getNextEventTimelineId(chatId);
    }
}