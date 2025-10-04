package com.omamofe.clientmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, length = 50)
    private String action;


    @Column(nullable = false, length = 100)
    private String entityType;

    @Column(nullable = false)
    private Long entityId;

    @Column(length = 255)
    private String actorEmail;

    @Column(length = 255)
    private String actorName;

    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    @PrePersist
    public void onCreate() {
        this.timestamp = Instant.now();
    }
}
