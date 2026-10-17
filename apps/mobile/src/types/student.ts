export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  batch: string;
  avatarUrl?: string;
  attendanceRate: number; // e.g. 92
  streakDays: number;
}

export interface StudentClassSession {
  id: string;
  subject: string;
  teacherName: string;
  timeSlot: string;
  room: string;
  status: 'IN_SESSION' | 'UPCOMING' | 'COMPLETED';
  attendanceStatus?: 'PRESENT' | 'ABSENT' | 'PENDING';
}

export interface StudentAttendanceRecord {
  id: string;
  date: string;
  subject: string;
  time: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  method: 'SIX_DIGIT_CODE' | 'QR' | 'BULK_ROSTER';
}

export interface StudentAttendanceStats {
  overallPercentage: number;
  minimumRequiredPercentage: number;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  recentHistory: StudentAttendanceRecord[];
}

