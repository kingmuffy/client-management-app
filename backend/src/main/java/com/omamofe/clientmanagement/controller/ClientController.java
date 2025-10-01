package com.omamofe.clientmanagement.controller;

import com.omamofe.clientmanagement.dto.ClientDto;
import com.omamofe.clientmanagement.dto.CreateClientDto;
import com.omamofe.clientmanagement.dto.UpdateClientDto;
import com.omamofe.clientmanagement.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public ResponseEntity<List<ClientDto>> getAllClients() {
        return ResponseEntity.ok(clientService.getAllClients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientDto> getClientById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClientDto>> searchClients(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(clientService.searchClients(keyword));
    }

    @PostMapping
    public ResponseEntity<ClientDto> createClient(
            @Valid @RequestBody CreateClientDto dto,
            UriComponentsBuilder uriBuilder
    ) {
        ClientDto saved = clientService.createClient(dto);
        URI location = uriBuilder.path("/api/clients/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientDto> updateClient(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClientDto dto
    ) {
        ClientDto updated = clientService.updateClient(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countClients() {
        return ResponseEntity.ok(clientService.countClients());
    }
}
