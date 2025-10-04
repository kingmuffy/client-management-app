package com.omamofe.clientmanagement.service;

import com.omamofe.clientmanagement.dto.CreateDraftDto;
import com.omamofe.clientmanagement.dto.DraftDto;
import com.omamofe.clientmanagement.dto.UpdateDraftDto;
import com.omamofe.clientmanagement.entity.Draft;
import com.omamofe.clientmanagement.exception.DraftNotFoundException;
import com.omamofe.clientmanagement.mapper.DraftMapper;
import com.omamofe.clientmanagement.repository.DraftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DraftService {

    private final DraftRepository draftRepository;

    private String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    public List<DraftDto> listVisibleDrafts() {
        if (isAdmin()) {
            return draftRepository.findAllByOrderByUpdatedAtDesc()
                    .stream().map(DraftMapper::toDto).toList();
        }
        String email = currentEmail();
        return draftRepository.findByCreatedByEmailIgnoreCaseOrderByUpdatedAtDesc(email)
                .stream().map(DraftMapper::toDto).toList();
    }

    public DraftDto create(CreateDraftDto dto) {
        String email = currentEmail();
        Draft entity = DraftMapper.fromCreateDto(dto);
        entity.setCreatedByEmail(email);
        Draft saved = draftRepository.save(entity);
        return DraftMapper.toDto(saved);
    }

    public DraftDto getOne(Long id) {
        Draft d = draftRepository.findById(id).orElseThrow(() -> new DraftNotFoundException(id));
        if (!isAdmin() && !d.getCreatedByEmail().equalsIgnoreCase(currentEmail())) {
            throw new AccessDeniedException("You cannot access another user’s draft");
        }
        return DraftMapper.toDto(d);
    }

    public DraftDto update(Long id, UpdateDraftDto dto) {
        Draft d = draftRepository.findById(id).orElseThrow(() -> new DraftNotFoundException(id));
        if (!isAdmin() && !d.getCreatedByEmail().equalsIgnoreCase(currentEmail())) {
            throw new AccessDeniedException("You cannot edit another user’s draft");
        }

        DraftMapper.applyUpdate(d, dto);
        Draft saved = draftRepository.save(d);
        return DraftMapper.toDto(saved);
    }

    public void delete(Long id) {
        Draft d = draftRepository.findById(id).orElseThrow(() -> new DraftNotFoundException(id));
        if (!isAdmin() && !d.getCreatedByEmail().equalsIgnoreCase(currentEmail())) {
            throw new AccessDeniedException("You cannot delete another user’s draft");
        }
        draftRepository.delete(d);
    }
}
