import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  normalizeRosterItem,
  toggleStudentStatus,
  setStudentStatus,
  markAllStudents,
  calculateRosterCounts,
  filterRoster,
} from '../utils/rosterUtils';
import { StudentRosterItem } from '../types/teacher';

describe('Roster Utilities & Attendance State Machine', () => {
  const initialRoster: StudentRosterItem[] = [
    { id: 'std-01', name: 'Aditya Kumar', rollNumber: 'Roll #101', initials: 'AK', status: 'PRESENT' },
    { id: 'std-02', name: 'Ananya Verma', rollNumber: 'Roll #102', initials: 'AV', status: 'PRESENT' },
    { id: 'std-03', name: 'Rohan Sharma', rollNumber: 'Roll #103', initials: 'RS', status: 'ABSENT' },
    { id: 'std-04', name: 'Neha Singh', rollNumber: 'Roll #104', initials: 'NS', status: 'PRESENT' },
  ];

  describe('normalizeRosterItem', () => {
    it('should correctly resolve id and status when using standard backend DTO', () => {
      const item = normalizeRosterItem({
        id: 'std-01',
        name: 'Aditya Kumar',
        rollNumber: 'Roll #101',
        initials: 'AK',
        status: 'PRESENT',
      });

      assert.strictEqual(item.id, 'std-01');
      assert.strictEqual(item.status, 'PRESENT');
      assert.strictEqual(item.name, 'Aditya Kumar');
    });

    it('should support studentId and defaultStatus aliases', () => {
      const item = normalizeRosterItem({
        studentId: 'std-02',
        name: 'Ananya Verma',
        rollNumber: 'Roll #102',
        defaultStatus: 'ABSENT',
      });

      assert.strictEqual(item.id, 'std-02');
      assert.strictEqual(item.status, 'ABSENT');
      assert.strictEqual(item.initials, 'AN');
    });

    it('should fallback safely when id is missing or empty', () => {
      const item = normalizeRosterItem({
        name: 'Guest Student',
      });

      assert.strictEqual(item.id, '');
      assert.strictEqual(item.status, 'PRESENT');
    });
  });

  describe('toggleStudentStatus', () => {
    it('should toggle ONLY the targeted student from PRESENT to ABSENT', () => {
      const updated = toggleStudentStatus(initialRoster, 'std-01');

      // std-01 should be toggled to ABSENT
      const std1 = updated.find((s) => s.id === 'std-01');
      assert.strictEqual(std1?.status, 'ABSENT');

      // All other students must remain untouched
      const std2 = updated.find((s) => s.id === 'std-02');
      assert.strictEqual(std2?.status, 'PRESENT');

      const std3 = updated.find((s) => s.id === 'std-03');
      assert.strictEqual(std3?.status, 'ABSENT');

      const std4 = updated.find((s) => s.id === 'std-04');
      assert.strictEqual(std4?.status, 'PRESENT');
    });

    it('should toggle ONLY the targeted student from ABSENT to PRESENT', () => {
      const updated = toggleStudentStatus(initialRoster, 'std-03');

      // std-03 should be toggled to PRESENT
      const std3 = updated.find((s) => s.id === 'std-03');
      assert.strictEqual(std3?.status, 'PRESENT');

      // All other students must remain untouched
      const std1 = updated.find((s) => s.id === 'std-01');
      assert.strictEqual(std1?.status, 'PRESENT');
    });

    it('should NEVER toggle all students when studentId is empty or undefined', () => {
      const updatedEmpty = toggleStudentStatus(initialRoster, '');
      assert.deepStrictEqual(updatedEmpty, initialRoster);

      const updatedWhitespace = toggleStudentStatus(initialRoster, '   ');
      assert.deepStrictEqual(updatedWhitespace, initialRoster);
    });

    it('should leave roster unchanged when studentId does not exist', () => {
      const updated = toggleStudentStatus(initialRoster, 'non-existent-id');
      assert.deepStrictEqual(updated, initialRoster);
    });
  });

  describe('setStudentStatus', () => {
    it('should set targeted student status explicitly to ABSENT without affecting others', () => {
      const updated = setStudentStatus(initialRoster, 'std-02', 'ABSENT');

      assert.strictEqual(updated.find((s) => s.id === 'std-02')?.status, 'ABSENT');
      assert.strictEqual(updated.find((s) => s.id === 'std-01')?.status, 'PRESENT');
      assert.strictEqual(updated.find((s) => s.id === 'std-03')?.status, 'ABSENT');
      assert.strictEqual(updated.find((s) => s.id === 'std-04')?.status, 'PRESENT');
    });

    it('should set targeted student status explicitly to LATE', () => {
      const updated = setStudentStatus(initialRoster, 'std-01', 'LATE');

      assert.strictEqual(updated.find((s) => s.id === 'std-01')?.status, 'LATE');
      assert.strictEqual(updated.find((s) => s.id === 'std-02')?.status, 'PRESENT');
    });
  });

  describe('markAllStudents', () => {
    it('should mark all students as PRESENT', () => {
      const updated = markAllStudents(initialRoster, 'PRESENT');
      assert.strictEqual(updated.every((s) => s.status === 'PRESENT'), true);
      assert.strictEqual(updated.length, initialRoster.length);
    });

    it('should mark all students as ABSENT', () => {
      const updated = markAllStudents(initialRoster, 'ABSENT');
      assert.strictEqual(updated.every((s) => s.status === 'ABSENT'), true);
      assert.strictEqual(updated.length, initialRoster.length);
    });
  });

  describe('calculateRosterCounts', () => {
    it('should accurately calculate total, present, absent, and late counts', () => {
      const counts = calculateRosterCounts(initialRoster);
      assert.strictEqual(counts.total, 4);
      assert.strictEqual(counts.present, 3);
      assert.strictEqual(counts.absent, 1);
      assert.strictEqual(counts.late, 0);
    });
  });

  describe('filterRoster', () => {
    it('should return only present students when filter is PRESENT', () => {
      const filtered = filterRoster(initialRoster, 'PRESENT');
      assert.strictEqual(filtered.length, 3);
      assert.strictEqual(filtered.every((s) => s.status === 'PRESENT'), true);
    });

    it('should return only absent students when filter is ABSENT', () => {
      const filtered = filterRoster(initialRoster, 'ABSENT');
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].id, 'std-03');
    });

    it('should return all students when filter is ALL', () => {
      const filtered = filterRoster(initialRoster, 'ALL');
      assert.strictEqual(filtered.length, 4);
    });
  });
});

