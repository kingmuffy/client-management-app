package com.omamofe.clientmanagement.controller;

import com.omamofe.clientmanagement.entity.Role;
import com.omamofe.clientmanagement.entity.User;
import com.omamofe.clientmanagement.repository.UserRepository;
import com.omamofe.clientmanagement.security.JwtService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean UserRepository userRepository;
    @MockitoBean
    JwtService jwtService;

    @Test
    void login_ok() throws Exception {
        User u = User.builder()
                .id(1L).email("sheila.cox@example.com").fullName("Sheila Cox")
                .role(Role.VIEWER).active(true).build();

        Mockito.when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(u));
        Mockito.when(jwtService.generateToken(u)).thenReturn("header.payload.sig");

        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"sheila.cox@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("header.payload.sig"))
                .andExpect(jsonPath("$.user.email").value("sheila.cox@example.com"))
                .andExpect(jsonPath("$.user.role").value("VIEWER"));
    }
}
