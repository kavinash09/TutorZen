package com.tutorzen.materials;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorzen.academics.domain.Subject;
import com.tutorzen.academics.repository.SubjectRepository;
import com.tutorzen.identity.domain.User;
import com.tutorzen.identity.domain.UserRole;
import com.tutorzen.identity.service.JwtService;
import com.tutorzen.materials.domain.LearningMaterial;
import com.tutorzen.materials.dto.CreateMaterialRequest;
import com.tutorzen.materials.repository.LearningMaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TeacherMaterialsPersistenceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LearningMaterialRepository materialRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private JwtService jwtService;

    private String teacherToken;
    private final String tenantId = "tenant-mat-test";

    @BeforeEach
    void setUp() {
        materialRepository.deleteAll();
        subjectRepository.deleteAll();

        User teacher = new User(
                "usr-teacher-mat",
                tenantId,
                "teacher.mat@demo.com",
                "Mathematics Teacher",
                UserRole.TEACHER,
                "ACTIVE",
                Instant.now(),
                Instant.now()
        );
        teacherToken = jwtService.generateAccessToken(teacher);

        Subject math = new Subject("sub-math-test", tenantId, "Mathematics", "MATH-101", Instant.now());
        Subject phy = new Subject("sub-phy-test", tenantId, "Physics", "PHY-101", Instant.now());
        subjectRepository.save(math);
        subjectRepository.save(phy);

        LearningMaterial mat1 = new LearningMaterial(
                "mat-t1",
                tenantId,
                "sub-math-test",
                teacher.getId(),
                "Integration Formula Sheet",
                "Essential formulas for calculus",
                "Calculus_Formulas.pdf",
                "application/pdf",
                1024 * 500,
                "http://local/mat-t1.pdf",
                Instant.now()
        );
        materialRepository.save(mat1);
    }

    @Test
    void getSubjectsReturnsAvailableSubjects() throws Exception {
        mockMvc.perform(get("/api/v1/teacher/materials/subjects")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", is("Mathematics")));
    }

    @Test
    void listMaterialsReturnsTenantMaterials() throws Exception {
        mockMvc.perform(get("/api/v1/teacher/materials")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("mat-t1")))
                .andExpect(jsonPath("$[0].subjectName", is("Mathematics")))
                .andExpect(jsonPath("$[0].fileName", is("Calculus_Formulas.pdf")));
    }

    @Test
    void uploadMaterialPersistsToDatabaseAndReturnsDto() throws Exception {
        CreateMaterialRequest request = new CreateMaterialRequest(
                "sub-phy-test",
                "Kinematics & Motion Handout",
                "Lecture summary covering projectile motion with diagrams",
                "Kinematics_Lecture_02.pdf",
                "application/pdf",
                2048576,
                null
        );

        mockMvc.perform(post("/api/v1/teacher/materials")
                        .header("Authorization", "Bearer " + teacherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Kinematics & Motion Handout")))
                .andExpect(jsonPath("$.subjectName", is("Physics")))
                .andExpect(jsonPath("$.fileName", is("Kinematics_Lecture_02.pdf")));

        assertTrue(materialRepository.findByTenantIdAndSubjectIdOrderByCreatedAtDesc(tenantId, "sub-phy-test")
                .stream().anyMatch(m -> m.getTitle().equals("Kinematics & Motion Handout")));
    }

    @Test
    void filterMaterialsBySubjectIdReturnsFilteredSubset() throws Exception {
        // Add physics material
        LearningMaterial phyMat = new LearningMaterial(
                "mat-phy-1",
                tenantId,
                "sub-phy-test",
                "usr-teacher-mat",
                "Physics Vectors Notes",
                "Vectors recap",
                "Vectors.pdf",
                "application/pdf",
                500000,
                null,
                Instant.now()
        );
        materialRepository.save(phyMat);

        mockMvc.perform(get("/api/v1/teacher/materials?subjectId=sub-phy-test")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Physics Vectors Notes")));
    }

    @Test
    void deleteMaterialRemovesFromDatabase() throws Exception {
        mockMvc.perform(delete("/api/v1/teacher/materials/mat-t1")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isNoContent());

        assertFalse(materialRepository.findByIdAndTenantId("mat-t1", tenantId).isPresent());
    }

    @Test
    void unauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/teacher/materials"))
                .andExpect(status().isUnauthorized());
    }
}

