package com.tutorzen.academics.repository;

import com.tutorzen.academics.domain.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {

    List<Student> findByTenantId(String tenantId);

    Optional<Student> findByIdAndTenantId(String id, String tenantId);

    Optional<Student> findByTenantIdAndUserId(String tenantId, String userId);
}

