package com.tutorzen.attendance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorzen.attendance.api.dto.StudentAttendanceSubmitRequest;
import com.tutorzen.attendance.domain.AttendanceMethod;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class StudentAttendanceControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void submitAttendanceWithValidSixDigitCodeReturnsSuccess() throws Exception {
        StudentAttendanceSubmitRequest request = new StudentAttendanceSubmitRequest(
            "std-01",
            "session-math-a",
            AttendanceMethod.SIX_DIGIT_CODE,
            "742916",
            null
        );

        mockMvc.perform(post("/api/v1/students/attendance/submit")
                .header("X-Tenant-ID", "tenant-test-01")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success", is(true)))
            .andExpect(jsonPath("$.totalMarked", is(1)))
            .andExpect(jsonPath("$.records[0].studentId", is("std-01")))
            .andExpect(jsonPath("$.records[0].method", is("SIX_DIGIT_CODE")))
            .andExpect(jsonPath("$.records[0].status", is("PRESENT")));
    }

    @Test
    void submitAttendanceWithInvalidCodeReturnsBadRequest() throws Exception {
        StudentAttendanceSubmitRequest request = new StudentAttendanceSubmitRequest(
            "std-01",
            "session-math-a",
            AttendanceMethod.SIX_DIGIT_CODE,
            "99", // Invalid length
            null
        );

        mockMvc.perform(post("/api/v1/students/attendance/submit")
                .header("X-Tenant-ID", "tenant-test-01")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success", is(false)))
            .andExpect(jsonPath("$.errors[0]", containsString("Invalid six-digit code")));
    }

    @Test
    void submitAttendanceWithValidQrTokenReturnsSuccess() throws Exception {
        StudentAttendanceSubmitRequest request = new StudentAttendanceSubmitRequest(
            "std-01",
            "session-math-a",
            AttendanceMethod.QR,
            null,
            "tutorzen://attendance/session/session-math-a?code=742916"
        );

        mockMvc.perform(post("/api/v1/students/attendance/submit")
                .header("X-Tenant-ID", "tenant-test-01")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success", is(true)))
            .andExpect(jsonPath("$.totalMarked", is(1)))
            .andExpect(jsonPath("$.records[0].studentId", is("std-01")))
            .andExpect(jsonPath("$.records[0].method", is("QR")));
    }

    @Test
    void getStudentAttendanceSummaryReturnsAccurateMetrics() throws Exception {
        mockMvc.perform(get("/api/v1/students/std-01/attendance/summary")
                .header("X-Tenant-ID", "tenant-test-01"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.studentId", is("std-01")))
            .andExpect(jsonPath("$.overallPercentage", is(92.0)))
            .andExpect(jsonPath("$.minimumRequiredPercentage", is(75.0)))
            .andExpect(jsonPath("$.totalClasses", is(50)))
            .andExpect(jsonPath("$.presentCount", is(46)))
            .andExpect(jsonPath("$.absentCount", is(4)))
            .andExpect(jsonPath("$.lateCount", is(2)))
            .andExpect(jsonPath("$.recentHistory", hasSize(greaterThanOrEqualTo(3))));
    }
}
