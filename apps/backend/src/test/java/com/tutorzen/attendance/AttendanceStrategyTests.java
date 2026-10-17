package com.tutorzen.attendance;

import com.tutorzen.attendance.domain.AttendanceMethod;
import com.tutorzen.attendance.domain.AttendanceStatus;
import com.tutorzen.attendance.strategy.AttendanceCommand;
import com.tutorzen.attendance.strategy.AttendanceResult;
import com.tutorzen.attendance.strategy.AttendanceStrategyRegistry;
import com.tutorzen.attendance.strategy.BulkAttendanceStrategy;
import com.tutorzen.attendance.strategy.QrAttendanceStrategy;
import com.tutorzen.attendance.strategy.SixDigitCodeAttendanceStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class AttendanceStrategyTests {

    private AttendanceStrategyRegistry registry;
    private BulkAttendanceStrategy bulkStrategy;
    private QrAttendanceStrategy qrStrategy;
    private SixDigitCodeAttendanceStrategy sixDigitCodeStrategy;

    @BeforeEach
    void setUp() {
        bulkStrategy = new BulkAttendanceStrategy();
        qrStrategy = new QrAttendanceStrategy();
        sixDigitCodeStrategy = new SixDigitCodeAttendanceStrategy();
        registry = new AttendanceStrategyRegistry(List.of(bulkStrategy, qrStrategy, sixDigitCodeStrategy));
    }

    @Test
    void registryResolvesCorrectStrategies() {
        assertSame(bulkStrategy, registry.getStrategy(AttendanceMethod.BULK));
        assertSame(qrStrategy, registry.getStrategy(AttendanceMethod.QR));
        assertSame(sixDigitCodeStrategy, registry.getStrategy(AttendanceMethod.SIX_DIGIT_CODE));
    }

    @Test
    void bulkMarkingSucceedsWithMultipleStudents() {
        Map<String, AttendanceStatus> statuses = Map.of(
            "student-1", AttendanceStatus.PRESENT,
            "student-2", AttendanceStatus.ABSENT,
            "student-3", AttendanceStatus.LATE
        );
        AttendanceCommand cmd = AttendanceCommand.forBulk("tenant-1", "session-101", "teacher-1", statuses);

        AttendanceResult result = bulkStrategy.markAttendance(cmd);

        assertTrue(result.success());
        assertEquals(3, result.totalMarked());
        assertEquals(3, result.records().size());
    }

    @Test
    void bulkMarkingFailsOnEmptyStudentMap() {
        AttendanceCommand cmd = AttendanceCommand.forBulk("tenant-1", "session-101", "teacher-1", Map.of());
        AttendanceResult result = bulkStrategy.markAttendance(cmd);

        assertFalse(result.success());
        assertTrue(result.errors().getFirst().contains("non-empty student statuses map"));
    }

    @Test
    void qrMarkingSucceedsWithValidToken() {
        AttendanceCommand cmd = AttendanceCommand.forQr(
            "tenant-1", "session-101", "teacher-1", "student-1", "VALID-QR-TOKEN-12345"
        );
        AttendanceResult result = qrStrategy.markAttendance(cmd);

        assertTrue(result.success());
        assertEquals(1, result.totalMarked());
        assertEquals(AttendanceMethod.QR, result.records().getFirst().getMethod());
        assertEquals(AttendanceStatus.PRESENT, result.records().getFirst().getStatus());
    }

    @Test
    void qrMarkingFailsWithInvalidToken() {
        AttendanceCommand cmd = AttendanceCommand.forQr(
            "tenant-1", "session-101", "teacher-1", "student-1", "SHORT"
        );
        AttendanceResult result = qrStrategy.markAttendance(cmd);

        assertFalse(result.success());
        assertTrue(result.errors().getFirst().contains("Invalid QR token"));
    }

    @Test
    void sixDigitCodeSucceedsWithExactNumericDigits() {
        AttendanceCommand cmd = AttendanceCommand.forSixDigitCode(
            "tenant-1", "session-101", "teacher-1", "student-1", "482910"
        );
        AttendanceResult result = sixDigitCodeStrategy.markAttendance(cmd);

        assertTrue(result.success());
        assertEquals(1, result.totalMarked());
        assertEquals(AttendanceMethod.SIX_DIGIT_CODE, result.records().getFirst().getMethod());
    }

    @Test
    void sixDigitCodeFailsWithNonNumericOrIncorrectLength() {
        AttendanceCommand shortCodeCmd = AttendanceCommand.forSixDigitCode(
            "tenant-1", "session-101", "teacher-1", "student-1", "12345"
        );
        assertFalse(sixDigitCodeStrategy.markAttendance(shortCodeCmd).success());

        AttendanceCommand alphaCmd = AttendanceCommand.forSixDigitCode(
            "tenant-1", "session-101", "teacher-1", "student-1", "12345A"
        );
        assertFalse(sixDigitCodeStrategy.markAttendance(alphaCmd).success());
    }
}

