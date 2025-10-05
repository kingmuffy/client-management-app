package com.omamofe.clientmanagement.mapper;

import com.omamofe.clientmanagement.dto.ClientDto;
import com.omamofe.clientmanagement.dto.CreateClientDto;
import com.omamofe.clientmanagement.dto.UpdateClientDto;
import com.omamofe.clientmanagement.entity.Client;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ClientMapperTest {

    @Test
    void fromCreateDto_shouldMapAllFields() {
        CreateClientDto dto = new CreateClientDto();
        dto.setFullName("John Doe");
        dto.setDisplayName("JD");
        dto.setEmail("john@example.com");
        dto.setDetails("Details");
        dto.setActive(false);
        dto.setLocation("London");

        Client client = ClientMapper.fromCreateDto(dto);

        assertNotNull(client);
        assertEquals("John Doe", client.getFullName());
        assertEquals("JD", client.getDisplayName());
        assertEquals("john@example.com", client.getEmail());
        assertEquals("Details", client.getDetails());
        assertEquals(false, client.getActive());
        assertEquals("London", client.getLocation());
    }

    @Test
    void fromCreateDto_shouldDefaultActiveTrueWhenNull() {
        CreateClientDto dto = new CreateClientDto();
        dto.setFullName("Jane Doe");
        dto.setEmail("jane@example.com");

        Client client = ClientMapper.fromCreateDto(dto);

        assertTrue(client.getActive());
    }

    @Test
    void toDto_shouldMapAllFields() {
        Client client = Client.builder()
                .id(1L)
                .fullName("John")
                .displayName("JD")
                .email("john@example.com")
                .details("Some info")
                .active(true)
                .location("Paris")
                .build();

        ClientDto dto = ClientMapper.toDto(client);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("John", dto.getFullName());
        assertEquals("JD", dto.getDisplayName());
        assertEquals("john@example.com", dto.getEmail());
        assertEquals("Some info", dto.getDetails());
        assertTrue(dto.getActive());
        assertEquals("Paris", dto.getLocation());
    }

    @Test
    void applyUpdate_shouldModifyOnlyNonNullFields() {
        Client client = Client.builder()
                .id(1L)
                .fullName("Old")
                .displayName("OD")
                .email("old@example.com")
                .details("Old details")
                .active(false)
                .location("Berlin")
                .build();

        UpdateClientDto dto = new UpdateClientDto();
        dto.setFullName("New Name");
        dto.setDetails("New details");

        ClientMapper.applyUpdate(client, dto);

        assertEquals("New Name", client.getFullName());
        assertEquals("OD", client.getDisplayName());
        assertEquals("old@example.com", client.getEmail()); 
        assertEquals("New details", client.getDetails());
        assertEquals(false, client.getActive()); 
    }

    @Test
    void nullSafety_shouldHandleNulls() {
        assertNull(ClientMapper.toDto(null));
        assertNull(ClientMapper.fromCreateDto(null));

        Client entity = Client.builder().build();
        assertDoesNotThrow(() -> ClientMapper.applyUpdate(entity, new UpdateClientDto()));
    }
}
