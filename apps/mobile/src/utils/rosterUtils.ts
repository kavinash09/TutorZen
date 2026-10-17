import { StudentAttendanceStatus, StudentRosterItem } from '../types/teacher';

export interface RawRosterItem {
  id?: string;
  studentId?: string;
  name?: string;
  rollNumber?: string;
  initials?: string;
  status?: string;
  defaultStatus?: string;
}

/**
 * Normalizes raw API or fallback items to a safe StudentRosterItem.
 * Ensures id and status are strictly resolved and never undefined.
 */
export function normalizeRosterItem(raw: RawRosterItem): StudentRosterItem {
  const resolvedId = (raw.id || raw.studentId || '').trim();
  const rawStatus = (raw.status || raw.defaultStatus || 'PRESENT').toUpperCase();
  const validStatus: StudentAttendanceStatus =
    rawStatus === 'ABSENT' || rawStatus === 'LATE' ? (rawStatus as StudentAttendanceStatus) : 'PRESENT';

  return {
    id: resolvedId,
    name: raw.name || 'Unknown Student',
    rollNumber: raw.rollNumber || '',
    initials: raw.initials || (raw.name ? raw.name.slice(0, 2).toUpperCase() : '??'),
    status: validStatus,
  };
}

/**
 * Toggles a single student's status between PRESENT and ABSENT.
 * Strictly guarantees that:
 * 1. An empty or invalid studentId produces NO changes.
 * 2. Only the student whose id matches studentId is updated.
 * 3. All other students preserve their exact status.
 */
export function toggleStudentStatus(
  roster: StudentRosterItem[],
  studentId: string
): StudentRosterItem[] {
  if (!studentId || !studentId.trim()) {
    return roster;
  }

  const targetId = studentId.trim();
  return roster.map((student) => {
    if (student.id === targetId) {
      const nextStatus: StudentAttendanceStatus =
        student.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
      return { ...student, status: nextStatus };
    }
    return student;
  });
}

/**
 * Explicitly sets a single student's status to a specific value (e.g. PRESENT, ABSENT, or LATE).
 * Only the matching student is updated; all other students remain untouched.
 */
export function setStudentStatus(
  roster: StudentRosterItem[],
  studentId: string,
  newStatus: StudentAttendanceStatus
): StudentRosterItem[] {
  if (!studentId || !studentId.trim()) {
    return roster;
  }

  const targetId = studentId.trim();
  return roster.map((student) => {
    if (student.id === targetId) {
      return { ...student, status: newStatus };
    }
    return student;
  });
}

/**
 * Marks all students in the roster to a specific status in bulk.
 */
export function markAllStudents(
  roster: StudentRosterItem[],
  status: StudentAttendanceStatus
): StudentRosterItem[] {
  return roster.map((student) => ({
    ...student,
    status,
  }));
}

/**
 * Calculates current counts of present, absent, late, and total students.
 */
export function calculateRosterCounts(roster: StudentRosterItem[]) {
  const total = roster.length;
  let present = 0;
  let absent = 0;
  let late = 0;

  for (const item of roster) {
    if (item.status === 'PRESENT') present++;
    else if (item.status === 'ABSENT') absent++;
    else if (item.status === 'LATE') late++;
  }

  return { total, present, absent, late };
}

/**
 * Filters the roster by active status tab without mutating roster state.
 */
export function filterRoster(
  roster: StudentRosterItem[],
  filter: 'ALL' | 'PRESENT' | 'ABSENT' | 'LATE'
): StudentRosterItem[] {
  if (filter === 'ALL') return roster;
  return roster.filter((student) => student.status === filter);
}

