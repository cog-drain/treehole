package com.treehole.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket 服务端 (支持用户定向推送)
 */
@ServerEndpoint("/ws/treehole/{userId}")
@Component
@Slf4j
public class WebSocketServer {
    
    // 用户 ID -> Session 的映射
    private static final Map<String, Session> USER_SESSIONS = new ConcurrentHashMap<>();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userId) {
        if (userId != null && !userId.isBlank()) {
            USER_SESSIONS.put(userId, session);
            log.info("User {} connected, total online: {}", userId, USER_SESSIONS.size());
        }
    }

    @OnClose
    public void onClose(Session session, @PathParam("userId") String userId) {
        if (userId != null) {
            USER_SESSIONS.remove(userId);
            log.info("User {} disconnected, total online: {}", userId, USER_SESSIONS.size());
        }
    }

    @OnError
    public void onError(Session session, Throwable error) {
        log.error("WebSocket error on session {}: ", session.getId(), error);
    }

    /**
     * 向指定用户发送消息
     */
    public static void sendToUser(String userId, Object data) {
        Session session = USER_SESSIONS.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String json = OBJECT_MAPPER.writeValueAsString(data);
                session.getBasicRemote().sendText(json);
                log.info("Sent private message to user {}: {}", userId, json);
            } catch (IOException e) {
                log.error("Failed to send message to user {}: {}", userId, e.getMessage());
            }
        }
    }

    /**
     * 全局广播消息
     */
    public static void broadcast(String message) {
        USER_SESSIONS.values().forEach(session -> {
            if (session.isOpen()) {
                try {
                    session.getBasicRemote().sendText(message);
                } catch (IOException e) {
                    log.error("Broadcast failed: {}", e.getMessage());
                }
            }
        });
    }
}
