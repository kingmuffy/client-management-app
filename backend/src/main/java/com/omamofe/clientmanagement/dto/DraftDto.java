package com.omamofe.clientmanagement.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class DraftDto {
    private Long id;

    private String fullName;
    private String displayName;
    private String email;
    private String details;
    private Boolean active;
    private String location;

    private String createdByEmail;
    private String createdByName;

    private Instant createdAt;
    private Instant updatedAt;
}
