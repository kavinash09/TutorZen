package com.tutorzen.academics.repository;

import com.tutorzen.academics.domain.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, String> {

    List<Batch> findByTenantId(String tenantId);

    Optional<Batch> findByIdAndTenantId(String id, String tenantId);
}

