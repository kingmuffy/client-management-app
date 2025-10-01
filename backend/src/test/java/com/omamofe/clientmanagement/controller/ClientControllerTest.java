package com.omamofe.clientmanagement.controller;

import com.omamofe.clientmanagement.service.ClientService;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientController.class)
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
}
