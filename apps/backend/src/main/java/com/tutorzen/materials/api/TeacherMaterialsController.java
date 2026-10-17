package com.tutorzen.materials.api;

import com.tutorzen.academics.domain.Subject;
import com.tutorzen.academics.repository.SubjectRepository;
import com.tutorzen.common.tenancy.TenantContext;
import com.tutorzen.identity.domain.User;
import com.tutorzen.identity.repository.UserRepository;
import com.tutorzen.materials.domain.LearningMaterial;
import com.tutorzen.materials.dto.CreateMaterialRequest;
import com.tutorzen.materials.dto.MaterialSummaryDto;
import com.tutorzen.materials.repository.LearningMaterialRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/teacher/materials")
public class TeacherMaterialsController {

    private final LearningMaterialRepository materialRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public TeacherMaterialsController(
            LearningMaterialRepository materialRepository,
            SubjectRepository subjectRepository,
            UserRepository userRepository) {
        this.materialRepository = materialRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectDto>> getAvailableSubjects() {
        String tenantId = getTenantId();
        List<Subject> subjects = subjectRepository.findByTenantId(tenantId);
        if (subjects.isEmpty()) {
            return ResponseEntity.ok(List.of(
                new SubjectDto("sub-math-11", "Mathematics", "MATH-11"),
                new SubjectDto("sub-phy-11", "Physics", "PHY-11")
            ));
        }

        List<SubjectDto> dtos = subjects.stream()
                .map(s -> new SubjectDto(s.getId(), s.getName(), s.getCode()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping
    public ResponseEntity<List<MaterialSummaryDto>> listMaterials(
            @RequestParam(required = false) String subjectId) {
        String tenantId = getTenantId();

        List<LearningMaterial> materials = (subjectId != null && !subjectId.isBlank())
                ? materialRepository.findByTenantIdAndSubjectIdOrderByCreatedAtDesc(tenantId, subjectId)
                : materialRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);

        Map<String, String> subjectNames = subjectRepository.findByTenantId(tenantId).stream()
                .collect(Collectors.toMap(Subject::getId, Subject::getName, (a, b) -> a));

        Map<String, String> userNames = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));

        List<MaterialSummaryDto> dtos = materials.stream()
                .map(m -> new MaterialSummaryDto(
                        m.getId(),
                        m.getSubjectId(),
                        subjectNames.getOrDefault(m.getSubjectId(), "General Studies"),
                        m.getTitle(),
                        m.getDescription(),
                        m.getFileName(),
                        m.getFileType(),
                        m.getFileSizeBytes(),
                        m.getFileUrl(),
                        m.getUploadedBy(),
                        userNames.getOrDefault(m.getUploadedBy(), "Teacher"),
                        m.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<MaterialSummaryDto> uploadMaterial(@Valid @RequestBody CreateMaterialRequest request) {
        String tenantId = getTenantId();
        String currentUserId = getCurrentUserId();

        String materialId = "mat-" + UUID.randomUUID().toString().substring(0, 8);
        Instant now = Instant.now();

        String fileType = (request.fileType() != null && !request.fileType().isBlank())
                ? request.fileType()
                : "application/pdf";

        long fileSizeBytes = request.fileSizeBytes() > 0 ? request.fileSizeBytes() : 1024 * 1024; // default 1MB
        String fileUrl = (request.fileUrl() != null && !request.fileUrl().isBlank())
                ? request.fileUrl()
                : "https://tutorzen-docs.local/materials/" + materialId + ".pdf";

        LearningMaterial material = new LearningMaterial(
                materialId,
                tenantId,
                request.subjectId(),
                currentUserId,
                request.title(),
                request.description(),
                request.fileName(),
                fileType,
                fileSizeBytes,
                fileUrl,
                now
        );

        materialRepository.save(material);

        String subjectName = subjectRepository.findByIdAndTenantId(request.subjectId(), tenantId)
                .map(Subject::getName)
                .orElse("Mathematics");

        String uploaderName = userRepository.findById(currentUserId)
                .map(User::getFullName)
                .orElse("Teacher");

        MaterialSummaryDto dto = new MaterialSummaryDto(
                material.getId(),
                material.getSubjectId(),
                subjectName,
                material.getTitle(),
                material.getDescription(),
                material.getFileName(),
                material.getFileType(),
                material.getFileSizeBytes(),
                material.getFileUrl(),
                material.getUploadedBy(),
                uploaderName,
                material.getCreatedAt()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @DeleteMapping("/{materialId}")
    @Transactional
    public ResponseEntity<Void> deleteMaterial(@PathVariable String materialId) {
        String tenantId = getTenantId();
        materialRepository.findByIdAndTenantId(materialId, tenantId).ifPresent(materialRepository::delete);
        return ResponseEntity.noContent().build();
    }

    private String getTenantId() {
        return TenantContext.getTenantId().orElse("tenant-default");
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().isBlank()) {
            return auth.getName();
        }
        return "usr-teacher-01";
    }

    public record SubjectDto(String id, String name, String code) {}
}

