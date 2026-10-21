package com.tutorzen.branch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, String> {

    List<Branch> findByTenantId(String tenantId);

    Optional<Branch> findByIdAndTenantId(String id, String tenantId);

    Optional<Branch> findByTenantIdAndCode(String tenantId, String code);

    boolean existsByTenantIdAndCode(String tenantId, String code);
}

