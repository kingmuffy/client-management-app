package com.omamofe.clientmanagement.service;
import com.omamofe.clientmanagement.dto.CreateClientDto;
import com.omamofe.clientmanagement.dto.UpdateClientDto;
import com.omamofe.clientmanagement.entity.Client;
import com.omamofe.clientmanagement.exception.ClientNotFoundException;
import com.omamofe.clientmanagement.repository.ClientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
public class ClientServiceTest {
    @Mock
    private ClientRepository clientRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ClientService clientService;

    private Client client;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        client = Client.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@example.com")
                .active(true)
                .build();
    }

    @Test
    void getAllClients_returnsClientList() {
        when(clientRepository.findAll()).thenReturn(List.of(client));

        var result = clientService.getAllClients();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getFullName()).isEqualTo("John Doe");
        verify(clientRepository).findAll();
    }

    @Test
    void getClientById_existingId_returnsClient() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));

        var dto = clientService.getClientById(1L);

        assertThat(dto.getEmail()).isEqualTo("john@example.com");
        verify(clientRepository).findById(1L);
    }

    @Test
    void getClientById_nonExistingId_throwsException() {
        when(clientRepository.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clientService.getClientById(2L))
                .isInstanceOf(ClientNotFoundException.class)
                .hasMessageContaining("2");
    }

    @Test
    void createClient_savesAndReturnsDto() {
        CreateClientDto dto = new CreateClientDto();
        dto.setFullName("Alice");
        dto.setEmail("alice@example.com");

        Client savedClient = Client.builder()
                .id(5L)
                .fullName("Alice")
                .email("alice@example.com")
                .active(true)
                .build();

        when(clientRepository.save(any(Client.class))).thenReturn(savedClient);

        var result = clientService.createClient(dto);

        assertThat(result.getId()).isEqualTo(5L);
        assertThat(result.getFullName()).isEqualTo("Alice");
        verify(auditLogService).record("CREATE", "CLIENT", 5L);
    }

    @Test
    void updateClient_updatesAndReturnsDto() {
        UpdateClientDto dto = new UpdateClientDto();
        dto.setFullName("Updated");

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = clientService.updateClient(1L, dto);

        assertThat(result.getFullName()).isEqualTo("Updated");
        verify(auditLogService).record("UPDATE", "CLIENT", 1L);
    }

    @Test
    void deleteClient_removesClient() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));

        clientService.deleteClient(1L);

        verify(clientRepository).delete(client);
        verify(auditLogService).record("DELETE", "CLIENT", 1L);
    }

    @Test
    void countClients_returnsCount() {
        when(clientRepository.count()).thenReturn(10L);

        long count = clientService.countClients();

        assertThat(count).isEqualTo(10L);
        verify(clientRepository).count();
    }
}
