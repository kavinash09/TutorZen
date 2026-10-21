package com.tutorzen.authorization;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPermissionRepository extends JpaRepository<UserPermission, String> {

    List<UserPermission> findByTenantIdAndUserId(String tenantId, String userId);

    List<UserPermission> findByTenantIdAndUserIdAndBranchId(String tenantId, String userId, String branchId);

    Optional<UserPermission> findByTenantIdAndUserIdAndPermissionIdAndBranchId(
            String tenantId, String userId, String permissionId, String branchId);

    boolean existsByTenantIdAndUserIdAndPermissionId(String tenantId, String userId, String permissionId);
}

