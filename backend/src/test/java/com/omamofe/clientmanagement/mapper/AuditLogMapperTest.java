package com.omamofe.clientmanagement.mapper;

import com.omamofe.clientmanagement.dto.AuditLogDto;
import com.omamofe.clientmanagement.entity.AuditLog;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class AuditLogMapperTest {

    @Test
    void toDto_shouldMapAllFields() {
        // Arrange
        Instant timestamp = Instant.now();
        AuditLog log = AuditLog.builder()
                .id(100L)
                .action("CREATE")
                .entityType("CLIENT")
                .entityId(55L)
                .actorEmail("admin@company.com")
                .actorName("Admin User")
                .timestamp(timestamp)
                .build();

        AuditLogDto dto = AuditLogMapper.toDto(log);

        assertNotNull(dto);
        assertEquals(log.getId(), dto.getId());
        assertEquals(log.getAction(), dto.getAction());
        assertEquals(log.getEntityType(), dto.getEntityType());
        assertEquals(log.getEntityId(), dto.getEntityId());
        assertEquals(log.getActorEmail(), dto.getActorEmail());
        assertEquals(log.getActorName(), dto.getActorName());
        assertEquals(log.getTimestamp(), dto.getTimestamp());
    }

    @Test
    void toDto_shouldReturnNull_whenInputIsNull() {
        // Act
        AuditLogDto dto = AuditLogMapper.toDto(null);

        // Assert
        assertNull(dto);
    }
}
