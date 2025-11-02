package ru.kors.socketbrokerservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import ru.kors.socketbrokerservice.models.UserSession;
import ru.kors.socketbrokerservice.services.SessionManager;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessageHandler {

    private final SessionManager sessionManager;

    public void handleMessage(WebSocketSession session, TextMessage message) {
        String messagePayload = message.getPayload();
        if (messagePayload.isEmpty()) return;
        UserSession userSession = sessionManager.getSessionById(session.getId());

        switch (messagePayload.charAt(0)) {
            case 'S': //Local subscription
                sessionManager.localSubscribe(messagePayload.substring(1), userSession);
                log.info("User {} subscribed to {}", userSession.getUserId(), messagePayload.substring(1));
                log.info("User subscriptions: {}", userSession.getSubscriptions());
                break;
            case 'U': //К примеру U12 -> отписываемся от 12
                sessionManager.unLocalSubscribe(messagePayload.substring(1), userSession);
                log.info("User {} unsubscribed from {}", userSession.getUserId(), messagePayload.substring(1));
                break; //UnSub
            default:
                log.warn("Unknown message type: {}", messagePayload);
        }
    }

}
