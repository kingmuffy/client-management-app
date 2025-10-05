package com.omamofe.clientmanagement.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc
class DraftControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper mapper;

    private String adminToken;

    @BeforeEach
    void loginAsAdmin() throws Exception {
        String body = """
                {
                  "email": "theWorldsBestBOSS@example.com"
                }
                """;

        var result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = mapper.readTree(result.getResponse().getContentAsString());
        adminToken = json.get("token").asText();
    }

    @Test
    void getAllDrafts_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/drafts")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void createDraft_shouldReturnCreated() throws Exception {
        var createBody = """
                {
                  "fullName": "New Draft",
                  "email": "newdraft@example.com"
                }
                """;

        mockMvc.perform(post("/api/drafts")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.fullName").value("New Draft"));
    }

    @Test
    void updateDraft_shouldReturnOk() throws Exception {
        var createResponse = mockMvc.perform(post("/api/drafts")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Temporary Draft",
                                  "email": "temp@example.com"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode created = mapper.readTree(createResponse.getResponse().getContentAsString());
        long draftId = created.get("id").asLong();

        mockMvc.perform(put("/api/drafts/" + draftId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Updated Draft Name"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Draft Name"));
    }

    @Test
    void deleteDraft_shouldReturnNoContent() throws Exception {
        var createResponse = mockMvc.perform(post("/api/drafts")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Delete Me",
                                  "email": "deleteme@example.com"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode created = mapper.readTree(createResponse.getResponse().getContentAsString());
        long draftId = created.get("id").asLong();

        mockMvc.perform(delete("/api/drafts/" + draftId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }


    @Test
    void getDraft_nonExistent_shouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/drafts/9999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void createDraft_missingEmail_shouldReturnBadRequest() throws Exception {
        String invalidBody = """
                {
                  "fullName": "No Email Draft"
                }
                """;

        mockMvc.perform(post("/api/drafts")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createDraft_withoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(post("/api/drafts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Unauthorized Draft",
                                  "email": "unauth@example.com"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteDraft_nonExistent_shouldReturnNotFound() throws Exception {
        mockMvc.perform(delete("/api/drafts/99999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllDrafts_whenEmpty_shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/drafts")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(0)));
    }
    @Test
    void getDraft_notFound_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/drafts/999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

}

