import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
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
  const [selectedPreset, setSelectedPreset] = useState<DocumentPreset>(DOCUMENT_PRESETS[0]);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [titleError, setTitleError] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

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
    if (!title.trim()) {
      setTitleError(true);
      setErrorBanner('Please enter a note title before publishing');
      setTimeout(() => setErrorBanner(null), 3500);
      return;
    }

    setTitleError(false);
    const fileName = customFileName.trim() ? customFileName.trim() : selectedPreset.fileName;
    setIsUploading(true);
    setErrorBanner(null);


    try {
      const newMaterial = await apiClient.uploadMaterial({
        subjectId: selectedSubjectId,
        title: title.trim(),
        description: description.trim() || undefined,
        fileName,
        fileType: selectedPreset.fileType,
        fileSizeBytes: selectedPreset.sizeBytes,
      });

      setMaterials((prev) => [newMaterial, ...prev]);
      setTitle('');
      setDescription('');
      setCustomFileName('');
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

          {/* Document Attachment Picker */}
          <View style={{ marginBottom: theme.spacing[4] }}>
            <BodyText variant="xs" weight="semiBold" color={theme.colors.ink.secondary} style={{ marginBottom: 6 }}>
              Select File / Sample Attachment
            </BodyText>

            <View style={styles.presetsContainer}>
              {DOCUMENT_PRESETS.map((preset) => {
                const isSelected = selectedPreset.fileName === preset.fileName;
                return (
                  <TouchableOpacity
                    key={preset.fileName}
                    onPress={() => setSelectedPreset(preset)}
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
                        {preset.fileName}
                      </BodyText>
                      <BodyText variant="xs" color={theme.colors.ink.muted}>
                        {formatFileSize(preset.sizeBytes)} • {preset.fileType.includes('pdf') ? 'PDF Document' : 'Image Scan'}
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
