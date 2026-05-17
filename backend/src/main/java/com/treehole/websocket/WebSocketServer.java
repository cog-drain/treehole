package com.treehole.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.treehole.service.RealtimeService;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
    
    // 用户 ID -> Session ID -> Session，支持同一身份多标签页同时在线
    private static final Map<String, Map<String, Session>> USER_SESSIONS = new ConcurrentHashMap<>();
    private static RealtimeService realtimeService;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Autowired
    public void setRealtimeService(RealtimeService realtimeService) {
        WebSocketServer.realtimeService = realtimeService;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userId) {
        if (userId != null && !userId.isBlank()) {
            USER_SESSIONS.computeIfAbsent(userId, ignored -> new ConcurrentHashMap<>()).put(session.getId(), session);
            if (realtimeService != null) {
                realtimeService.markUserOnline(userId, session.getId());
                realtimeService.markUserModuleActive(userId, session.getId(), "feed");
            }
            log.info("User {} connected, total online: {}", userId, getOnlineCount());
            broadcastOnlineStats();
        }
    }

    @OnClose
    public void onClose(Session session, @PathParam("userId") String userId) {
        if (userId != null) {
            Map<String, Session> sessions = USER_SESSIONS.get(userId);
            if (sessions != null) {
                sessions.remove(session.getId());
                if (sessions.isEmpty()) USER_SESSIONS.remove(userId, sessions);
            }
            if (realtimeService != null) realtimeService.markUserOffline(userId, session.getId());
            log.info("User {} disconnected, total online: {}", userId, getOnlineCount());
            broadcastOnlineStats();
        }
    }

    @OnMessage
    public void onMessage(String message, Session session, @PathParam("userId") String userId) {
        if (realtimeService == null) return;
        realtimeService.markUserOnline(userId, session.getId());
        try {
            Map<?, ?> payload = OBJECT_MAPPER.readValue(message, Map.class);
            String module = payload.get("module") == null ? null : payload.get("module").toString();
            String action = payload.get("action") == null ? null : payload.get("action").toString();
            realtimeService.markUserModuleActive(userId, session.getId(), module);
            realtimeService.recordAction(action);
        } catch (Exception ignored) {
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
        Map<String, Session> sessions = USER_SESSIONS.get(userId);
        if (sessions == null || sessions.isEmpty()) return;
        try {
            String json = OBJECT_MAPPER.writeValueAsString(data);
            sessions.values().forEach(session -> sendText(session, json, "Failed to send message to user " + userId));
            log.info("Sent private message to user {}: {}", userId, json);
        } catch (IOException e) {
            log.error("Failed to serialize message for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * 全局广播消息
     */
    public static void broadcast(String message) {
        USER_SESSIONS.values().forEach(sessions ->
                sessions.values().forEach(session ->
                        sendText(session, message, "Broadcast failed for session " + session.getId())
                )
        );
    }

    /**
     * BasicRemote 不支持并发写入，同一个 Session 的消息必须串行发送。
     */
    private static void sendText(Session session, String message, String errorPrefix) {
        if (session == null || !session.isOpen()) {
            return;
        }
        synchronized (session) {
            if (!session.isOpen()) {
                return;
            }
            try {
                session.getBasicRemote().sendText(message);
            } catch (IOException | IllegalStateException e) {
                log.error("{}: {}", errorPrefix, e.getMessage());
            }
        }
    }

    private static void broadcastOnlineStats() {
        try {
            String json = OBJECT_MAPPER.writeValueAsString(Map.of(
                    "type", "ONLINE_STATS_UPDATE",
                    "data", Map.of(
                            "online", getOnlineCount(),
                            "modules", realtimeService == null ? Map.of() : realtimeService.countActiveModules()
                    )
            ));
            broadcast(json);
        } catch (Exception e) {
            log.error("Broadcast online stats failed: {}", e.getMessage());
        }
    }

    public static long getOnlineCount() {
        return realtimeService == null ? USER_SESSIONS.keySet().size() : realtimeService.countOnlineUsers();
    }
}
