package ru.kors.timelineservice.services;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import ru.kors.timelineservice.models.TimelineModel;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

@Service
@AllArgsConstructor
@Slf4j
public class TimelineService {

    private final JdbcTemplate jdbcTemplate;

    private final ConcurrentMap<Long, TimelineModel> chatMap = new ConcurrentHashMap<>();
    private final BlockingQueue<Long> saveQueue = new LinkedBlockingQueue<>();
    private final Set<Long> enqueuedChats = ConcurrentHashMap.newKeySet();

    private final ExecutorService saverExecutor = Executors.newSingleThreadExecutor(createThreadFactory("timeline-saver", true));
    private final ScheduledExecutorService scheduledSaver = Executors.newSingleThreadScheduledExecutor(createThreadFactory("timeline-scheduler", true));

    private static final int CHANGES_BEFORE_SAVE = 3;

    // Структура блокировок для безопасной инициализации chatMap
    private final ReentrantLock[] stripedLocks = new ReentrantLock[64];

    {
        for (int i = 0; i < stripedLocks.length; i++) {
            stripedLocks[i] = new ReentrantLock();
        }
    }

    private ReentrantLock getLock(Long chatId) {
        return stripedLocks[Math.abs(chatId.hashCode() % stripedLocks.length)];
    }

    @PostConstruct
    public void startSaver() {
        initDb();

        // Поток для обработки очереди на сохранение
        saverExecutor.submit(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    Long chatId = saveQueue.take();
                    enqueuedChats.remove(chatId);

                    TimelineModel timeline = chatMap.get(chatId);
                    if (timeline != null && timeline.getUnsavedChanges() > 0) {
                        saveToDb(chatId, timeline);
                        timeline.resetUnsavedChanges();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.info("Saver thread interrupted, terminating...");
                } catch (Exception e) {
                    log.error("Error in saver thread: {}", e.getMessage(), e);
                }
            }
        });

        // Периодическое сохранение всех timeline как страховка
        scheduledSaver.scheduleAtFixedRate(() -> {
            try {
                for (Map.Entry<Long, TimelineModel> entry : chatMap.entrySet()) {
                    Long chatId = entry.getKey();
                    TimelineModel timeline = entry.getValue();
                    if (timeline.getUnsavedChanges() > 0 && enqueuedChats.add(chatId)) {
                        saveQueue.offer(chatId);
                    }
                }
            } catch (Exception e) {
                log.error("Scheduled saver error: {}", e.getMessage(), e);
            }
        }, 5, 5, TimeUnit.MINUTES);
    }

    private void enqueueIfNeeded(long chatId, TimelineModel timeline) {
        if (timeline.getUnsavedChanges() >= CHANGES_BEFORE_SAVE && enqueuedChats.add(chatId)) {
            saveQueue.offer(chatId);
        }
    }

    public long getNextMessageTimelineId(long chatId) {
        TimelineModel timeline = getOrLoadTimeline(chatId);
        long nextId = timeline.incrementMessageTimelineAndGet();
        enqueueIfNeeded(chatId, timeline);
        return nextId;
    }

    public long getNextEventTimelineId(long chatId) {
        TimelineModel timeline = getOrLoadTimeline(chatId);
        long nextId = timeline.incrementEventTimelineAndGet();
        enqueueIfNeeded(chatId, timeline);
        return nextId;
    }

    private TimelineModel getOrLoadTimeline(long chatId) {
        TimelineModel timeline = chatMap.get(chatId);
        if (timeline == null) {
            ReentrantLock lock = getLock(chatId);
            lock.lock();
            try {
                timeline = chatMap.computeIfAbsent(chatId, this::loadFromDb);
            } finally {
                lock.unlock();
            }
        }
        return timeline;
    }

    private TimelineModel loadFromDb(Long chatId) {
        try {
            Map<String, Object> row = jdbcTemplate.queryForMap(
                    "SELECT message_timeline_id, event_timeline_id FROM chat_timeline WHERE chat_id = ?",
                    chatId
            );
            long msgId = row.get("message_timeline_id") != null ? ((Number) row.get("message_timeline_id")).longValue() : 0L;
            long evtId = row.get("event_timeline_id") != null ? ((Number) row.get("event_timeline_id")).longValue() : 0L;
            return new TimelineModel(msgId, evtId);
        } catch (EmptyResultDataAccessException e) {
            return new TimelineModel(0L, 0L);
        }
    }

    private void saveToDb(long chatId, TimelineModel timeline) {
        jdbcTemplate.update(
                "INSERT INTO chat_timeline (chat_id, message_timeline_id, event_timeline_id) VALUES (?, ?, ?) " +
                        "ON CONFLICT (chat_id) DO UPDATE SET message_timeline_id = EXCLUDED.message_timeline_id, event_timeline_id = EXCLUDED.event_timeline_id",
                chatId, timeline.getMessageTimelineId(), timeline.getEventTimelineId()
        );
    }

    private void initDb() {
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS chat_timeline (
                chat_id BIGINT PRIMARY KEY,
                message_timeline_id BIGINT NOT NULL,
                event_timeline_id BIGINT NOT NULL
            )
        """);
    }

    @PreDestroy
    public void shutdown() {
        log.info("Shutting down TimelineService...");
        try {
            flushAll(); // сначала сохраняем все изменения
            saverExecutor.shutdown();
            saverExecutor.awaitTermination(5, TimeUnit.SECONDS);
            scheduledSaver.shutdown();
            scheduledSaver.awaitTermination(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Error during shutdown: {}", e.getMessage(), e);
        } finally {
            saveQueue.clear();
            enqueuedChats.clear();
        }
        log.info("TimelineService shutdown complete.");
    }

    private void flushAll() {
        for (Map.Entry<Long, TimelineModel> entry : chatMap.entrySet()) {
            TimelineModel timeline = entry.getValue();
            if (timeline.getUnsavedChanges() > 0) {
                saveToDb(entry.getKey(), timeline);
                timeline.resetUnsavedChanges();
            }
        }
    }

    private static ThreadFactory createThreadFactory(String name, boolean daemon) {
        return r -> {
            Thread t = new Thread(r);
            t.setName(name);
            t.setDaemon(daemon);
            return t;
        };
    }
}
