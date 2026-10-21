package com.tutorzen.branch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchAssignmentRepository extends JpaRepository<BranchAssignment, String> {

    List<BranchAssignment> findByTenantIdAndUserId(String tenantId, String userId);

    List<BranchAssignment> findByTenantIdAndBranchId(String tenantId, String branchId);

    Optional<BranchAssignment> findByTenantIdAndUserIdAndBranchId(String tenantId, String userId, String branchId);

    Optional<BranchAssignment> findByTenantIdAndUserIdAndPrimaryTrue(String tenantId, String userId);
}

