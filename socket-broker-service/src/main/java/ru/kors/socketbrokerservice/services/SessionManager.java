package ru.kors.socketbrokerservice.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import ru.kors.socketbrokerservice.api.UsersRestApi;
import ru.kors.socketbrokerservice.models.UserSession;
import ru.kors.socketbrokerservice.models.entity.ChatEvent;
import ru.kors.socketbrokerservice.models.entity.Message;

import java.io.IOException;
import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class SessionManager {
    private final KafkaProducerService kafkaProducerService;
    private final JwtDecoder jwtDecoder;
    @Value("${server.id}")
    private String serverId;

    private static final Duration TTLChats = Duration.ofMinutes(48*60);
    private static final Duration TTLFetch = Duration.ofMinutes(48*60-1);

    private final ObjectMapper objectMapper;

    //Rest
    private final UsersRestApi usersRestApi;

    //Redis
    private final RedisTemplate<String, Long> longRedisTemplate;
    private final RedisTemplate<String, String> stringRedisTemplate;

    // Индекс сессий по userId: позволяет быстро получить все сессии для конкретного пользователя.
    private final ConcurrentMap<Long, Set<UserSession>> sessionsByUser = new ConcurrentHashMap<>();

    // Индекс сессий по sessionId: ключ – sessionId, значение – набор UserSession (обычно один объект, но оставляем Set для гибкости).
    private final ConcurrentMap<String, UserSession> sessionsById = new ConcurrentHashMap<>();

    // Индекс подписок: ключ – подписка (например, "chat:17"), значение – набор UserSession,
    // подписанных на данное событие.
    private final ConcurrentMap<String, Set<UserSession>> subscribedSessions = new ConcurrentHashMap<>();


    // serializers reused in pipelines
    private final RedisSerializer<String> STRING_SER = new StringRedisSerializer();
    private RedisSerializer<Long>   LONG_SER; //Инициализируется в PostConstruct, ибо longRedisTemplate будет null во время инициализации

    @PostConstruct
    public void init() {
        LONG_SER = (RedisSerializer<Long>) longRedisTemplate.getValueSerializer();
    }

    public void registerSession(WebSocketSession session) {
        log.info("Registering session {}", session.getId());
        Long userId = getUserId(session);

        if (userId == null) {
            closeBadSession(session);
            return;
        }

        // 1) register in‑memory
        UserSession userSession = new UserSession(userId, session);
        sessionsById.put(session.getId(), userSession);
        sessionsByUser.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(userSession);
        addSessionInRedis(getUserSessionsKey(userId), session.getId());

        log.info("1");
        Set<Long> chatIds = new HashSet<>(); // Список чатов, на которые подписан пользователь
        boolean alreadyFetched = Boolean.TRUE.equals(stringRedisTemplate.hasKey(getChatFetchedKey(userId)));
        log.info("2");

        if (!alreadyFetched) {
            chatIds = usersRestApi.getUserChatsIds(userId);
            log.debug("Fetched {} chats for user {}", chatIds.size(), userId);
            log.info("3");
            rewriteUserChatsInRedis(getUserChatsKey(userId), getChatFetchedKey(userId), chatIds);
            log.info("4");
        }
        else {
            chatIds = fetchUserChatsFromRedis(getUserChatsKey(userId));
        }
        log.info("5");
        //

        log.info("user {} chats: {}", userId, chatIds);

        // Добавляем подписку на все чаты, на которые подписан пользователь

        subscribeSessionToChats(userSession, chatIds);

        log.debug("Registered session {} for user {}", session.getId(), userId);

        kafkaProducerService.sendOnlineStatus(userSession.getUserId(), session.getId(), true);
    }

    private String getUserChatsKey(Long userId) {
        return "u:" + userId + ":c";
    }

    private String getUserSessionsKey(Long userId) {
        return "u:" + userId + ":sess";
    }

    private String getChatFetchedKey(Long userId) {
        return "u:" + userId + ":cf";
    }



    private void closeBadSession(WebSocketSession session) {
        log.warn("Не удалось получить userId из токена для сессии {}", session.getId());
        try {
            session.close(CloseStatus.BAD_DATA);
            unregisterSession(session.getId());
        }
        catch (Exception e) {
            log.error("Ошибка при закрытии сессии {}: {}", session.getId(), e.getMessage());
        }
    }

    private void rewriteUserChatsInRedis(String userChatsKey, String fetchedKey, Set<Long> chatIds) {
        // Lua-скрипт: удаляем старый Set, добавляем новый, устанавливаем TTL для обоих ключей
        String luaScript = """
            redis.call('DEL', KEYS[1])
            for i=1,#ARGV-2 do
                redis.call('SADD', KEYS[1], ARGV[i])
            end
            redis.call('SET', KEYS[2], "1")
            redis.call('EXPIRE', KEYS[1], tonumber(ARGV[#ARGV-1]))
            redis.call('EXPIRE', KEYS[2], tonumber(ARGV[#ARGV]))
            return 1
        """;

        // ARGV = [chatIds..., ttlChats, ttlFetch]
        String[] args = new String[chatIds.size() + 2];
        int i = 0;
        for (Long chatId : chatIds) {
            args[i++] = chatId.toString();
        }
        args[i++] = String.valueOf(TTLChats.getSeconds());
        args[i] = String.valueOf(TTLFetch.getSeconds());

        stringRedisTemplate.execute(
                new DefaultRedisScript<>(luaScript, Long.class),
                List.of(userChatsKey, fetchedKey),
                args
        );
    }

    private void addSessionInRedis(String userSessionsKey, String sessionId) {
        stringRedisTemplate.opsForSet().add(userSessionsKey, sessionId);
    }

    private void removeSessionFromRedis(String userSessionsKey, String sessionId) {
        stringRedisTemplate.opsForSet().remove(userSessionsKey, sessionId);
    }

    private Set<Long> fetchUserChatsFromRedis(String userChatsKey) {
        Set<Long> chatIds = longRedisTemplate.opsForSet().members(userChatsKey);
        return chatIds != null ? chatIds : new HashSet<>();
    }

    private void subscribeSessionToChats(UserSession userSession, Set<Long> chatIds) {
        userSession.getSubscriptions().addAll(chatIds.stream()
                .map(chatId -> "c:" + chatId.toString())
                .collect(Collectors.toSet()));
        for (Long chatId : chatIds) {
            subscribedSessions.computeIfAbsent("c:" + chatId, k -> ConcurrentHashMap.newKeySet())
                    .add(userSession);
        }
    }

    public void unregisterSession(String sessionId) {
        // Удаляем из userSessions.
        UserSession userSession = sessionsById.get(sessionId);
        if (userSession == null) {
            log.warn("Session {} not found for unregister", sessionId);
            return;
        }
        removeSessionFromRedis(getUserSessionsKey(userSession.getUserId()), sessionId);

        kafkaProducerService.sendOnlineStatus(userSession.getUserId(), userSession.getSession().getId(), false);
        sessionsById.remove(sessionId);
        sessionsByUser.computeIfPresent(userSession.getUserId(), (k, v) -> {
            v.remove(userSession);
            return v.isEmpty() ? null : v;
        });
        // Удаляем из подписок.
        for (String subscriptionKey : userSession.getSubscriptions()) {
            Set<UserSession> subSet = subscribedSessions.get(subscriptionKey);
            if (subSet != null) {
                subSet.remove(userSession);
                if (subSet.isEmpty()) {
                    subscribedSessions.remove(subscriptionKey);
                }
            }
        }

        log.debug("Unregistered session {} for user {}", sessionId, userSession.getUserId());
    }


    public void localSubscribe(String subscriptionKey, UserSession userSession) {
        if (userSession == null) {
            log.warn("Session {} not found for subscription {}", userSession.getSession().getId(), subscriptionKey);
            return;
        }
        if (userSession.getSubscriptions().contains(subscriptionKey.substring(1))) {
            log.warn("Session {} for user {} already subscribed to {}",
                    userSession.getSession().getId(), userSession.getUserId(), subscriptionKey);
            return;
        }
        userSession.getSubscriptions().add(subscriptionKey); //extended
        // Добавляем сессию в глобальный индекс подписок.
        subscribedSessions.computeIfAbsent(subscriptionKey, k -> ConcurrentHashMap.newKeySet())
                .add(userSession);
    }

    /**
     * Отписывает сессию от указанного подписочного ключа.
     *
     * @param subscriptionKey подписочный ключ
     * @param userSession     сессия пользователя
     */
    public void unLocalSubscribe(String subscriptionKey, UserSession userSession) {
        if (userSession == null) return;

        userSession.getSubscriptions().remove(subscriptionKey);

        Set<UserSession> subs = subscribedSessions.get(subscriptionKey);
        if (subs != null) {
            subs.remove(userSession);
            log.debug("Session {} for user {} unsubscribed from {}",
                    userSession.getSession().getId(), userSession.getUserId(), subscriptionKey);
        } else {
            log.warn("Tried to unsubscribe from non-existent key: {}", subscriptionKey);
        }
    }


    /**
     * Возвращает все сессии для указанного пользователя.
     *
     * @param userId идентификатор пользователя.
     * @return множество UserSession
     */
    public Set<UserSession> getSessionsByUserId(Long userId) {
        return sessionsByUser.getOrDefault(userId, ConcurrentHashMap.newKeySet());
    }

    /**
     * Возвращает сессию по sessionId.
     *
     * @param sessionId идентификатор сессии.
     * @return UserSession
     */
    public UserSession getSessionById(String sessionId) {
        return sessionsById.getOrDefault(sessionId, null);
    }

    /**
     * Возвращает всех подписчиков по заданному подписочному ключу.
     *
     * @param subscriptionKey подписочный ключ (например, "chat:17")
     * @return множество UserSession
     */
    public Set<UserSession> getSubscribers(String subscriptionKey) {
        return subscribedSessions.getOrDefault(subscriptionKey, ConcurrentHashMap.newKeySet());
    }

    public Set<UserSession> getSessions() {
        return new HashSet<>(sessionsById.values());
    }


    private String getToken(WebSocketSession session) {
        String query = session.getUri().getQuery(); // "token=abc123"
        String token = null;

        if (query != null) {
            for (String param : query.split("&")) {
                String[] pair = param.split("=");
                if (pair.length == 2 && pair[0].equals("token")) {
                    token = pair[1];
                    break;
                }
            }
        }
        log.info("Token from session {}: {}", session.getId(), token);
        return token;
    }

    private Long getUserId(WebSocketSession session) {
        try {
            var jwt = jwtDecoder.decode(getToken(session));
            return (Long) jwt.getClaim("userId");
        } catch (JwtException e) {
            throw new RuntimeException("Ошибка при разборе токена", e);
        }
    }

    public void send(String topic, String message) {
        var users = subscribedSessions.get(topic);
        if (users == null || users.isEmpty()) {
            log.warn("No subscribers for topic {}", topic);
            return;
        }
        for (UserSession userSession : users) {
            WebSocketSession session = userSession.getSession();
            if (session.isOpen()) {
                log.info("sending {} to {}", message, userSession.getUserId());
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    log.error("Error sending message to session {}: {}", session.getId(), e.getMessage());
                }
            }
        }
    }

    public void sendMessage(Message message) {
        var users = subscribedSessions.get("c:" + message.getChatId());
        log.info("sessions in chats: {}", subscribedSessions.get("c:" + message.getChatId()));
        if (users == null || users.isEmpty()) {
            log.warn("No subscribers for chat {}", message.getChatId());
            return;
        }
        log.info("user size: {}", users.size());
        for (UserSession userSession : users) {
            WebSocketSession session = userSession.getSession();
            if (session.isOpen()) {
                log.info("sending message to {}", userSession.getUserId());
                try {
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
                } catch (IOException e) {
                    log.error("Error sending message to session {}: {}", session.getId(), e.getMessage());
                }
            }
        }
    }

    public void sendChatEvent(ChatEvent event) {
        var users = subscribedSessions.get("c:" + event.getChatId());
        if (users == null || users.isEmpty()) {
            log.warn("No subscribers for chat {}", event.getChatId());
            return;
        }
        log.info("user size: {}", users.size());
        for (UserSession userSession : users) {
            WebSocketSession session = userSession.getSession();
            if (session.isOpen()) {
                log.info("sending event to {}", userSession.getUserId());
                try {
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(event)));
                } catch (IOException e) {
                    log.error("Error sending event to session {}: {}", session.getId(), e.getMessage());
                }
            }
        }
    }

    public void subscribeUserToChat(Long userId, String subscriptionKey) {
        if (!sessionsByUser.containsKey(userId)) {
            log.warn("No sessions found for user {}", userId);
            return;
        }
        longRedisTemplate.opsForSet().add(getUserChatsKey(userId), Long.valueOf(subscriptionKey.split(":")[1]));


        for (UserSession userSession : sessionsByUser.get(userId)) {
            userSession.getSubscriptions().add(subscriptionKey);
            subscribedSessions.computeIfAbsent(subscriptionKey, k -> ConcurrentHashMap.newKeySet())
                    .add(userSession);
        }
    }

}
