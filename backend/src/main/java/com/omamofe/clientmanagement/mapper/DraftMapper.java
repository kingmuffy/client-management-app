package com.omamofe.clientmanagement.mapper;

import com.omamofe.clientmanagement.dto.CreateDraftDto;
import com.omamofe.clientmanagement.dto.DraftDto;
import com.omamofe.clientmanagement.dto.UpdateDraftDto;
import com.omamofe.clientmanagement.entity.Draft;

public class DraftMapper {

    public static DraftDto toDto(Draft entity) {
        if (entity == null) return null;

        DraftDto dto = new DraftDto();
        dto.setId(entity.getId());
        dto.setFullName(entity.getFullName());
        dto.setDisplayName(entity.getDisplayName());
        dto.setEmail(entity.getEmail());
        dto.setDetails(entity.getDetails());
        dto.setActive(entity.getActive());
        dto.setLocation(entity.getLocation());

        dto.setCreatedByEmail(entity.getCreatedByEmail());
        dto.setCreatedByName(entity.getCreatedByName());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public static Draft fromCreateDto(CreateDraftDto dto) {
        if (dto == null) return null;

        return Draft.builder()
                .fullName(dto.getFullName())
                .displayName(dto.getDisplayName())
                .email(dto.getEmail())
                .details(dto.getDetails())
                .active(dto.getActive())
                .location(dto.getLocation())
                .build();
    }

    public static void applyUpdate(Draft entity, UpdateDraftDto dto) {
        if (dto.getFullName() != null) entity.setFullName(dto.getFullName());
        if (dto.getDisplayName() != null) entity.setDisplayName(dto.getDisplayName());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getDetails() != null) entity.setDetails(dto.getDetails());
        if (dto.getActive() != null) entity.setActive(dto.getActive());
        if (dto.getLocation() != null) entity.setLocation(dto.getLocation());
    }
}
