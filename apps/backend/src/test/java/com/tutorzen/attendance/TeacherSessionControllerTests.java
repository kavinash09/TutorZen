package com.tutorzen.attendance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorzen.attendance.api.dto.MarkAttendanceRequest;
import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceStatus;
import com.tutorzen.attendancesync.SyncSubmission;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class TeacherSessionControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getTodaySessionsReturnsSessionList() throws Exception {
        mockMvc.perform(get("/api/v1/teacher/sessions/today")
                .header("X-Tenant-ID", "tenant-test-01"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))))
            .andExpect(jsonPath("$[0].subject", is("Mathematics")));
    }

    @Test
    void getSessionRosterReturnsStudentList() throws Exception {
        mockMvc.perform(get("/api/v1/teacher/sessions/session-math-a/roster")
                .header("X-Tenant-ID", "tenant-test-01"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))))
            .andExpect(jsonPath("$[0].name", is("Aditya Kumar")));
    }

    @Test
    void markBulkAttendanceSuccessfullyReturnsResult() throws Exception {
        MarkAttendanceRequest request = new MarkAttendanceRequest(
            AttendanceMethod.BULK,
            Map.of("std-01", AttendanceStatus.PRESENT, "std-02", AttendanceStatus.ABSENT),
            null,
            null,
            null
        );

        mockMvc.perform(post("/api/v1/teacher/sessions/session-math-a/attendance")
                .header("X-Tenant-ID", "tenant-test-01")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success", is(true)))
            .andExpect(jsonPath("$.totalMarked", is(2)));
    }

    @Test
    void generateSessionCodeReturnsSixDigitPin() throws Exception {
        mockMvc.perform(post("/api/v1/teacher/sessions/session-math-a/attendance/code")
                .header("X-Tenant-ID", "tenant-test-01"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code", matchesPattern("^\\d{6}$")))
            .andExpect(jsonPath("$.expiresInSeconds", is(300)));
    }

    @Test
    void syncOfflineSubmissionsReturnsOutcomes() throws Exception {
        List<SyncSubmission> submissions = List.of(
            new SyncSubmission(
                "sync-key-001",
                "tenant-test-01",
                "session-math-a",
                "std-01",
                AttendanceStatus.PRESENT,
                AttendanceMethod.QR,
                "teacher-1",
                Instant.now()
            )
        );

        mockMvc.perform(post("/api/v1/teacher/sessions/session-math-a/attendance/sync")
                .header("X-Tenant-ID", "tenant-test-01")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(submissions)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].status", is("APPLIED")));
    }
}

