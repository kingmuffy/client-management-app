package com.omamofe.clientmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateClientDto {

    @Size(max = 255)
    private String fullName;

    @Size(max = 255)
    private String displayName;

    @Email
    @Size(max = 255)
    private String email;

    @Size(max = 1000)
    private String details;

    private Boolean active;

    @Size(max = 255)
    private String location;
}
