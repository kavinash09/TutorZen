import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Heading, BodyText } from '../components/Typography';
import { TactileCard } from '../components/TactileCard';
import { TactileButton } from '../components/TactileButton';
import { apiClient, LearningMaterialItem, SubjectItem } from '../services/apiClient';

export interface UploadNotesScreenProps {
  onNavigateBack: () => void;
  initialSubjectId?: string;
}

interface DocumentPreset {
  fileName: string;
  fileType: string;
  sizeBytes: number;
  label: string;
}

export interface AttachedFile {
  fileName: string;
  fileType: string;
  sizeBytes: number;
  isRealUpload: boolean;
}

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
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext) || mime?.includes('image')) {
    return { icon: '🖼️', typeLabel: 'Image File', mime: mime || 'image/jpeg' };
  }
  return { icon: '📄', typeLabel: 'Document File', mime: mime || 'application/octet-stream' };
};

const DOCUMENT_PRESETS: DocumentPreset[] = [
  {
    fileName: 'Calculus_Ch4_Formulas_Derivations.pdf',
    fileType: 'application/pdf',
    sizeBytes: 2411724,
    label: 'Calculus Chapter 4 Formulas (PDF • 2.3 MB)',
  },
  {
    fileName: 'Algebra_Matrices_Handwritten_Notes.pdf',
    fileType: 'application/pdf',
    sizeBytes: 3840120,
    label: 'Algebra Matrices Notes (PDF • 3.7 MB)',
  },
  {
    fileName: 'Mechanics_Kinematics_Problem_Set.pdf',
    fileType: 'application/pdf',
    sizeBytes: 1540200,
    label: 'Kinematics Practice Problems (PDF • 1.5 MB)',
  },
  {
    fileName: 'Classroom_Blackboard_Derivations.png',
    fileType: 'image/png',
    sizeBytes: 4210000,
    label: 'Blackboard Photo Notes (Image • 4.0 MB)',
  },
];

