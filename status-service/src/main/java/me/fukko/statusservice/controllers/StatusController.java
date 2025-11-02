package me.fukko.statusservice.controllers;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.fukko.statusservice.services.StatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Date;
import java.util.Set;

@RestController
@RequestMapping(value = "/api")
@RequiredArgsConstructor
@Slf4j
public class StatusController {
    private final StatusService statusService;

    @GetMapping("/{userId}/status")
    public ResponseEntity<String> getUserStatus(@PathVariable(value = "userId") Long userId) {
        Set<String> onlineSessions = statusService.getOnlineSessions(userId);
        String jsonResponse = null;
        if (!onlineSessions.isEmpty()) {
            log.info("User {} has sessions online", userId);
            jsonResponse = "{\"onlineSessions\": " + onlineSessions + "}";
        } else {
            log.info("User {} has no sessions online", userId);
            Instant lastSeen = statusService.getLastSeen(userId);
            jsonResponse = "{\"lastSeen\": " + (lastSeen != null ? lastSeen : "null") + "}";
        }
        return ResponseEntity.ok(jsonResponse);
    }
}
