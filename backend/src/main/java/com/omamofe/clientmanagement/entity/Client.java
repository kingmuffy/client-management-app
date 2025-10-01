package com.omamofe.clientmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String displayName;
    private String email;

    @Column(length = 1000)
    private String details;

    private Boolean active;
    private String location;
}
