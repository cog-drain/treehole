package com.treehole.scheduler;

import com.treehole.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ConfessionCleanupScheduler {

    private final MessageService messageService;

    @Scheduled(fixedRate = 600000)
    public void cleanupExpiredConfessions() {
        int cleaned = messageService.cleanupExpiredConfessions();
        if (cleaned > 0) {
            log.info("Cleaned {} expired confession messages", cleaned);
        }
    }
}
