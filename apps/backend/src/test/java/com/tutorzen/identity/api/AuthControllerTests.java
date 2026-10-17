package com.tutorzen.identity.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorzen.identity.domain.User;
import com.tutorzen.identity.domain.UserCredential;
import com.tutorzen.identity.domain.UserRole;
import com.tutorzen.identity.dto.AuthResponse;
import com.tutorzen.identity.dto.RefreshTokenRequest;
import com.tutorzen.identity.dto.SignInRequest;
import com.tutorzen.identity.repository.RefreshTokenRepository;
import com.tutorzen.identity.repository.UserCredentialRepository;
import com.tutorzen.identity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTests {

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

    @BeforeEach
    void setupTestData() {
        refreshTokenRepository.deleteAll();
        credentialRepository.deleteAll();
        userRepository.deleteAll();

        User teacher = new User(
                "usr-teacher-01",
                "tenant-test-01",
                "teacher@demo.com",
                "Teacher Test",
                UserRole.TEACHER,
                "ACTIVE",
                Instant.now(),
                Instant.now()
        );
        userRepository.save(teacher);
        credentialRepository.save(new UserCredential(teacher.getId(), passwordEncoder.encode("password123"), Instant.now()));

        User student = new User(
                "usr-student-01",
                "tenant-test-01",
                "student@demo.com",
                "Student Test",
                UserRole.STUDENT,
                "ACTIVE",
                Instant.now(),
                Instant.now()
        );
        userRepository.save(student);
        credentialRepository.save(new UserCredential(student.getId(), passwordEncoder.encode("password123"), Instant.now()));
    }

    @Test
    void signInSuccessReturnsTokensAndProfile() throws Exception {
        SignInRequest request = new SignInRequest("teacher@demo.com", "password123", "tenant-test-01");

        mockMvc.perform(post("/api/v1/auth/sign-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.expiresIn", is(900)))
                .andExpect(jsonPath("$.user.email", is("teacher@demo.com")))
                .andExpect(jsonPath("$.user.role", is("TEACHER")))
                .andExpect(jsonPath("$.user.tenantId", is("tenant-test-01")));
    }

    @Test
    void signInWithInvalidPasswordReturns401() throws Exception {
        SignInRequest request = new SignInRequest("teacher@demo.com", "wrong-password", "tenant-test-01");

        mockMvc.perform(post("/api/v1/auth/sign-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("UNAUTHORIZED")));
    }

    @Test
    void signInWithUnknownEmailReturns401() throws Exception {
        SignInRequest request = new SignInRequest("unknown@demo.com", "password123", null);

        mockMvc.perform(post("/api/v1/auth/sign-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("UNAUTHORIZED")));
    }

    @Test
    void refreshTokenRotatesTokenSuccessfully() throws Exception {
        SignInRequest signInReq = new SignInRequest("teacher@demo.com", "password123", null);
        MvcResult signInResult = mockMvc.perform(post("/api/v1/auth/sign-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signInReq)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(signInResult.getResponse().getContentAsString(), AuthResponse.class);
        String initialRefreshToken = authResponse.refreshToken();

        // Refresh tokens
        RefreshTokenRequest refreshReq = new RefreshTokenRequest(initialRefreshToken);
        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken", not(emptyOrNullString())))
                .andReturn();

        AuthResponse refreshedResponse = objectMapper.readValue(refreshResult.getResponse().getContentAsString(), AuthResponse.class);
        assertNotEquals(initialRefreshToken, refreshedResponse.refreshToken(), "Refresh token must be rotated");

        // Attempting to reuse old refresh token must fail with 401 (rotation protection)
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void signOutRevokesRefreshToken() throws Exception {
        SignInRequest signInReq = new SignInRequest("student@demo.com", "password123", null);
        MvcResult signInResult = mockMvc.perform(post("/api/v1/auth/sign-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signInReq)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(signInResult.getResponse().getContentAsString(), AuthResponse.class);

        // Sign out
        RefreshTokenRequest signOutReq = new RefreshTokenRequest(authResponse.refreshToken());
        mockMvc.perform(post("/api/v1/auth/sign-out")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signOutReq)))
                .andExpect(status().isNoContent());

        // Refreshing after sign-out must fail
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signOutReq)))
                .andExpect(status().isUnauthorized());
    }
}

