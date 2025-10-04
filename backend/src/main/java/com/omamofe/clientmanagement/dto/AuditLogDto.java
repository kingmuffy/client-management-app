package com.omamofe.clientmanagement.dto;
import lombok.Data;
import java.time.Instant;
@Data
public class AuditLogDto {
    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private String actorEmail;
    private String actorName;
    private Instant timestamp;
}
