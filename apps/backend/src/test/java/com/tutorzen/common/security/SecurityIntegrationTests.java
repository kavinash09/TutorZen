package com.tutorzen.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorzen.common.tenancy.TenantContext;
import com.tutorzen.identity.domain.User;
import com.tutorzen.identity.domain.UserCredential;
import com.tutorzen.identity.domain.UserRole;
import com.tutorzen.identity.dto.SignInRequest;
import com.tutorzen.identity.repository.RefreshTokenRepository;
import com.tutorzen.identity.repository.UserCredentialRepository;
import com.tutorzen.identity.repository.UserRepository;
import com.tutorzen.identity.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserCredentialRepository credentialRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User teacherUser;
    private User studentUser;
    private String teacherToken;
    private String studentToken;

    @BeforeEach
    void setup() {
        refreshTokenRepository.deleteAll();
        credentialRepository.deleteAll();
        userRepository.deleteAll();

        teacherUser = new User(
                "usr-teacher-sec",
                "tenant-alpha",
                "teacher.sec@demo.com",
                "Teacher Security",
                UserRole.TEACHER,
                "ACTIVE",
                Instant.now(),
                Instant.now()
        );
        userRepository.save(teacherUser);
        credentialRepository.save(new UserCredential(teacherUser.getId(), passwordEncoder.encode("password123"), Instant.now()));

        studentUser = new User(
                "usr-student-sec",
                "tenant-alpha",
                "student.sec@demo.com",
                "Student Security",
                UserRole.STUDENT,
                "ACTIVE",
                Instant.now(),
                Instant.now()
        );
        userRepository.save(studentUser);
        credentialRepository.save(new UserCredential(studentUser.getId(), passwordEncoder.encode("password123"), Instant.now()));

        teacherToken = jwtService.generateAccessToken(teacherUser);
        studentToken = jwtService.generateAccessToken(studentUser);
    }

    @Test
    void protectedEndpointWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/teacher/sessions/today"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("UNAUTHORIZED")));
    }

    @Test
    void protectedEndpointWithTeacherTokenSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/teacher/sessions/today")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk());
    }

    @Test
    void teacherEndpointWithStudentTokenReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/teacher/sessions/today")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentEndpointWithStudentTokenSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/students/usr-student-sec/attendance/summary")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId", is("usr-student-sec")));
    }

    @Test
    void spoofedTenantHeaderIsIgnoredWhenTokenIsPresent() throws Exception {
        // Teacher belongs to tenant-alpha. Caller passes X-Tenant-ID: malicious-tenant-beta.
        // The server must enforce tenant-alpha from the verified JWT.
        mockMvc.perform(get("/api/v1/teacher/sessions/today")
                        .header("Authorization", "Bearer " + teacherToken)
                        .header("X-Tenant-ID", "malicious-tenant-beta"))
                .andExpect(status().isOk());
    }

    @Test
    void corsPreflightOptionsRequestAllowedForLocalDevOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/auth/sign-in")
                        .header("Origin", "http://localhost:8081")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:8081"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }
}


