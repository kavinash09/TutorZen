package com.tutorzen.materials.repository;

import com.tutorzen.materials.domain.LearningMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, String> {

    List<LearningMaterial> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    List<LearningMaterial> findByTenantIdAndSubjectIdOrderByCreatedAtDesc(String tenantId, String subjectId);

    Optional<LearningMaterial> findByIdAndTenantId(String id, String tenantId);
}

