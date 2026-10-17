export type AttendanceStrategyType = 'BULK' | 'QR' | 'SIX_DIGIT_CODE';

export type StudentAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface StudentRosterItem {
  id: string;
  name: string;
  rollNumber: string;
  avatarUrl?: string;
  initials: string;
  status: StudentAttendanceStatus;
}

export interface TeacherClassSession {
  id: string;
  subject: string;
  batchName: string;
  timeSlot: string;
  room: string;
  enrolledStudentsCount: number;
  status: 'UPCOMING' | 'LIVE_NOW' | 'COMPLETED';
}

export interface GeneratedSessionCode {
  code: string;
  expiresInSeconds: number;
  qrPayload: string;
}

