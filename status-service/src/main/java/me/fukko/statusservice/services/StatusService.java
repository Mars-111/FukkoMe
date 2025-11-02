package me.fukko.statusservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class StatusService {

    private final RedisTemplate<String, String> redisTemplate;

    public Long getCountOnlineSessions(Long userId) {
        return redisTemplate.opsForSet().size(userId + ":sessions");
    }

    public Set<String> getOnlineSessions(Long userId) {
        return redisTemplate.opsForSet().members(userId + ":sessions");
    }

    public void setUserOnline(Long userId, String sessionId, boolean online) {
        String keySessions = userId + ":sessions";
        if (online) {
            redisTemplate.opsForSet().add(keySessions, sessionId);
        } else {
            String keyLastSeen = userId + ":lastSeen";
            redisTemplate.opsForSet().remove(keySessions, sessionId);
            redisTemplate.opsForValue().set(keyLastSeen, String.valueOf(Instant.now().toEpochMilli()));
        }
    }

    public void setLastSeen(Long userId, Instant lastSeen) {
        String key = userId + ":lastSeen";
        if (lastSeen != null) {
            redisTemplate.opsForValue().set(key, String.valueOf(lastSeen));
        } else {
            redisTemplate.delete(key);
        }
    }

    public Instant getLastSeen(Long userId) {
        String key = userId + ":lastSeen";
        String lastSeen = redisTemplate.opsForValue().get(key);
        if (lastSeen != null) {
            return Instant.ofEpochMilli(Long.parseLong(lastSeen));
        }
        return null;
    }


}
