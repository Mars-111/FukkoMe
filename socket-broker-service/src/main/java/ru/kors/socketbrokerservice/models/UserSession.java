package ru.kors.socketbrokerservice.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Setter
public final class UserSession {
    private final Long userId;
    private final WebSocketSession session;
    private final Set<String> subscriptions;
    private volatile long lastPongTime;

    public UserSession(Long userId, WebSocketSession session) {
        this.userId = userId;
        this.session = session;
        this.subscriptions = ConcurrentHashMap.newKeySet();
        this.lastPongTime = System.currentTimeMillis();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserSession)) return false;
        UserSession that = (UserSession) o;
        return session.getId().equals(that.getSession().getId());
    }

    @Override
    public int hashCode() {
        return session.getId().hashCode();
    }

    @Override
    public String toString() {
        return "UserSession[" +
                "userId=" + userId + ", " +
                "session=" + session + ", " +
                "subscriptions=" + subscriptions + ", " +
                "lastActive=" + lastPongTime + ']';
    }

    public void updateLastPongTime() {
        this.lastPongTime = System.currentTimeMillis(); // секундами
    }
}
