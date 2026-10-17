package com.tutorzen.attendance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorzen.academics.domain.Batch;
import com.tutorzen.academics.domain.ClassSession;
import com.tutorzen.academics.domain.Student;
import com.tutorzen.academics.repository.BatchRepository;
import com.tutorzen.academics.repository.ClassSessionRepository;
import com.tutorzen.academics.repository.StudentRepository;
import com.tutorzen.attendance.api.dto.MarkAttendanceRequest;
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

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TeacherSessionPersistenceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClassSessionRepository classSessionRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private JwtService jwtService;

    private String teacherToken;
    private final String tenantId = "tenant-persist-test";
    private final String sessionId = "session-test-persist-01";
    private final String batchId = "batch-test-persist-01";

    @BeforeEach
    void setUp() {
        attendanceRecordRepository.deleteAll();
        classSessionRepository.deleteAll();
        batchRepository.deleteAll();
        studentRepository.deleteAll();

        User teacher = new User(
                "usr-teacher-persist",
                tenantId,
                "teacher.persist@demo.com",
                "Teacher Persist",
                UserRole.TEACHER,
                "ACTIVE",
                Instant.now(),
                Instant.now()
        );
        teacherToken = jwtService.generateAccessToken(teacher);

        Batch batch = new Batch(batchId, tenantId, "sub-math", "Batch Test", "Room A1", 40, Instant.now());
        batchRepository.save(batch);

        ClassSession session = new ClassSession(
                sessionId,
                tenantId,
                batchId,
                teacher.getId(),
                "Mathematics",
                "Batch Test",
                "10:00 AM – 11:00 AM",
                "Room A1",
                "UPCOMING",
                "111111",
                null,
                Instant.now().plusSeconds(3600),
                Instant.now(),
                Instant.now()
        );
        classSessionRepository.save(session);

        studentRepository.save(new Student("std-p1", tenantId, null, "Aditya Test", "Roll #101", "AT", Instant.now()));
        studentRepository.save(new Student("std-p2", tenantId, null, "Ananya Test", "Roll #102", "AnT", Instant.now()));
    }

    @Test
    void getTodaySessionsReturnsDatabaseSessions() throws Exception {
        mockMvc.perform(get("/api/v1/teacher/sessions/today")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(sessionId)))
                .andExpect(jsonPath("$[0].subject", is("Mathematics")))
                .andExpect(jsonPath("$[0].enrolledStudentsCount", is(40)));
    }

    @Test
    void generateSessionCodePersistsToDatabase() throws Exception {
        mockMvc.perform(post("/api/v1/teacher/sessions/" + sessionId + "/attendance/code")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", matchesPattern("^\\d{6}$")));

        ClassSession updatedSession = classSessionRepository.findByIdAndTenantId(sessionId, tenantId).orElseThrow();
        assertNotNull(updatedSession.getSessionCode());
        assertNotEquals("111111", updatedSession.getSessionCode());
        assertNotNull(updatedSession.getQrPayload());
        assertTrue(updatedSession.getExpiresAt().isAfter(Instant.now()));
    }

    @Test
    void markAttendancePersistsRecordsToDatabase() throws Exception {
        MarkAttendanceRequest request = new MarkAttendanceRequest(
                AttendanceMethod.BULK,
                Map.of("std-p1", AttendanceStatus.PRESENT, "std-p2", AttendanceStatus.ABSENT),
                null,
                null,
                null
        );

        mockMvc.perform(post("/api/v1/teacher/sessions/" + sessionId + "/attendance")
                        .header("Authorization", "Bearer " + teacherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.totalMarked", is(2)));

        List<AttendanceRecord> records = attendanceRecordRepository.findByTenantIdAndSessionId(tenantId, sessionId);
        assertEquals(2, records.size());

        AttendanceRecord std1Record = records.stream().filter(r -> r.getStudentId().equals("std-p1")).findFirst().orElseThrow();
        assertEquals(AttendanceStatus.PRESENT, std1Record.getStatus());
        assertEquals("usr-teacher-persist", std1Record.getMarkedBy());

        AttendanceRecord std2Record = records.stream().filter(r -> r.getStudentId().equals("std-p2")).findFirst().orElseThrow();
        assertEquals(AttendanceStatus.ABSENT, std2Record.getStatus());
    }

    @Test
    void getSessionRosterReturnsExplicitIdStudentIdAndStatus() throws Exception {
        mockMvc.perform(get("/api/v1/teacher/sessions/" + sessionId + "/roster")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is("std-p1")))
                .andExpect(jsonPath("$[0].studentId", is("std-p1")))
                .andExpect(jsonPath("$[0].name", is("Aditya Test")))
                .andExpect(jsonPath("$[0].status", is("PRESENT")))
                .andExpect(jsonPath("$[0].defaultStatus", is("PRESENT")))
                .andExpect(jsonPath("$[1].id", is("std-p2")))
                .andExpect(jsonPath("$[1].studentId", is("std-p2")))
                .andExpect(jsonPath("$[1].status", is("PRESENT")));
    }

    @Test
    void markAttendanceSelectivelyMarksIndividualStudentsAndReflectsInRoster() throws Exception {
        // Mark std-p1 as ABSENT, std-p2 remains PRESENT
        MarkAttendanceRequest request = new MarkAttendanceRequest(
                AttendanceMethod.BULK,
                Map.of("std-p1", AttendanceStatus.ABSENT, "std-p2", AttendanceStatus.PRESENT),
                null,
                null,
                null
        );

        mockMvc.perform(post("/api/v1/teacher/sessions/" + sessionId + "/attendance")
                        .header("Authorization", "Bearer " + teacherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Subsequent query to roster must show std-p1 as ABSENT and std-p2 as PRESENT
        mockMvc.perform(get("/api/v1/teacher/sessions/" + sessionId + "/roster")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == 'std-p1')].status", contains("ABSENT")))
                .andExpect(jsonPath("$[?(@.id == 'std-p2')].status", contains("PRESENT")));
    }
}

