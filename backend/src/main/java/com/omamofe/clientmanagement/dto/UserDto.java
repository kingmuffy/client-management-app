package com.omamofe.clientmanagement.dto;

import com.omamofe.clientmanagement.entity.Role;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private Boolean active;
}
