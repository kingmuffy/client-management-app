package com.omamofe.clientmanagement.controller;

import com.omamofe.clientmanagement.dto.CreateDraftDto;
import com.omamofe.clientmanagement.dto.DraftDto;
import com.omamofe.clientmanagement.dto.UpdateDraftDto;
import com.omamofe.clientmanagement.service.DraftService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/drafts")
@CrossOrigin(origins = "*")
public class DraftController {

    private final DraftService draftService;

    public DraftController(DraftService draftService) {
        this.draftService = draftService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ResponseEntity<List<DraftDto>> getAllDrafts(HttpServletResponse response) {
        List<DraftDto> drafts = draftService.listVisibleDrafts();
        return ResponseEntity.ok(drafts);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ResponseEntity<DraftDto> getDraft(
            @PathVariable Long id,
            HttpServletResponse response
    ) {
        DraftDto draft = draftService.getOne(id);
        return ResponseEntity.ok(draft);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ResponseEntity<DraftDto> createDraft(
            @Valid @RequestBody CreateDraftDto dto,
            HttpServletResponse response
    ) {
        DraftDto created = draftService.create(dto);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ResponseEntity<DraftDto> updateDraft(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDraftDto dto,
            HttpServletResponse response
    ) {
        DraftDto updated = draftService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ResponseEntity<Void> deleteDraft(
            @PathVariable Long id,
            HttpServletResponse response
    ) {
        draftService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
