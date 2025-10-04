package com.omamofe.clientmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "drafts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Draft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String fullName;

    @Column(length = 255)
    private String displayName;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 1000)
    private String details;

    private Boolean active;

    @Column(length = 255)
    private String location;

    @Column(nullable = false, length = 255)
    private String createdByEmail;

    @Column(length = 255)
    private String createdByName;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
