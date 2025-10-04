package com.omamofe.clientmanagement.repository;

import com.omamofe.clientmanagement.entity.Draft;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DraftRepository extends JpaRepository<Draft, Long> {

    List<Draft> findByCreatedByEmailIgnoreCaseOrderByUpdatedAtDesc(String createdByEmail);

    List<Draft> findAllByOrderByUpdatedAtDesc();
}
