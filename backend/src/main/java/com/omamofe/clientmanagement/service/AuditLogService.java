package com.omamofe.clientmanagement.service;

import com.omamofe.clientmanagement.entity.AuditLog;
import com.omamofe.clientmanagement.mapper.AuditLogMapper;
import com.omamofe.clientmanagement.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.omamofe.clientmanagement.dto.AuditLogDto;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditRepo;

    private String getCurrentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "system";
    }

    private String getCurrentName() {
        return getCurrentEmail();
    }

    public void record(String action, String entityType, Long entityId) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .actorEmail(getCurrentEmail())
                .actorName(getCurrentName())
                .build();

        auditRepo.save(log);
    }

    public List<AuditLogDto> getAllLogs() {
        return auditRepo.findAllByOrderByTimestampDesc()
                .stream()
                .map(AuditLogMapper::toDto)
                .toList();
    }
}
