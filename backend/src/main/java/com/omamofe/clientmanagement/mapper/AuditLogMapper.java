package com.omamofe.clientmanagement.mapper;

import com.omamofe.clientmanagement.dto.AuditLogDto;
import com.omamofe.clientmanagement.entity.AuditLog;

public class AuditLogMapper {
    public static AuditLogDto toDto(AuditLog log) {
        if (log == null) return null;

        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setActorEmail(log.getActorEmail());
        dto.setActorName(log.getActorName());
        dto.setTimestamp(log.getTimestamp());
        return dto;
    }
}
