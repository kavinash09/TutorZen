import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'qrcode';
import { useTheme } from '../theme/ThemeContext';
import { Heading, BodyText } from '../components/Typography';
import { TactileCard } from '../components/TactileCard';
import { TactileButton } from '../components/TactileButton';
import { SegmentedControl } from '../components/SegmentedControl';
import {
  AttendanceStrategyType,
  StudentRosterItem,
  StudentAttendanceStatus,
} from '../types/teacher';

export interface MarkAttendanceScreenProps {
  sessionId?: string;
  onNavigateBack: () => void;
  sharedSessionCode?: string;
  onSessionCodeChange?: (newCode: string) => void;
  isSessionExpired?: boolean;
  onSessionExpiryChange?: (isExpired: boolean) => void;
  studentAttendanceMarked?: boolean;
}

export const MarkAttendanceScreen: React.FC<MarkAttendanceScreenProps> = ({
  sessionId = 'session-math-a',
  onNavigateBack,
  sharedSessionCode = '742916',
  onSessionCodeChange,
  isSessionExpired = false,
  onSessionExpiryChange,
  studentAttendanceMarked = false,
}) => {
  const theme = useTheme();

  // Active Marking Strategy
  const [strategy, setStrategy] = useState<AttendanceStrategyType>('BULK');

  // Filter in Bulk Mode: 'ALL' | 'PRESENT' | 'ABSENT'
  const [filter, setFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');

  // Unified Session Verification Pass (ADR-0002 & ADR-0004)
  // Both the 6-Digit PIN and the QR Code share the exact same underlying pass and expiration
  const SESSION_TTL_SECONDS = 300; // 5 minutes tenant validity
  const [sessionCode, setSessionCode] = useState<string>(sharedSessionCode);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number>(() =>
    isSessionExpired ? Date.now() - 1000 : Date.now() + SESSION_TTL_SECONDS * 1000
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(isSessionExpired ? 0 : SESSION_TTL_SECONDS);

  // Success Feedback Banner
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Initial Student Roster (Mock realistic coaching batch)
  const [roster, setRoster] = useState<StudentRosterItem[]>([
    { id: 'std-01', name: 'Aditya Kumar', rollNumber: 'Roll #101', initials: 'AK', status: 'PRESENT' },
    { id: 'std-02', name: 'Ananya Verma', rollNumber: 'Roll #102', initials: 'AV', status: 'PRESENT' },
    { id: 'std-03', name: 'Rohan Sharma', rollNumber: 'Roll #103', initials: 'RS', status: 'ABSENT' },
    { id: 'std-04', name: 'Neha Singh', rollNumber: 'Roll #104', initials: 'NS', status: 'PRESENT' },
    { id: 'std-05', name: 'Aryan Shah', rollNumber: 'Roll #105', initials: 'AS', status: 'PRESENT' },
    { id: 'std-06', name: 'Kavya Patel', rollNumber: 'Roll #106', initials: 'KP', status: 'PRESENT' },
    { id: 'std-07', name: 'Tanvi Joshi', rollNumber: 'Roll #107', initials: 'TJ', status: 'ABSENT' },
    { id: 'std-08', name: 'Vikram Reddy', rollNumber: 'Roll #108', initials: 'VR', status: 'PRESENT' },
  ]);

  // Unified pass generator: builds QR matrix and syncs 6-digit PIN & expiration
  const generateUnifiedPass = async (codeToUse: string, ttl: number = SESSION_TTL_SECONDS) => {
    const expiresAt = Date.now() + ttl * 1000;
    const qrPayload = `tutorzen://attendance/session/${sessionId}?code=${codeToUse}&exp=${Math.floor(expiresAt / 1000)}`;

    try {
      const url = await QRCode.toDataURL(qrPayload, {
        width: 240,
        margin: 1,
        color: {
          dark: '#14351A', // Forest 950
          light: '#FFFFFF',
        },
      });
      setSessionCode(codeToUse);
      setQrDataUrl(url);
      setSessionExpiresAt(expiresAt);
      setSecondsLeft(ttl);
      onSessionCodeChange?.(codeToUse);
      onSessionExpiryChange?.(false);
    } catch (err) {
      console.error('Failed to generate unified QR code', err);
    }
  };

  // Initial generation
  useEffect(() => {
    generateUnifiedPass(sharedSessionCode);
  }, [sessionId, sharedSessionCode]);

  // Single unified countdown timer for session validity across both QR and 6-Digit views
  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.floor((sessionExpiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        onSessionExpiryChange?.(true);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sessionExpiresAt]);

  const handleRegenerateSessionPass = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    generateUnifiedPass(newCode);
    setSaveBanner(`✓ Session PIN & QR synchronized: ${newCode} (valid for 5 mins)`);
    setTimeout(() => {
      setSaveBanner(null);
    }, 3500);
  };

  // Derived counts
  const totalCount = roster.length;
  const presentCount = roster.filter((r) => r.status === 'PRESENT').length;
  const absentCount = roster.filter((r) => r.status === 'ABSENT').length;

  const toggleStudentStatus = (id: string) => {
    setRoster((prev) =>
      prev.map((student) => {
        if (student.id === id) {
          const nextStatus: StudentAttendanceStatus =
            student.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
          return { ...student, status: nextStatus };
        }
        return student;
      })
    );
  };

  const markAllPresent = () => {
    setRoster((prev) => prev.map((s) => ({ ...s, status: 'PRESENT' })));
  };

  const handleSaveAttendance = () => {
    const summary = `Attendance recorded for ${presentCount} present, ${absentCount} absent students.`;
    setSaveBanner(summary);
    setTimeout(() => {
      setSaveBanner(null);
    }, 4000);
  };

  const filteredRoster = roster.filter((student) => {
    if (filter === 'PRESENT') return student.status === 'PRESENT';
    if (filter === 'ABSENT') return student.status === 'ABSENT';
    return true;
  });

  const isExpired = secondsLeft <= 0;

  const simulateExpiry = () => {
    setSessionExpiresAt(Date.now() - 1000);
    setSecondsLeft(0);
    onSessionExpiryChange?.(true);
  };

  const formatTimer = (seconds: number) => {
    if (seconds <= 0) return '0:00 (Expired)';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
          Mark Attendance
        </Heading>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingHorizontal: theme.spacing[4], paddingTop: theme.spacing[3], paddingBottom: 100 },
        ]}
      >
        {/* Session Metadata Card */}
        <TactileCard padding={4} style={{ marginBottom: theme.spacing[4] }}>
          <View style={styles.sessionHeaderRow}>
            <View
              style={[
                styles.subjectPill,
                { backgroundColor: theme.colors.forest[100] },
              ]}
            >
              <BodyText variant="xs" color={theme.colors.forest[800]} weight="bold">
                BATCH 11-A
              </BodyText>
            </View>
            <BodyText variant="xs" color={theme.colors.ink.muted}>
              Room A1
            </BodyText>
          </View>
          <Heading level={2} style={{ marginTop: theme.spacing[2] }}>
            Mathematics – Batch A
          </Heading>
          <BodyText variant="sm" color={theme.colors.ink.muted} style={{ marginTop: 2 }}>
            Wednesday, 15 Oct 2026 • 10:00 AM – 11:00 AM
          </BodyText>
        </TactileCard>

        {/* Strategy Switcher */}
        <View style={{ marginBottom: theme.spacing[4] }}>
          <BodyText variant="xs" weight="bold" color={theme.colors.forest[700]} style={{ marginBottom: 6 }}>
            ATTENDANCE METHOD (STRATEGY PATTERN)
          </BodyText>
          <SegmentedControl
            options={[
              { value: 'BULK', label: 'Bulk Roster' },
              { value: 'QR', label: 'QR Code' },
              { value: 'SIX_DIGIT_CODE', label: '6-Digit PIN' },
            ]}
            selected={strategy}
            onChange={(val) => setStrategy(val)}
          />
        </View>

        {/* Success Alert Banner */}
        {saveBanner && (
          <View
            style={[
              styles.successBanner,
              {
                backgroundColor: theme.colors.status.successLight,
                borderColor: theme.colors.status.success,
                borderRadius: theme.radii.control,
                padding: theme.spacing[3],
                marginBottom: theme.spacing[4],
              },
            ]}
          >
            <BodyText variant="sm" color={theme.colors.status.success} weight="semiBold">
              ✓ {saveBanner}
            </BodyText>
          </View>
        )}

        {/* MODE 1: BULK ROSTER MARKING */}
        {strategy === 'BULK' && (
          <View>
            {/* Filter Pills & Fast Actions */}
            <View style={styles.filterRow}>
              <View style={styles.filterGroup}>
                <TouchableOpacity
                  onPress={() => setFilter('ALL')}
                  activeOpacity={0.7}
                  style={[
                    styles.pill,
                    filter === 'ALL'
                      ? { backgroundColor: theme.colors.forest[800] }
                      : { backgroundColor: theme.colors.surface.muted },
                  ]}
                >
                  <BodyText
                    variant="xs"
                    weight="bold"
                    color={filter === 'ALL' ? theme.colors.common.white : theme.colors.ink.primary}
                  >
                    All {totalCount}
                  </BodyText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFilter('PRESENT')}
                  activeOpacity={0.7}
                  style={[
                    styles.pill,
                    filter === 'PRESENT'
                      ? { backgroundColor: theme.colors.status.success }
                      : { backgroundColor: theme.colors.status.successLight },
                  ]}
                >
                  <BodyText
                    variant="xs"
                    weight="bold"
                    color={filter === 'PRESENT' ? theme.colors.common.white : theme.colors.status.success}
                  >
                    Present {presentCount}
                  </BodyText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFilter('ABSENT')}
                  activeOpacity={0.7}
                  style={[
                    styles.pill,
                    filter === 'ABSENT'
                      ? { backgroundColor: theme.colors.status.danger }
                      : { backgroundColor: theme.colors.status.dangerLight },
                  ]}
                >
                  <BodyText
                    variant="xs"
                    weight="bold"
                    color={filter === 'ABSENT' ? theme.colors.common.white : theme.colors.status.danger}
                  >
                    Absent {absentCount}
                  </BodyText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={markAllPresent} activeOpacity={0.7}>
                <BodyText variant="xs" weight="semiBold" color={theme.colors.forest[800]}>
                  Mark All Present
                </BodyText>
              </TouchableOpacity>
            </View>

            {/* Student Roster List */}
            <View style={{ marginTop: theme.spacing[3] }}>
              {filteredRoster.map((student) => {
                const isPresent = student.status === 'PRESENT';

                return (
                  <TouchableOpacity
                    key={student.id}
                    onPress={() => toggleStudentStatus(student.id)}
                    activeOpacity={0.8}
                    style={{ marginBottom: theme.spacing[2] }}
                  >
                    <TactileCard padding={3} style={styles.studentCard}>
                      {/* Avatar */}
                      <View
                        style={[
                          styles.studentAvatar,
                          {
                            backgroundColor: isPresent
                              ? theme.colors.forest[100]
                              : theme.colors.status.dangerLight,
                          },
                        ]}
                      >
                        <BodyText
                          variant="sm"
                          weight="bold"
                          color={isPresent ? theme.colors.forest[800] : theme.colors.status.danger}
                        >
                          {student.initials}
                        </BodyText>
                      </View>

                      {/* Name & Roll */}
                      <View style={{ flex: 1, marginLeft: theme.spacing[3] }}>
                        <Heading level={3}>{student.name}</Heading>
                        <BodyText variant="xs" color={theme.colors.ink.muted}>
                          {student.rollNumber}
                        </BodyText>
                      </View>

                      {/* Status Label */}
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isPresent
                              ? theme.colors.status.successLight
                              : theme.colors.status.dangerLight,
                          },
                        ]}
                      >
                        <BodyText
                          variant="xs"
                          weight="semiBold"
                          color={isPresent ? theme.colors.status.success : theme.colors.status.danger}
                        >
                          {student.status}
                        </BodyText>
                      </View>

                      {/* Tactile Checkbox */}
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isPresent
                              ? theme.colors.forest[800]
                              : theme.colors.surface.paper,
                            borderColor: isPresent
                              ? theme.colors.forest[800]
                              : theme.colors.border.strong,
                          },
                        ]}
                      >
                        {isPresent && (
                          <BodyText variant="xs" color={theme.colors.common.white} weight="bold">
                            ✓
                          </BodyText>
                        )}
                      </View>
                    </TactileCard>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* MODE 2: QR CODE STRATEGY */}
        {strategy === 'QR' && (
          <TactileCard raised padding={5} style={styles.qrCard}>
            <Heading level={2} style={{ textAlign: 'center' }}>
              Class Attendance QR
            </Heading>
            <BodyText variant="sm" color={theme.colors.ink.muted} style={{ textAlign: 'center', marginTop: 4 }}>
              Display this on classroom screen or projector for students to scan
            </BodyText>

            {/* Stylized Claymorphic QR Representation */}
            {/* Real Rendered QR Code */}
            {/* Real Rendered QR Code with Expiration Protection */}
            <View
              style={[
                styles.qrGraphicWrap,
                {
                  backgroundColor: theme.colors.common.white,
                  borderColor: isExpired ? theme.colors.status.danger : theme.colors.border.subtle,
                  borderRadius: theme.radii.card,
                  marginTop: theme.spacing[4],
                },
              ]}
            >
              {qrDataUrl ? (
                <Image
                  source={{ uri: qrDataUrl }}
                  style={[styles.qrImage, isExpired && styles.qrImageExpired]}
                  resizeMode="contain"
                />
              ) : (
                <ActivityIndicator size="large" color={theme.colors.forest[800]} />
              )}

              {/* Expired Visual Overlay */}
              {isExpired && (
                <View style={styles.qrExpiredOverlay}>
                  <BodyText variant="lead">⚠️</BodyText>
                  <BodyText
                    variant="sm"
                    weight="bold"
                    color={theme.colors.status.danger}
                    style={{ marginTop: 4 }}
                  >
                    QR CODE EXPIRED
                  </BodyText>
                  <BodyText
                    variant="xs"
                    color={theme.colors.ink.secondary}
                    style={{ textAlign: 'center', marginTop: 4, paddingHorizontal: 12 }}
                  >
                    Attendance window closed. Tap below to generate a new valid QR code.
                  </BodyText>
                </View>
              )}
            </View>

            <View
              style={[
                styles.syncedPinBanner,
                {
                  backgroundColor: isExpired
                    ? theme.colors.status.dangerLight
                    : theme.colors.forest[50],
                  borderColor: isExpired
                    ? theme.colors.status.danger
                    : theme.colors.forest[100],
                  borderRadius: theme.radii.control,
                  paddingHorizontal: theme.spacing[3],
                  paddingVertical: theme.spacing[2],
                  marginTop: theme.spacing[3],
                },
              ]}
            >
              <BodyText
                variant="xs"
                color={isExpired ? theme.colors.status.danger : theme.colors.forest[950]}
                weight="semiBold"
              >
                {isExpired
                  ? `PIN ${sessionCode.split('').join(' ')}: EXPIRED • Scans & manual entry disabled`
                  : `PIN: ${sessionCode.split('').join(' ')} • Encoded in QR & valid for manual entry`}
              </BodyText>
            </View>

            <View style={[styles.qrStatsRow, { marginTop: theme.spacing[4] }]}>
              <View style={{ alignItems: 'center' }}>
                <BodyText variant="xs" color={theme.colors.ink.muted}>
                  Scanned Students
                </BodyText>
                <Heading level={2} color={theme.colors.forest[800]}>
                  {presentCount} / {totalCount}
                </Heading>
              </View>

              <View style={{ alignItems: 'center' }}>
                <BodyText variant="xs" color={theme.colors.ink.muted}>
                  Valid Remaining
                </BodyText>
                <Heading
                  level={2}
                  color={isExpired ? theme.colors.status.danger : theme.colors.status.warning}
                >
                  {isExpired ? 'EXPIRED' : formatTimer(secondsLeft)}
                </Heading>
                {!isExpired && (
                  <TouchableOpacity onPress={simulateExpiry} activeOpacity={0.7}>
                    <BodyText
                      variant="xs"
                      color={theme.colors.ink.muted}
                      style={{ textDecorationLine: 'underline', marginTop: 2 }}
                    >
                      [Simulate Expiry]
                    </BodyText>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TactileButton
              title={isExpired ? 'Generate New QR Code' : 'Refresh QR Code'}
              variant={isExpired ? 'primary' : 'outline'}
              style={{ marginTop: theme.spacing[5] }}
              onPress={handleRegenerateSessionPass}
            />
          </TactileCard>
        )}

        {/* MODE 3: 6-DIGIT CODE STRATEGY */}
        {strategy === 'SIX_DIGIT_CODE' && (
          <TactileCard raised padding={5} style={styles.codeCard}>
            <Heading level={2} style={{ textAlign: 'center' }}>
              6-Digit Session Code
            </Heading>
            <BodyText variant="sm" color={theme.colors.ink.muted} style={{ textAlign: 'center', marginTop: 4 }}>
              Announce or display this code to learners in Room A1
            </BodyText>

            {/* Segmented Digit Display Boxes matching Screen 15 */}
            <View style={[styles.digitsContainer, { marginTop: theme.spacing[6] }]}>
              {sessionCode.split('').map((digit, index) => (
                <View
                  key={index}
                  style={[
                    styles.digitBox,
                    {
                      backgroundColor: theme.colors.surface.paper,
                      borderColor: isExpired
                        ? theme.colors.status.danger
                        : theme.colors.forest[700],
                      borderRadius: theme.radii.control,
                      opacity: isExpired ? 0.35 : 1,
                    },
                  ]}
                >
                  <Heading
                    level={1}
                    color={isExpired ? theme.colors.status.danger : theme.colors.forest[950]}
                  >
                    {isExpired ? '-' : digit}
                  </Heading>
                </View>
              ))}
            </View>

            {/* Countdown timer & Expiration Notice */}
            <View
              style={[
                styles.codeNoticeBox,
                {
                  backgroundColor: isExpired
                    ? theme.colors.status.dangerLight
                    : theme.colors.forest[50],
                  borderColor: isExpired
                    ? theme.colors.status.danger
                    : theme.colors.forest[100],
                  borderRadius: theme.radii.control,
                  marginTop: theme.spacing[5],
                  padding: theme.spacing[3],
                },
              ]}
            >
              <BodyText
                variant="sm"
                weight="semiBold"
                color={isExpired ? theme.colors.status.danger : theme.colors.forest[950]}
                style={{ textAlign: 'center' }}
              >
                {isExpired
                  ? '⚠️ 6-Digit PIN Expired — Attendance Window Closed'
                  : `⏱ Code expires in ${formatTimer(secondsLeft)}`}
              </BodyText>
              <BodyText
                variant="xs"
                color={isExpired ? theme.colors.status.danger : theme.colors.ink.muted}
                style={{ textAlign: 'center', marginTop: 2 }}
              >
                {isExpired
                  ? 'Learners can no longer submit this PIN. Tap below to generate a new 5-minute code.'
                  : 'Synchronized with classroom QR code (valid for active session window)'}
              </BodyText>
            </View>

            {!isExpired && (
              <TouchableOpacity
                onPress={simulateExpiry}
                activeOpacity={0.7}
                style={{ marginTop: 8 }}
              >
                <BodyText
                  variant="xs"
                  color={theme.colors.ink.muted}
                  style={{ textDecorationLine: 'underline', textAlign: 'center' }}
                >
                  [Simulate 5-Min Expiry]
                </BodyText>
              </TouchableOpacity>
            )}

            <TactileButton
              title={isExpired ? 'Generate New 6-Digit Code' : 'Regenerate New Code'}
              variant={isExpired ? 'primary' : 'secondary'}
              style={{ marginTop: theme.spacing[4] }}
              onPress={handleRegenerateSessionPass}
            />
          </TactileCard>
        )}
      </ScrollView>

      {/* Sticky Save Attendance Bar for Bulk Strategy */}
      {strategy === 'BULK' && (
        <View
          style={[
            styles.stickyFooter,
            {
              backgroundColor: theme.colors.surface.paper,
              borderTopColor: theme.colors.border.subtle,
              padding: theme.spacing[4],
            },
          ]}
        >
          <TactileButton
            title={`Save Attendance (${presentCount} Present)`}
            variant="primary"
            onPress={handleSaveAttendance}
          />
        </View>
      )}
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
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  successBanner: {
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCard: {
    alignItems: 'center',
  },
  qrGraphicWrap: {
    width: 220,
    height: 220,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  qrImageExpired: {
    opacity: 0.12,
  },
  qrExpiredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(253, 251, 247, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
  },
  qrPatternBox: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCornerBlock: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 6,
    borderColor: '#14351A',
    borderRadius: 6,
  },
  qrCenterArt: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  syncedPinBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7F0E9',
  },
  codeCard: {
    alignItems: 'stretch',
  },
  digitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  digitBox: {
    flex: 1,
    marginHorizontal: 3,
    height: 56,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14351A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  codeNoticeBox: {
    borderWidth: 1,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    shadowColor: '#20251F',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
});

