package com.tutorzen.attendance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorzen.academics.domain.ClassSession;
import com.tutorzen.academics.domain.Student;
import com.tutorzen.academics.repository.ClassSessionRepository;
import com.tutorzen.academics.repository.StudentRepository;
import com.tutorzen.attendance.api.dto.StudentAttendanceSubmitRequest;
import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceRecord;
import com.tutorzen.attendance.domain.AttendanceRecordRepository;
import com.tutorzen.attendance.domain.AttendanceStatus;
import com.tutorzen.identity.domain.User;
import com.tutorzen.identity.domain.UserRole;
import com.tutorzen.identity.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class StudentAttendancePersistenceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private ClassSessionRepository classSessionRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JwtService jwtService;

    private static final String TENANT_ID = "tenant-student-persist-test";
    private static final String SESSION_ID = "session-student-persist-01";
    private static final String STUDENT_ID = "std-student-persist-01";

    private String studentToken;

    @BeforeEach
    void setUp() {
        attendanceRecordRepository.deleteAll();
        classSessionRepository.deleteAll();
        studentRepository.deleteAll();

        // Create student user & token
        User studentUser = new User(
                "usr-student-persist",
                TENANT_ID,
                "student.persist@demo.com",
                "Student Persist",
                UserRole.STUDENT,
                "ACTIVE",
                Instant.now(),
                Instant.now()
        );
        studentToken = jwtService.generateAccessToken(studentUser);

        // Create student profile
        Student student = new Student(
                STUDENT_ID,
                TENANT_ID,
                studentUser.getId(),
                "Student Persist",
                "Roll #99",
                "SP",
                Instant.now()
        );
        studentRepository.save(student);

        // Ensure active class session exists
        ClassSession session = new ClassSession(
                SESSION_ID,
                TENANT_ID,
                "batch-persist-a",
                "usr-teacher-01",
                "Advanced Calculus",
                "Batch Alpha",
                "10:00 AM - 11:30 AM",
                "Room 101",
                "ACTIVE",
                "987654",
                "tutorzen://attendance/session/" + SESSION_ID + "?code=987654",
                Instant.now().plus(2, ChronoUnit.HOURS),
                Instant.now(),
                Instant.now()
        );
        classSessionRepository.save(session);
    }

    @Test
    void submitAttendance_ValidCode_WritesRecordToDatabase() throws Exception {
        StudentAttendanceSubmitRequest request = new StudentAttendanceSubmitRequest(
                STUDENT_ID,
                SESSION_ID,
                AttendanceMethod.SIX_DIGIT_CODE,
                "987654",
                null
        );

        mockMvc.perform(post("/api/v1/students/attendance/submit")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.totalMarked", is(1)));

        // Verify record in database
        Optional<AttendanceRecord> savedRecord = attendanceRecordRepository
                .findByTenantIdAndSessionIdAndStudentId(TENANT_ID, SESSION_ID, STUDENT_ID);

        assertTrue(savedRecord.isPresent(), "Attendance record must be saved in database");
        assertEquals(AttendanceStatus.PRESENT, savedRecord.get().getStatus());
        assertEquals(AttendanceMethod.SIX_DIGIT_CODE, savedRecord.get().getMethod());
        assertEquals(TENANT_ID, savedRecord.get().getTenantId());
    }

    @Test
    void submitAttendance_ExpiredSession_RejectsSubmission() throws Exception {
        String expiredSessionId = "session-expired-01";
        ClassSession expiredSession = new ClassSession(
                expiredSessionId,
                TENANT_ID,
                "batch-persist-a",
                "usr-teacher-01",
                "Physics Mechanics",
                "Batch Alpha",
                "08:00 AM - 09:30 AM",
                "Room 102",
                "ACTIVE",
                "112233",
                "tutorzen://expired",
                Instant.now().minus(10, ChronoUnit.MINUTES), // Expired 10 mins ago
                Instant.now().minus(2, ChronoUnit.HOURS),
                Instant.now().minus(10, ChronoUnit.MINUTES)
        );
        classSessionRepository.save(expiredSession);

        StudentAttendanceSubmitRequest request = new StudentAttendanceSubmitRequest(
                STUDENT_ID,
                expiredSessionId,
                AttendanceMethod.SIX_DIGIT_CODE,
                "112233",
                null
        );

        mockMvc.perform(post("/api/v1/students/attendance/submit")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.errors[0]", containsString("Session code has expired")));

        // Verify NO record written
        Optional<AttendanceRecord> record = attendanceRecordRepository
                .findByTenantIdAndSessionIdAndStudentId(TENANT_ID, expiredSessionId, STUDENT_ID);
        assertTrue(record.isEmpty(), "No attendance record should be written for expired session");
    }

    @Test
    void submitAttendance_CodeMismatch_RejectsSubmission() throws Exception {
        StudentAttendanceSubmitRequest request = new StudentAttendanceSubmitRequest(
                STUDENT_ID,
                SESSION_ID,
                AttendanceMethod.SIX_DIGIT_CODE,
                "000000", // Wrong code
                null
        );

        mockMvc.perform(post("/api/v1/students/attendance/submit")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.errors[0]", containsString("Code does not match the active session")));
    }

    @Test
    void submitAttendance_DuplicateSubmission_Returns409Conflict() throws Exception {
        // Pre-insert an attendance record for this session
        AttendanceRecord existing = new AttendanceRecord(
                "rec-existing-01",
                TENANT_ID,
                SESSION_ID,
                STUDENT_ID,
                AttendanceStatus.PRESENT,
                AttendanceMethod.SIX_DIGIT_CODE,
                "student-" + STUDENT_ID,
                Instant.now().minus(10, ChronoUnit.MINUTES)
        );
        attendanceRecordRepository.save(existing);

        StudentAttendanceSubmitRequest request = new StudentAttendanceSubmitRequest(
                STUDENT_ID,
                SESSION_ID,
                AttendanceMethod.SIX_DIGIT_CODE,
                "987654", // Valid session code
                null
        );

        mockMvc.perform(post("/api/v1/students/attendance/submit")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.errors[0]", containsString("Attendance already marked for this session")));
    }

    @Test
    void getStudentAttendanceSummary_CalculatesAccurateLivePercentageFromDb() throws Exception {
        // Insert 3 records across distinct sessions: 2 PRESENT, 1 ABSENT
        AttendanceRecord rec1 = new AttendanceRecord("rec-01", TENANT_ID, SESSION_ID + "-1", STUDENT_ID, AttendanceStatus.PRESENT, AttendanceMethod.SIX_DIGIT_CODE, "teacher", Instant.now().minus(2, ChronoUnit.DAYS));
        AttendanceRecord rec2 = new AttendanceRecord("rec-02", TENANT_ID, SESSION_ID + "-2", STUDENT_ID, AttendanceStatus.PRESENT, AttendanceMethod.QR, "teacher", Instant.now().minus(1, ChronoUnit.DAYS));
        AttendanceRecord rec3 = new AttendanceRecord("rec-03", TENANT_ID, SESSION_ID + "-3", STUDENT_ID, AttendanceStatus.ABSENT, AttendanceMethod.BULK, "teacher", Instant.now().minus(3, ChronoUnit.HOURS));

        attendanceRecordRepository.saveAll(List.of(rec1, rec2, rec3));

        // 2 out of 3 = 66.7%
        mockMvc.perform(get("/api/v1/students/" + STUDENT_ID + "/attendance/summary")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId", is(STUDENT_ID)))
                .andExpect(jsonPath("$.studentName", is("Student Persist")))
                .andExpect(jsonPath("$.totalClasses", is(3)))
                .andExpect(jsonPath("$.presentCount", is(2)))
                .andExpect(jsonPath("$.absentCount", is(1)))
                .andExpect(jsonPath("$.overallPercentage", is(66.7)))
                .andExpect(jsonPath("$.recentHistory", hasSize(3)));
    }
}
