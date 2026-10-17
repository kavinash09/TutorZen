package com.tutorzen.academics.repository;

import com.tutorzen.academics.domain.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, String> {

    List<Subject> findByTenantId(String tenantId);

    Optional<Subject> findByIdAndTenantId(String id, String tenantId);
}

