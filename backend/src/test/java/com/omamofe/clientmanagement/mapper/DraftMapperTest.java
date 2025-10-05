package com.omamofe.clientmanagement.mapper;

import com.omamofe.clientmanagement.dto.CreateDraftDto;
import com.omamofe.clientmanagement.dto.DraftDto;
import com.omamofe.clientmanagement.dto.UpdateDraftDto;
import com.omamofe.clientmanagement.entity.Draft;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class DraftMapperTest {

    @Test
    void fromCreateDto_shouldMapFields() {
        CreateDraftDto dto = new CreateDraftDto();
        dto.setFullName("Alice");
        dto.setDisplayName("Ali");
        dto.setEmail("alice@example.com");
        dto.setDetails("Initial draft");
        dto.setActive(true);
        dto.setLocation("New York");

        Draft draft = DraftMapper.fromCreateDto(dto);

        assertNotNull(draft);
        assertEquals("Alice", draft.getFullName());
        assertEquals("Ali", draft.getDisplayName());
        assertEquals("alice@example.com", draft.getEmail());
        assertEquals("Initial draft", draft.getDetails());
        assertEquals(true, draft.getActive());
        assertEquals("New York", draft.getLocation());
        assertNotNull(draft.getCreatedAt());
        assertNotNull(draft.getUpdatedAt());
    }

    @Test
    void toDto_shouldMapAllFields() {
        Instant now = Instant.now();
        Draft entity = Draft.builder()
                .id(5L)
                .fullName("Bob")
                .displayName("Bobby")
                .email("bob@example.com")
                .details("A draft")
                .active(false)
                .location("LA")
                .createdByEmail("bob@example.com")
                .createdByName("Bob Marley")
                .createdAt(now)
                .updatedAt(now)
                .build();

        DraftDto dto = DraftMapper.toDto(entity);

        assertNotNull(dto);
        assertEquals(5L, dto.getId());
        assertEquals("Bob", dto.getFullName());
        assertEquals("Bobby", dto.getDisplayName());
        assertEquals("bob@example.com", dto.getEmail());
        assertEquals("A draft", dto.getDetails());
        assertFalse(dto.getActive());
        assertEquals("LA", dto.getLocation());
        assertEquals("bob@example.com", dto.getCreatedByEmail());
        assertEquals("Bob Marley", dto.getCreatedByName());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void applyUpdate_shouldModifyOnlyProvidedFields() {
        Draft draft = Draft.builder()
                .id(10L)
                .fullName("Old")
                .displayName("OLD")
                .email("old@example.com")
                .details("Old details")
                .active(false)
                .location("Rome")
                .build();

        UpdateDraftDto dto = new UpdateDraftDto();
        dto.setFullName("New");
        dto.setDetails("Updated details");
        dto.setActive(true);

        DraftMapper.applyUpdate(draft, dto);

        assertEquals("New", draft.getFullName());
        assertEquals("OLD", draft.getDisplayName());
        assertEquals("old@example.com", draft.getEmail()); 
        assertEquals("Updated details", draft.getDetails());
        assertTrue(draft.getActive());
    }

    @Test
    void nullSafety_shouldHandleNulls() {
        assertNull(DraftMapper.toDto(null));
        assertNull(DraftMapper.fromCreateDto(null));
        assertDoesNotThrow(() -> DraftMapper.applyUpdate(new Draft(), new UpdateDraftDto()));
    }
}
