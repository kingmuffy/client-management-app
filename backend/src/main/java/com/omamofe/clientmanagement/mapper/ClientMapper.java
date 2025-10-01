package com.omamofe.clientmanagement.mapper;

import com.omamofe.clientmanagement.dto.ClientDto;
import com.omamofe.clientmanagement.dto.CreateClientDto;
import com.omamofe.clientmanagement.dto.UpdateClientDto;
import com.omamofe.clientmanagement.entity.Client;

public class ClientMapper {

    public static ClientDto toDto(Client entity) {
        if (entity == null) return null;

        ClientDto dto = new ClientDto();
        dto.setId(entity.getId());
        dto.setFullName(entity.getFullName());
        dto.setDisplayName(entity.getDisplayName());
        dto.setEmail(entity.getEmail());
        dto.setDetails(entity.getDetails());
        dto.setActive(entity.getActive());
        dto.setLocation(entity.getLocation());
        return dto;
    }

    public static Client fromCreateDto(CreateClientDto dto) {
        if (dto == null) return null;

        return Client.builder()
                .fullName(dto.getFullName())
                .displayName(dto.getDisplayName())
                .email(dto.getEmail())
                .details(dto.getDetails())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .location(dto.getLocation())
                .build();
    }

    public static void applyUpdate(Client entity, UpdateClientDto dto) {
        if (dto.getFullName() != null) entity.setFullName(dto.getFullName());
        if (dto.getDisplayName() != null) entity.setDisplayName(dto.getDisplayName());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getDetails() != null) entity.setDetails(dto.getDetails());
        if (dto.getActive() != null) entity.setActive(dto.getActive());
        if (dto.getLocation() != null) entity.setLocation(dto.getLocation());
    }
}
