package com.omamofe.clientmanagement.controller;

import com.omamofe.clientmanagement.dto.ClientDto;
import com.omamofe.clientmanagement.dto.CreateClientDto;
import com.omamofe.clientmanagement.dto.UpdateClientDto;
import com.omamofe.clientmanagement.service.ClientService;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientController.class)
@AutoConfigureMockMvc(addFilters = false)
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClientService clientService;

    @Test
    void getAllClients_shouldSetRaboClientsCookie() throws Exception {

        when(clientService.getAllClients()).thenReturn(Collections.emptyList());
        when(clientService.countClients()).thenReturn(5L);


        mockMvc.perform(get("/api/clients"))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", Matchers.containsString("RABO_CLIENTS=5")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("Max-Age=86400")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("Path=/")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("SameSite=Lax")));
    }
    @Test
    void createClient_shouldSetRaboClientsCookie() throws Exception {
        ClientDto dto = new ClientDto();
        dto.setId(1L);
        dto.setFullName("John Doe");

        when(clientService.createClient(any(CreateClientDto.class))).thenReturn(dto);
        when(clientService.countClients()).thenReturn(6L);

        mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "John Doe",
                                  "email": "john@example.com"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Set-Cookie", Matchers.containsString("RABO_CLIENTS=6")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("Max-Age=86400")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("Path=/")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("SameSite=Lax")));
    }

    @Test
    void updateClient_shouldSetRaboClientsCookie() throws Exception {
        ClientDto dto = new ClientDto();
        dto.setId(1L);
        dto.setFullName("Updated Name");

        when(clientService.updateClient(any(Long.class), any(UpdateClientDto.class))).thenReturn(dto);
        when(clientService.countClients()).thenReturn(6L);

        mockMvc.perform(put("/api/clients/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Updated Name"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", Matchers.containsString("RABO_CLIENTS=6")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("Max-Age=86400")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("Path=/")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("SameSite=Lax")));
    }

    @Test
    void deleteClient_shouldSetRaboClientsCookie() throws Exception {
        when(clientService.countClients()).thenReturn(4L);

        mockMvc.perform(delete("/api/clients/1"))
                .andExpect(status().isNoContent())
                .andExpect(header().string("Set-Cookie", Matchers.containsString("RABO_CLIENTS=4")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("Max-Age=86400")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("Path=/")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("SameSite=Lax")));
    }
}
