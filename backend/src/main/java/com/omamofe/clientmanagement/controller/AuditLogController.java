package com.omamofe.clientmanagement.controller;

import com.omamofe.clientmanagement.dto.AuditLogDto;
import com.omamofe.clientmanagement.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class AuditLogController {

    private final AuditLogService service;

    public AuditLogController(AuditLogService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ResponseEntity<List<AuditLogDto>> listLogs() {
        return ResponseEntity.ok(service.getAllLogs());
    }
}
