package com.tutorzen.academics.repository;

import com.tutorzen.academics.domain.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, String> {

    List<ClassSession> findByTenantId(String tenantId);

    List<ClassSession> findByTenantIdAndTeacherId(String tenantId, String teacherId);

    Optional<ClassSession> findByIdAndTenantId(String id, String tenantId);
}

