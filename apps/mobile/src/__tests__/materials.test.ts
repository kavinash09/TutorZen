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

  it('should validate file attachment requirement and resolve file details', () => {
    const getFileDetails = (fileName: string, mime?: string) => {
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      if (mime?.includes('pdf') || ext === 'pdf') {
        return { icon: '📕', typeLabel: 'PDF Document', mime: 'application/pdf' };
      }
      if (['doc', 'docx'].includes(ext) || mime?.includes('word')) {
        return { icon: '📘', typeLabel: 'Word Document', mime: 'application/msword' };
      }
      if (['ppt', 'pptx'].includes(ext) || mime?.includes('presentation')) {
        return { icon: '📙', typeLabel: 'PowerPoint Slide', mime: 'application/vnd.ms-powerpoint' };
      }
      if (['png', 'jpg', 'jpeg'].includes(ext) || mime?.includes('image')) {
        return { icon: '🖼️', typeLabel: 'Image File', mime: mime || 'image/jpeg' };
      }
      return { icon: '📄', typeLabel: 'Document File', mime: mime || 'application/octet-stream' };
    };

    assert.strictEqual(getFileDetails('chapter_1.pdf').icon, '📕');
    assert.strictEqual(getFileDetails('notes.docx').icon, '📘');
    assert.strictEqual(getFileDetails('slides.pptx').icon, '📙');
    assert.strictEqual(getFileDetails('scan.png').icon, '🖼️');

    // Auto-suggest title generation from filename
    const autoSuggestTitle = (fileName: string) => {
      const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    };

    assert.strictEqual(autoSuggestTitle('Calculus_Ch4_Integration.pdf'), 'Calculus Ch4 Integration');
    assert.strictEqual(autoSuggestTitle('physics-kinematics-notes.pdf'), 'Physics kinematics notes');

    // Dropzone error validation
    const validateDropzone = (file: { fileName: string } | null) => {
      const hasError = !file;
      return {
        hasError,
        borderColor: hasError ? '#B42318' : '#D4CBBF',
      };
    };

    assert.strictEqual(validateDropzone(null).hasError, true);
    assert.strictEqual(validateDropzone(null).borderColor, '#B42318');
    assert.strictEqual(validateDropzone({ fileName: 'Test.pdf' }).hasError, false);
    assert.strictEqual(validateDropzone({ fileName: 'Test.pdf' }).borderColor, '#D4CBBF');
  });
});

