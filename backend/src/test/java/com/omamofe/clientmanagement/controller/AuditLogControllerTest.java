package com.omamofe.clientmanagement.controller;

import com.omamofe.clientmanagement.dto.AuditLogDto;
import com.omamofe.clientmanagement.service.AuditLogService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuditLogController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuditLogControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    AuditLogService auditLogService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void listLogs_returnsOk() throws Exception {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(1L);
        dto.setAction("CREATE");
        dto.setEntityType("CLIENT");
        dto.setEntityId(99L);
        dto.setActorEmail("admin@example.com");
        dto.setActorName("Admin");
        dto.setTimestamp(Instant.now());

        Mockito.when(auditLogService.getAllLogs()).thenReturn(List.of(dto));

        mvc.perform(get("/api/logs")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("CREATE"))
                .andExpect(jsonPath("$[0].entityType").value("CLIENT"))
                .andExpect(jsonPath("$[0].actorEmail").value("admin@example.com"));
    }
}
