package com.omamofe.clientmanagement.dto;

import lombok.Data;

@Data
public class ClientDto {
    private Long id;
    private String fullName;
    private String displayName;
    private String email;
    private String details;
    private Boolean active;
    private String location;
}
