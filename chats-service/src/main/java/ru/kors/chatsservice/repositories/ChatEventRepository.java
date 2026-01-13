package ru.kors.chatsservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.kors.chatsservice.models.entity.ChatEvent;

import java.util.List;

public interface ChatEventRepository extends JpaRepository<ChatEvent, Long> {

    // 🔹 С лимитом
    @Query(
            value = """
            SELECT *
            FROM chats_events
            WHERE chat_id = :chatId
              AND event_timeline_id > :afterTimelineId
            ORDER BY event_timeline_id ASC
            LIMIT :limit
        """,
            nativeQuery = true
    )
    List<ChatEvent> findAfterTimelineWithLimit(
            @Param("chatId") Long chatId,
            @Param("afterTimelineId") Long afterTimelineId,
            @Param("limit") int limit
    );

    // 🔹 Без лимита (ВСЕ события)
    @Query(
            value = """
            SELECT *
            FROM chats_events
            WHERE chat_id = :chatId
              AND event_timeline_id > :afterTimelineId
            ORDER BY event_timeline_id ASC
        """,
            nativeQuery = true
    )
    List<ChatEvent> findAfterTimeline(
            @Param("chatId") Long chatId,
            @Param("afterTimelineId") Long afterTimelineId
    );
}
