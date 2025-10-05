package com.omamofe.clientmanagement.service;
import com.omamofe.clientmanagement.dto.CreateDraftDto;
import com.omamofe.clientmanagement.dto.UpdateDraftDto;
import com.omamofe.clientmanagement.entity.Draft;
import com.omamofe.clientmanagement.exception.DraftNotFoundException;
import com.omamofe.clientmanagement.repository.DraftRepository;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
public class DraftServiceTest {
    @Mock
    private DraftRepository draftRepository;

    @Mock
    private AuditLogService audit;

    @InjectMocks
    private DraftService draftService;

    private Draft draft;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        draft = Draft.builder()
                .id(1L)
                .fullName("Test Draft")
                .email("draft@example.com")
                .createdByEmail("angel.hansen@example.com") // from your seeded users.json
                .build();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    private void mockUser(String email, String... roles) {
        var authorities = List.of(roles).stream()
                .map(SimpleGrantedAuthority::new)
                .toList();
        var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void listVisibleDrafts_asAdmin_returnsAll() {
        mockUser("theWorldsBestBOSS@example.com", "ROLE_ADMIN");
        when(draftRepository.findAllByOrderByUpdatedAtDesc()).thenReturn(List.of(draft));

        var result = draftService.listVisibleDrafts();

        assertThat(result).hasSize(1);
        verify(draftRepository).findAllByOrderByUpdatedAtDesc();
    }

    @Test
    void listVisibleDrafts_asEditor_returnsOwnDrafts() {
        mockUser("angel.hansen@example.com", "ROLE_EDITOR");
        when(draftRepository.findByCreatedByEmailIgnoreCaseOrderByUpdatedAtDesc("angel.hansen@example.com"))
                .thenReturn(List.of(draft));

        var result = draftService.listVisibleDrafts();

        assertThat(result).hasSize(1);
        verify(draftRepository).findByCreatedByEmailIgnoreCaseOrderByUpdatedAtDesc("angel.hansen@example.com");
    }

    @Test
    void create_shouldSaveDraftAndRecordAudit() {
        mockUser("angel.hansen@example.com", "ROLE_EDITOR");

        CreateDraftDto dto = new CreateDraftDto();
        dto.setFullName("My Draft");
        dto.setEmail("email@example.com");

        Draft saved = Draft.builder()
                .id(10L)
                .fullName("My Draft")
                .email("email@example.com")
                .createdByEmail("angel.hansen@example.com")
                .build();

        when(draftRepository.save(any(Draft.class))).thenReturn(saved);

        var result = draftService.create(dto);

        assertThat(result.getId()).isEqualTo(10L);
        verify(audit).record("CREATE", "DRAFT", 10L);
    }

    @Test
    void getOne_asOwner_returnsDraft() {
        mockUser("angel.hansen@example.com", "ROLE_EDITOR");
        when(draftRepository.findById(1L)).thenReturn(Optional.of(draft));

        var dto = draftService.getOne(1L);

        assertThat(dto.getEmail()).isEqualTo("draft@example.com");
    }

    @Test
    void getOne_asDifferentUser_throwsAccessDenied() {
        mockUser("sheila.cox@example.com", "ROLE_VIEWER");
        when(draftRepository.findById(1L)).thenReturn(Optional.of(draft));

        assertThatThrownBy(() -> draftService.getOne(1L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("cannot access");
    }

    @Test
    void update_asOwner_updatesAndRecordsAudit() {
        mockUser("angel.hansen@example.com", "ROLE_EDITOR");
        when(draftRepository.findById(1L)).thenReturn(Optional.of(draft));
        when(draftRepository.save(any(Draft.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateDraftDto dto = new UpdateDraftDto();
        dto.setFullName("Updated Draft");

        var result = draftService.update(1L, dto);

        assertThat(result.getFullName()).isEqualTo("Updated Draft");
        verify(audit).record("UPDATE", "DRAFT", 1L);
    }

    @Test
    void update_asDifferentUser_throwsAccessDenied() {
        mockUser("sheila.cox@example.com", "ROLE_VIEWER");
        when(draftRepository.findById(1L)).thenReturn(Optional.of(draft));

        UpdateDraftDto dto = new UpdateDraftDto();
        dto.setFullName("Updated Draft");

        assertThatThrownBy(() -> draftService.update(1L, dto))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void delete_asOwner_deletesAndRecordsAudit() {
        mockUser("angel.hansen@example.com", "ROLE_EDITOR");
        when(draftRepository.findById(1L)).thenReturn(Optional.of(draft));

        draftService.delete(1L);

        verify(draftRepository).delete(draft);
        verify(audit).record("DELETE", "DRAFT", 1L);
    }

    @Test
    void delete_nonExisting_throwsNotFound() {
        when(draftRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> draftService.delete(99L))
                .isInstanceOf(DraftNotFoundException.class);
    }
    @Test
    void delete_asDifferentUser_throwsAccessDenied() {
        mockUser("sheila.cox@example.com", "ROLE_VIEWER");
        when(draftRepository.findById(1L)).thenReturn(Optional.of(draft));

        assertThatThrownBy(() -> draftService.delete(1L))
                .isInstanceOf(AccessDeniedException.class);
    }
}