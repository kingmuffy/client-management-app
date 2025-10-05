package com.omamofe.clientmanagement.service;

import com.omamofe.clientmanagement.dto.ClientDto;
import com.omamofe.clientmanagement.dto.CreateClientDto;
import com.omamofe.clientmanagement.dto.UpdateClientDto;
import com.omamofe.clientmanagement.entity.Client;
import com.omamofe.clientmanagement.exception.ClientNotFoundException;
import com.omamofe.clientmanagement.mapper.ClientMapper;
import com.omamofe.clientmanagement.repository.ClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;
    private final AuditLogService audit;

    public ClientService(ClientRepository clientRepository, AuditLogService audit) {
        this.clientRepository = clientRepository;
        this.audit = audit;
    }

    public List<ClientDto> getAllClients() {
        return clientRepository.findAll()
                .stream()
                .map(ClientMapper::toDto)
                .toList();
    }

    public ClientDto getClientById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException(id));
        return ClientMapper.toDto(client);
    }

    public List<ClientDto> searchClients(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllClients();
        }
        return clientRepository
                .findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword, keyword)
                .stream()
                .map(ClientMapper::toDto)
                .toList();
    }

    public ClientDto createClient(CreateClientDto dto) {
        Client entity = ClientMapper.fromCreateDto(dto);
        Client saved = clientRepository.save(entity);
        audit.record("CREATE", "CLIENT", saved.getId());
        return ClientMapper.toDto(saved);
    }

    public ClientDto updateClient(Long id, UpdateClientDto dto) {
        Client existing = clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException(id));

        ClientMapper.applyUpdate(existing, dto);
        Client updated = clientRepository.save(existing);
        audit.record("UPDATE", "CLIENT", id);
        return ClientMapper.toDto(updated);
    }

    public void deleteClient(Long id) {
        Client existing = clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException(id));
        clientRepository.delete(existing);
        audit.record("DELETE", "CLIENT", id);
    }

    public long countClients() {
        return clientRepository.count();
    }
}
