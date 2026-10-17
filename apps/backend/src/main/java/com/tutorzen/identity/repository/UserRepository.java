package com.tutorzen.identity.repository;

import com.tutorzen.identity.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByTenantIdAndEmail(String tenantId, String email);

    List<User> findByEmail(String email);

    Optional<User> findByIdAndTenantId(String id, String tenantId);
}

