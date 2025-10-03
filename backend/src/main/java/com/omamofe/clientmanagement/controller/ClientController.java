package com.omamofe.clientmanagement.controller;

import com.omamofe.clientmanagement.dto.ClientDto;
import com.omamofe.clientmanagement.dto.CreateClientDto;
import com.omamofe.clientmanagement.dto.UpdateClientDto;
import com.omamofe.clientmanagement.service.ClientService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.security.access.prepost.PreAuthorize;

import java.net.URI;
import java.time.Duration;
import java.util.List;
@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    // ---- Cookie Helper ----
    private void setClientCountCookie(HttpServletResponse response, long count) {
        ResponseCookie cookie = ResponseCookie.from("RABO_CLIENTS", String.valueOf(count))
                .path("/")
                .httpOnly(false)
                .maxAge(Duration.ofDays(1))
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR','VIEWER')")
    public ResponseEntity<List<ClientDto>> getAllClients(HttpServletResponse response) {
        var list = clientService.getAllClients();
        setClientCountCookie(response, clientService.countClients());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR','VIEWER')")
    public ResponseEntity<ClientDto> getClientById(
            @PathVariable Long id,
            HttpServletResponse response
    ) {
        setClientCountCookie(response, clientService.countClients());
        ClientDto client = clientService.getClientById(id);
        return ResponseEntity.ok(client);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR','VIEWER')")
    public ResponseEntity<List<ClientDto>> searchClients(
            @RequestParam(required = false) String keyword,
            HttpServletResponse response
    ) {
        var list = clientService.searchClients(keyword);
        setClientCountCookie(response, clientService.countClients()); // total, not filtered size
        return ResponseEntity.ok(list);
    }


    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ResponseEntity<ClientDto> createClient(
            @Valid @RequestBody CreateClientDto dto,
            UriComponentsBuilder uriBuilder,
            HttpServletResponse response
    ) {
        ClientDto saved = clientService.createClient(dto);
        URI location = uriBuilder.path("/api/clients/{id}").buildAndExpand(saved.getId()).toUri();
        setClientCountCookie(response, clientService.countClients());
        return ResponseEntity.created(location).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ResponseEntity<ClientDto> updateClient(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClientDto dto,
            HttpServletResponse response
    ) {
        ClientDto updated = clientService.updateClient(id, dto);
        setClientCountCookie(response, clientService.countClients());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ResponseEntity<Void> deleteClient(
            @PathVariable Long id,
            HttpServletResponse response
    ) {
        clientService.deleteClient(id);
        setClientCountCookie(response, clientService.countClients());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR','VIEWER')")
    public ResponseEntity<Long> countClients(HttpServletResponse response) {
        long count = clientService.countClients();
        setClientCountCookie(response, count);
        return ResponseEntity.ok(count);
    }
    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ResponseEntity<List<ClientDto>> bulkCreate(
            @Valid @RequestBody List<@Valid CreateClientDto> dtos,
            HttpServletResponse response
    ) {
        List<ClientDto> created = dtos.stream()
                .map(clientService::createClient)
                .toList();
        setClientCountCookie(response, clientService.countClients());
        return ResponseEntity.ok(created);
    }
}
