package ru.kors.timelineservice.models;

import java.util.concurrent.atomic.AtomicLong;

public class TimelineModel {
    private final AtomicLong messageTimelineId;
    private final AtomicLong eventTimelineId;
    private final AtomicLong unsavedChanges = new AtomicLong(0);

    public TimelineModel(long initialMessageTimelineId, long initialEventTimelineId) {
        this.messageTimelineId = new AtomicLong(initialMessageTimelineId);
        this.eventTimelineId = new AtomicLong(initialEventTimelineId);
    }

    public long incrementMessageTimelineAndGet() {
        unsavedChanges.incrementAndGet();
        return messageTimelineId.incrementAndGet();
    }

    public long incrementEventTimelineAndGet() {
        unsavedChanges.incrementAndGet();
        return eventTimelineId.incrementAndGet();
    }

    public long getMessageTimelineId() {
        return messageTimelineId.get();
    }

    public long getEventTimelineId() {
        return eventTimelineId.get();
    }

    public long getUnsavedChanges() {
        return unsavedChanges.get();
    }

    public void resetUnsavedChanges() {
        unsavedChanges.set(0);
    }
}
