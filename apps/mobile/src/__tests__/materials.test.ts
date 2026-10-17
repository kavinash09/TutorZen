import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LearningMaterialItem } from '../services/apiClient';

describe('Learning Materials & Notes Workflow', () => {
  const sampleMaterials: LearningMaterialItem[] = [
    {
      id: 'mat-01',
      subjectId: 'sub-math-11',
      subjectName: 'Mathematics',
      title: 'Calculus: Integration by Parts & Formulas',
      description: 'Comprehensive formula guide',
      fileName: 'Calculus_Ch4_Integration_Formulas.pdf',
      fileType: 'application/pdf',
      fileSizeBytes: 2411724,
      uploadedBy: 'usr-teacher-01',
      uploaderName: 'Principal Teacher',
      createdAt: '2026-10-15T10:00:00Z',
    },
    {
      id: 'mat-02',
      subjectId: 'sub-phy-11',
      subjectName: 'Physics',
      title: 'Kinematics: 2D Projectile Motion Notes',
      description: 'Key derivations and practice set',
      fileName: 'Kinematics_Lecture_02.pdf',
      fileType: 'application/pdf',
      fileSizeBytes: 1540200,
      uploadedBy: 'usr-teacher-01',
      uploaderName: 'Principal Teacher',
      createdAt: '2026-10-16T11:00:00Z',
    },
  ];

  it('should filter notes by subject correctly', () => {
    const mathNotes = sampleMaterials.filter((m) => m.subjectId === 'sub-math-11');
    assert.strictEqual(mathNotes.length, 1);
    assert.strictEqual(mathNotes[0].title, 'Calculus: Integration by Parts & Formulas');

    const phyNotes = sampleMaterials.filter((m) => m.subjectId === 'sub-phy-11');
    assert.strictEqual(phyNotes.length, 1);
    assert.strictEqual(phyNotes[0].title, 'Kinematics: 2D Projectile Motion Notes');
  });

  it('should format file size accurately into human-readable string', () => {
    const formatBytes = (bytes: number) => {
      if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      }
      return `${Math.round(bytes / 1024)} KB`;
    };

    assert.strictEqual(formatBytes(2411724), '2.3 MB');
    assert.strictEqual(formatBytes(1540200), '1.5 MB');
    assert.strictEqual(formatBytes(512000), '500 KB');
  });

  it('should validate required upload payload fields', () => {
    const isValidPayload = (p: { title?: string; subjectId?: string; fileName?: string }) => {
      return Boolean(p.title?.trim() && p.subjectId?.trim() && p.fileName?.trim());
    };

    assert.strictEqual(isValidPayload({ title: 'Math Notes', subjectId: 'sub-math-11', fileName: 'Notes.pdf' }), true);
    assert.strictEqual(isValidPayload({ title: '', subjectId: 'sub-math-11', fileName: 'Notes.pdf' }), false);
    assert.strictEqual(isValidPayload({ title: 'Math Notes', subjectId: '', fileName: 'Notes.pdf' }), false);
  });

  it('should flag titleError when title is blank or whitespace, and clear on user input', () => {
    const validateTitle = (val: string) => {
      const hasError = !val.trim();
      return {
        hasError,
        borderColor: hasError ? '#B42318' : '#D4CBBF',
        backgroundColor: hasError ? '#FEE4E2' : '#FDFBF7',
      };
    };

    // Blank or whitespace triggers red border & danger light background
    const emptyResult = validateTitle('');
    assert.strictEqual(emptyResult.hasError, true);
    assert.strictEqual(emptyResult.borderColor, '#B42318');
    assert.strictEqual(emptyResult.backgroundColor, '#FEE4E2');

    const whitespaceResult = validateTitle('   ');
    assert.strictEqual(whitespaceResult.hasError, true);
    assert.strictEqual(whitespaceResult.borderColor, '#B42318');

    // Providing a valid title clears error and restores standard styling
    const filledResult = validateTitle('Calculus Lecture 1');
    assert.strictEqual(filledResult.hasError, false);
    assert.strictEqual(filledResult.borderColor, '#D4CBBF');
    assert.strictEqual(filledResult.backgroundColor, '#FDFBF7');
  });
});