export const UploadNotesScreen: React.FC<UploadNotesScreenProps> = ({
  onNavigateBack,
  initialSubjectId = 'sub-math-11',
}) => {
  const theme = useTheme();

  // State
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [titleError, setTitleError] = useState<boolean>(false);
  const [fileError, setFileError] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const dropzoneRef = useRef<any>(null);

  const handleSelectedFile = (file: { name: string; size: number; type?: string }) => {
    const details = getFileDetails(file.name, file.type);
    setAttachedFile({
      fileName: file.name,
      fileType: details.mime,
      sizeBytes: file.size,
      isRealUpload: true,
    });
    setFileError(false);

    // Auto-suggest title if user hasn't typed one yet
    if (!title.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .trim();
      const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      setTitle(capitalized);
      setTitleError(false);
    }
  };

  const openFilePicker = () => {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          handleSelectedFile(file);
        }
      };
      input.click();
    }
  };

  // Drag and drop listener on web dropzone
  useEffect(() => {
    if (Platform.OS === 'web' && dropzoneRef.current) {
      const el = dropzoneRef.current;
      const onDragOver = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      };
      const onDragLeave = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      };
      const onDrop = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          handleSelectedFile(files[0]);
        }
      };

      el.addEventListener('dragover', onDragOver);
      el.addEventListener('dragleave', onDragLeave);
      el.addEventListener('drop', onDrop);

      return () => {
        el.removeEventListener('dragover', onDragOver);
        el.removeEventListener('dragleave', onDragLeave);
        el.removeEventListener('drop', onDrop);
      };
    }
  }, [title]);

  // Materials listing
  const [materials, setMaterials] = useState<LearningMaterialItem[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load subjects on mount
  useEffect(() => {
    apiClient.getSubjects().then((res) => {
      setSubjects(res);
      if (res.length > 0 && !res.some((s) => s.id === selectedSubjectId)) {
        setSelectedSubjectId(res[0].id);
      }
    });
  }, []);

  // Load materials when selected subject changes
  const loadMaterials = async () => {
    setIsLoadingMaterials(true);
    try {
      const data = await apiClient.getMaterials(selectedSubjectId);
      setMaterials(data);
    } catch {
      // Fallback handled inside apiClient
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [selectedSubjectId]);

  const handleUpload = async () => {
    let hasError = false;

    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    } else {
      setTitleError(false);
    }

    if (!attachedFile) {
      setFileError(true);
      hasError = true;
    } else {
      setFileError(false);
    }

    if (hasError) {
      setErrorBanner('Please enter a note title and upload/select a file before publishing');
      setTimeout(() => setErrorBanner(null), 3500);
      return;
    }

    setIsUploading(true);
    setErrorBanner(null);

    try {
      const newMaterial = await apiClient.uploadMaterial({
        subjectId: selectedSubjectId,
        title: title.trim(),
        description: description.trim() || undefined,
        fileName: attachedFile!.fileName,
        fileType: attachedFile!.fileType,
        fileSizeBytes: attachedFile!.sizeBytes,
      });

      setMaterials((prev) => [newMaterial, ...prev]);
      setTitle('');
      setDescription('');
      setAttachedFile(null);
      setSuccessBanner(`✓ "${newMaterial.title}" published to student repository!`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: any) {
      setErrorBanner('Failed to upload notes. Please verify connection.');
      setTimeout(() => setErrorBanner(null), 3500);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, noteTitle: string) => {
    setDeletingId(id);
    try {
      await apiClient.deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      setSuccessBanner(`✓ "${noteTitle}" deleted`);
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch {
      setErrorBanner('Failed to delete note');
      setTimeout(() => setErrorBanner(null), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.surface.paper },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface.paper} />

      {/* Top Header Row */}
      <View
        style={[
          styles.topBar,
          {
            paddingHorizontal: theme.spacing[4],
            paddingVertical: theme.spacing[3],
            borderBottomColor: theme.colors.border.subtle,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onNavigateBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <BodyText variant="lead" weight="bold" color={theme.colors.forest[800]}>
            ←
          </BodyText>
        </TouchableOpacity>
        <Heading level={2} style={{ flex: 1, textAlign: 'center', marginRight: 32 }}>
          Upload Notes
        </Heading>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingHorizontal: theme.spacing[4], paddingTop: theme.spacing[4], paddingBottom: 100 },
        ]}
      >
        {/* Banner Feedback */}
        {successBanner && (
          <View
            style={[
              styles.banner,
              {
                backgroundColor: theme.colors.status.successLight,
                borderColor: theme.colors.status.success,
                borderRadius: theme.radii.control,
                marginBottom: theme.spacing[4],
              },
            ]}
          >
            <BodyText variant="sm" color={theme.colors.status.success} weight="semiBold">
              {successBanner}
            </BodyText>
          </View>
        )}

        {errorBanner && (
          <View
            style={[
              styles.banner,
              {
                backgroundColor: theme.colors.status.dangerLight,
                borderColor: theme.colors.status.danger,
                borderRadius: theme.radii.control,
                marginBottom: theme.spacing[4],
              },
            ]}
          >
            <BodyText variant="sm" color={theme.colors.status.danger} weight="semiBold">
              ⚠ {errorBanner}
            </BodyText>
          </View>
        )}

        {/* 1. Subject Selector */}
        <View style={{ marginBottom: theme.spacing[4] }}>
          <BodyText variant="xs" weight="bold" color={theme.colors.forest[800]} style={{ marginBottom: 8 }}>
            TARGET SUBJECT REPOSITORY
          </BodyText>
          <View style={styles.subjectRow}>
            {subjects.map((sub) => {
              const isSelected = sub.id === selectedSubjectId;
              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => setSelectedSubjectId(sub.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.subjectPill,
                    isSelected
                      ? { backgroundColor: theme.colors.forest[800], borderColor: theme.colors.forest[800] }
                      : { backgroundColor: theme.colors.surface.elevated, borderColor: theme.colors.border.subtle },
                  ]}
                >
                  <BodyText
                    variant="sm"
                    weight="semiBold"
                    color={isSelected ? theme.colors.common.white : theme.colors.ink.primary}
                  >
                    {sub.name}
                  </BodyText>
                </TouchableOpacity>
              );
            })}
          </View>
          <BodyText variant="xs" color={theme.colors.ink.muted} style={{ marginTop: 4 }}>
            Notes are accessible to all students enrolled in this subject.
          </BodyText>
        </View>

        {/* 2. Upload Form Card */}
        <TactileCard padding={4} style={{ marginBottom: theme.spacing[5] }}>
          <Heading level={3} style={{ marginBottom: theme.spacing[3] }}>
            New Note / Material Details
          </Heading>

          {/* Title Input */}
          <View style={{ marginBottom: theme.spacing[3] }}>
            <View style={styles.labelRow}>
              <BodyText
                variant="xs"
                weight="semiBold"
                color={titleError ? theme.colors.status.danger : theme.colors.ink.secondary}
              >
                Title / Topic *
              </BodyText>
              {titleError && (
                <BodyText variant="xs" weight="semiBold" color={theme.colors.status.danger}>
                  Required
                </BodyText>
              )}
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: titleError ? theme.colors.status.danger : theme.colors.border.strong,
                  backgroundColor: titleError ? theme.colors.status.dangerLight : theme.colors.surface.paper,
                  borderWidth: titleError ? 1.5 : 1,
                  borderRadius: theme.radii.control,
                  color: theme.colors.ink.primary,
                },
              ]}
              placeholder="e.g. Calculus: Integration by Parts - Lecture 4"
              placeholderTextColor={titleError ? '#B4231888' : theme.colors.ink.muted}
              value={title}
              onChangeText={(val) => {
                setTitle(val);
                if (val.trim()) {
                  setTitleError(false);
                }
              }}
            />
            {titleError && (
              <BodyText variant="xs" color={theme.colors.status.danger} weight="medium" style={{ marginTop: 4 }}>
                ⚠ Title is required to publish notes.
              </BodyText>
            )}
          </View>

          {/* Description Input */}
          <View style={{ marginBottom: theme.spacing[3] }}>
            <BodyText variant="xs" weight="semiBold" color={theme.colors.ink.secondary} style={{ marginBottom: 4 }}>
              Description & Formula Tips (Optional)
            </BodyText>
            <TextInput
              style={[
                styles.textInput,
                styles.textArea,
                {
                  borderColor: theme.colors.border.strong,
                  backgroundColor: theme.colors.surface.paper,
                  borderRadius: theme.radii.control,
                  color: theme.colors.ink.primary,
                },
              ]}
              placeholder="Key notes, homework pointers, or test syllabus details..."
              placeholderTextColor={theme.colors.ink.muted}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* File Upload Section */}
          <View style={{ marginBottom: theme.spacing[4] }}>
            <View style={styles.labelRow}>
              <BodyText
                variant="xs"
                weight="semiBold"
                color={fileError ? theme.colors.status.danger : theme.colors.ink.secondary}
              >
                Upload Document / Notes File *
              </BodyText>
              {fileError && (
                <BodyText variant="xs" weight="semiBold" color={theme.colors.status.danger}>
                  Required
                </BodyText>
              )}
            </View>

            {!attachedFile ? (
              // Empty State: Claymorphic File Upload Dropzone
              <View
                ref={dropzoneRef}
                style={[
                  styles.dropzone,
                  {
                    borderColor: fileError
                      ? theme.colors.status.danger
                      : isDragging
                      ? theme.colors.forest[700]
                      : theme.colors.border.strong,
                    backgroundColor: fileError
                      ? theme.colors.status.dangerLight
                      : isDragging
                      ? theme.colors.forest[50]
                      : theme.colors.surface.elevated,
                    borderRadius: theme.radii.control,
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={openFilePicker}
                  style={styles.dropzoneContent}
                >
                  <View
                    style={[
                      styles.uploadIconCircle,
                      {
                        backgroundColor: fileError
                          ? theme.colors.status.dangerLight
                          : theme.colors.forest[100],
                      },
                    ]}
                  >
                    <BodyText variant="lead">
                      {isDragging ? '📥' : '📤'}
                    </BodyText>
                  </View>

                  <Heading level={3} style={{ marginTop: 4, fontSize: 16 }}>
                    {isDragging ? 'Drop file here' : 'Choose a file or drag & drop'}
                  </Heading>

                  <BodyText
                    variant="xs"
                    color={theme.colors.ink.muted}
                    style={{ marginTop: 4, textAlign: 'center' }}
                  >
                    Supports PDF, DOC, DOCX, PPT, TXT, PNG, JPG (up to 25 MB)
                  </BodyText>

                  <View style={{ marginTop: 12 }}>
                    <TactileButton
                      title="Browse Files"
                      variant="secondary"
                      onPress={openFilePicker}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              // Attached File Preview Card
              <View
                style={[
                  styles.attachedFileCard,
                  {
                    borderColor: theme.colors.forest[500],
                    backgroundColor: theme.colors.forest[50],
                    borderRadius: theme.radii.control,
                  },
                ]}
              >
                <View style={styles.attachedIconBox}>
                  <BodyText variant="lead">
                    {getFileDetails(attachedFile.fileName, attachedFile.fileType).icon}
                  </BodyText>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <BodyText variant="sm" weight="bold" color={theme.colors.forest[950]} numberOfLines={1}>
                    {attachedFile.fileName}
                  </BodyText>
                  <BodyText variant="xs" color={theme.colors.forest[800]} style={{ marginTop: 2 }}>
                    {formatFileSize(attachedFile.sizeBytes)} • {getFileDetails(attachedFile.fileName, attachedFile.fileType).typeLabel}
                  </BodyText>
                  <BodyText variant="xs" weight="semiBold" color={theme.colors.status.success} style={{ marginTop: 4 }}>
                    ✓ File Attached & Ready to Publish
                  </BodyText>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                  <TouchableOpacity
                    onPress={openFilePicker}
                    activeOpacity={0.7}
                    style={[styles.smallActionBtn, { borderColor: theme.colors.forest[700] }]}
                  >
                    <BodyText variant="xs" weight="semiBold" color={theme.colors.forest[800]}>
                      Change
                    </BodyText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAttachedFile(null)}
                    activeOpacity={0.7}
                    style={[styles.smallActionBtn, { borderColor: theme.colors.border.strong }]}
                  >
                    <BodyText variant="xs" weight="semiBold" color={theme.colors.status.danger}>
                      ✕
                    </BodyText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {fileError && (
              <BodyText
                variant="xs"
                color={theme.colors.status.danger}
                weight="medium"
                style={{ marginTop: 4 }}
              >
                ⚠ Please upload or select a notes file to publish.
              </BodyText>
            )}

            {/* Quick Sample Presets Accordion */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPresets(!showPresets)}
              style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}
            >
              <BodyText variant="xs" weight="semiBold" color={theme.colors.forest[800]}>
                {showPresets ? '▼ Hide curriculum sample templates' : '▶ Or choose from sample curriculum templates'}
              </BodyText>
            </TouchableOpacity>

            {showPresets && (
              <View style={[styles.presetsContainer, { marginTop: 8 }]}>
                {DOCUMENT_PRESETS.map((preset) => {
                  const isSelected = attachedFile?.fileName === preset.fileName;
                  return (
                    <TouchableOpacity
                      key={preset.fileName}
                      onPress={() => {
                        setAttachedFile({
                          fileName: preset.fileName,
                          fileType: preset.fileType,
                          sizeBytes: preset.sizeBytes,
                          isRealUpload: false,
                        });
                        setFileError(false);
                        if (!title.trim()) {
                          setTitle(preset.label.split('(')[0].trim());
                          setTitleError(false);
                        }
                      }}
                      activeOpacity={0.7}
                      style={[
                        styles.presetItem,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.forest[50]
                            : theme.colors.surface.muted,
                          borderColor: isSelected
                            ? theme.colors.forest[700]
                            : theme.colors.border.subtle,
                          borderRadius: theme.radii.control,
                        },
                      ]}
                    >
                      <BodyText variant="sm">
                        {preset.fileType.includes('pdf') ? '📕' : '🖼️'}
                      </BodyText>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <BodyText
                          variant="xs"
                          weight={isSelected ? 'bold' : 'regular'}
                          color={isSelected ? theme.colors.forest[950] : theme.colors.ink.primary}
                        >
                          {preset.label}
                        </BodyText>
                        <BodyText variant="xs" color={theme.colors.ink.muted}>
                          {preset.fileName}
                        </BodyText>
                      </View>
                      {isSelected && (
                        <BodyText variant="xs" weight="bold" color={theme.colors.forest[800]}>
                          ✓ Selected
                        </BodyText>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Publish Button */}
          <TactileButton
            title={isUploading ? 'Publishing Notes...' : 'Publish to Students'}
            variant="primary"
            disabled={isUploading}
            onPress={handleUpload}
          />
        </TactileCard>

        {/* 3. Published Notes Repository Section */}
        <View style={styles.sectionHeaderRow}>
          <Heading level={2}>Published Notes</Heading>
          <BodyText variant="xs" color={theme.colors.ink.muted}>
            {materials.length} available
          </BodyText>
        </View>

        {isLoadingMaterials ? (
          <View style={{ paddingVertical: theme.spacing[8], alignItems: 'center' }}>
            <ActivityIndicator size="small" color={theme.colors.forest[800]} />
            <BodyText variant="sm" color={theme.colors.ink.muted} style={{ marginTop: 8 }}>
              Loading subject notes...
            </BodyText>
          </View>
        ) : materials.length === 0 ? (
          <TactileCard padding={4} style={{ marginTop: theme.spacing[3], alignItems: 'center' }}>
            <BodyText variant="lead">📚</BodyText>
            <BodyText variant="sm" color={theme.colors.ink.muted} style={{ marginTop: 4 }}>
              No notes uploaded yet for this subject.
            </BodyText>
          </TactileCard>
        ) : (
          <View style={{ marginTop: theme.spacing[3] }}>
            {materials.map((mat) => (
              <TactileCard key={mat.id} padding={3} style={styles.materialCard}>
                <View style={styles.materialIconBox}>
                  <BodyText variant="base">
                    {mat.fileType.includes('image') ? '🖼️' : '📕'}
                  </BodyText>
                </View>

                <View style={{ flex: 1, marginLeft: theme.spacing[3] }}>
                  <View style={styles.materialBadgeRow}>
                    <View style={[styles.subjectTag, { backgroundColor: theme.colors.forest[100] }]}>
                      <BodyText variant="xs" color={theme.colors.forest[800]} weight="bold">
                        {mat.subjectName}
                      </BodyText>
                    </View>
                    <BodyText variant="xs" color={theme.colors.ink.muted}>
                      {formatDate(mat.createdAt)}
                    </BodyText>
                  </View>

                  <Heading level={3} style={{ marginTop: 2 }}>
                    {mat.title}
                  </Heading>

                  {mat.description && (
                    <BodyText variant="xs" color={theme.colors.ink.secondary} style={{ marginTop: 2 }}>
                      {mat.description}
                    </BodyText>
                  )}

                  <View style={styles.fileDetailsRow}>
                    <BodyText variant="xs" color={theme.colors.ink.muted}>
                      📎 {mat.fileName} • {formatFileSize(mat.fileSizeBytes)}
                    </BodyText>
                  </View>
                </View>

                {/* Delete Action Button */}
                <TouchableOpacity
                  onPress={() => handleDelete(mat.id, mat.title)}
                  disabled={deletingId === mat.id}
                  activeOpacity={0.7}
                  style={styles.deleteButton}
                >
                  {deletingId === mat.id ? (
                    <ActivityIndicator size="small" color={theme.colors.status.danger} />
                  ) : (
                    <BodyText variant="xs" color={theme.colors.status.danger} weight="bold">
                      ✕
                    </BodyText>
                  )}
                </TouchableOpacity>
              </TactileCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  banner: {
    padding: 12,
    borderWidth: 1,
  },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  presetsContainer: {
    gap: 8,
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  attachedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
  },
  attachedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  materialIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F0E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  materialBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fileDetailsRow: {
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
