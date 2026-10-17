import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Heading, BodyText } from '../components/Typography';
import { TactileCard } from '../components/TactileCard';
import { TactileButton } from '../components/TactileButton';

export interface StudentHomeScreenProps {
  studentName?: string;
  isAttendanceMarked?: boolean;
  onNavigateToMarkAttendance: () => void;
  onNavigateToAttendanceSummary: () => void;
  onNavigateToClasses?: () => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  studentName = 'Aditya',
  isAttendanceMarked = false,
  onNavigateToMarkAttendance,
  onNavigateToAttendanceSummary,
  onNavigateToClasses,
}) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.paper }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface.paper} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.coachingBadge,
                  {
                    backgroundColor: theme.colors.forest[50],
                    borderColor: theme.colors.forest[100],
                  },
                ]}
              >
                <BodyText variant="xs" weight="bold" color={theme.colors.forest[800]}>
                  APEX ACADEMY
                </BodyText>
              </View>
              <BodyText variant="xs" color={theme.colors.ink.muted}>
                Class 12 • Batch A
              </BodyText>
            </View>
            <Heading level={2} style={styles.greetingTitle}>
              Hello, {studentName} 👋
            </Heading>
          </View>

          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: theme.colors.forest[100],
                borderColor: theme.colors.forest[500],
              },
            ]}
          >
            <BodyText variant="base" weight="bold" color={theme.colors.forest[800]}>
              AK
            </BodyText>
          </View>
        </View>

        {/* Attendance Streak Banner */}
        <TactileCard
          style={[
            styles.streakCard,
            {
              backgroundColor: '#FFFBF0',
              borderColor: '#F3E5AB',
            },
          ]}
        >
          <View style={styles.streakRow}>
            <View style={styles.streakIconWrapper}>
              <BodyText variant="lead">🔥</BodyText>
            </View>
            <View style={{ flex: 1 }}>
              <BodyText variant="sm" weight="bold" color="#8A5B00">
                12-Day Attendance Streak!
              </BodyText>
              <BodyText variant="xs" color="#6D4C00">
                Mark today's Calculus session to reach Level 2 attendance rewards.
              </BodyText>
            </View>
          </View>
        </TactileCard>

        {/* Active Class Session Card */}
        <TactileCard raised style={styles.activeClassCard}>
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.liveTag,
                {
                  backgroundColor: isAttendanceMarked ? theme.colors.forest[50] : '#E8F5E9',
                  borderColor: isAttendanceMarked ? theme.colors.forest[500] : '#81C784',
                },
              ]}
            >
              <View
                style={[
                  styles.pulsingDot,
                  { backgroundColor: isAttendanceMarked ? theme.colors.forest[700] : '#2E7D32' },
                ]}
              />
              <BodyText
                variant="xs"
                weight="bold"
                color={isAttendanceMarked ? theme.colors.forest[800] : '#2E7D32'}
              >
                {isAttendanceMarked ? 'ATTENDANCE MARKED' : 'IN SESSION NOW'}
              </BodyText>
            </View>

            <BodyText variant="xs" weight="medium" color={theme.colors.ink.muted}>
              10:00 AM – 11:00 AM
            </BodyText>
          </View>

          <Heading level={3} style={{ marginTop: 8, marginBottom: 4 }}>
            Calculus & Vectors
          </Heading>
          <BodyText variant="sm" color={theme.colors.ink.muted}>
            Batch A • Room A1 • Dr. Sharma
          </BodyText>

          <View style={styles.classCardDivider} />

          {isAttendanceMarked ? (
            <View style={styles.markedSuccessRow}>
              <BodyText variant="sm" weight="bold" color={theme.colors.forest[800]}>
                ✅ Present for this session
              </BodyText>
              <TouchableOpacity
                onPress={onNavigateToAttendanceSummary}
                activeOpacity={0.7}
              >
                <BodyText variant="xs" weight="semiBold" color={theme.colors.forest[700]}>
                  View Stats ➔
                </BodyText>
              </TouchableOpacity>
            </View>
          ) : (
            <TactileButton
              title="⚡ Mark My Attendance"
              onPress={onNavigateToMarkAttendance}
              style={{ marginTop: 4 }}
            />
          )}
        </TactileCard>

        {/* Attendance Summary Widget */}
        <TouchableOpacity
          onPress={onNavigateToAttendanceSummary}
          activeOpacity={0.8}
        >
          <TactileCard style={styles.attendanceSummaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryMetricCircle}>
                <BodyText variant="lead" weight="bold" color={theme.colors.forest[800]}>
                  {isAttendanceMarked ? '94%' : '92%'}
                </BodyText>
                <BodyText variant="xs" color={theme.colors.ink.muted}>
                  Rate
                </BodyText>
              </View>

              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={styles.summaryTitleRow}>
                  <BodyText variant="sm" weight="bold" color={theme.colors.ink.primary}>
                    Attendance Overview
                  </BodyText>
                  <View
                    style={[
                      styles.safeZoneBadge,
                      {
                        backgroundColor: theme.colors.forest[50],
                        borderColor: theme.colors.forest[100],
                      },
                    ]}
                  >
                    <BodyText variant="xs" weight="bold" color={theme.colors.forest[800]}>
                      ✓ SAFE
                    </BodyText>
                  </View>
                </View>
                <BodyText variant="xs" color={theme.colors.ink.muted} style={{ marginTop: 2 }}>
                  {isAttendanceMarked ? '47' : '46'} present out of 50 classes (Target: 75%)
                </BodyText>

                {/* Progress bar */}
                <View
                  style={[
                    styles.progressBarTrack,
                    { backgroundColor: theme.colors.surface.muted },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: theme.colors.forest[700],
                        width: isAttendanceMarked ? '94%' : '92%',
                      },
                    ]}
                  />
                </View>
              </View>

              <BodyText variant="sm" color={theme.colors.ink.muted} style={{ marginLeft: 8 }}>
                ➔
              </BodyText>
            </View>
          </TactileCard>
        </TouchableOpacity>

        {/* Quick Action Grid */}
        <View style={styles.sectionHeader}>
          <Heading level={3} style={{ fontSize: 18 }}>
            Quick Actions
          </Heading>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.7}
            onPress={onNavigateToMarkAttendance}
          >
            <TactileCard style={styles.gridCard}>
              <View
                style={[
                  styles.gridIconCircle,
                  { backgroundColor: theme.colors.forest[50] },
                ]}
              >
                <BodyText variant="lead">⚡</BodyText>
              </View>
              <BodyText variant="xs" weight="bold" style={styles.gridTitle}>
                Mark Attendance
              </BodyText>
              <BodyText variant="xs" color={theme.colors.ink.muted}>
                PIN / QR
              </BodyText>
            </TactileCard>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.7}
            onPress={onNavigateToAttendanceSummary}
          >
            <TactileCard style={styles.gridCard}>
              <View
                style={[
                  styles.gridIconCircle,
                  { backgroundColor: '#E0F2FE' },
                ]}
              >
                <BodyText variant="lead">📊</BodyText>
              </View>
              <BodyText variant="xs" weight="bold" style={styles.gridTitle}>
                Attendance Log
              </BodyText>
              <BodyText variant="xs" color={theme.colors.ink.muted}>
                Summary & Stats
              </BodyText>
            </TactileCard>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.7}
            onPress={onNavigateToClasses}
          >
            <TactileCard style={styles.gridCard}>
              <View
                style={[
                  styles.gridIconCircle,
                  { backgroundColor: '#FEF3C7' },
                ]}
              >
                <BodyText variant="lead">📅</BodyText>
              </View>
              <BodyText variant="xs" weight="bold" style={styles.gridTitle}>
                Schedule
              </BodyText>
              <BodyText variant="xs" color={theme.colors.ink.muted}>
                3 Classes Today
              </BodyText>
            </TactileCard>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.7}
          >
            <TactileCard style={styles.gridCard}>
              <View
                style={[
                  styles.gridIconCircle,
                  { backgroundColor: '#FEE2E2' },
                ]}
              >
                <BodyText variant="lead">📝</BodyText>
              </View>
              <BodyText variant="xs" weight="bold" style={styles.gridTitle}>
                Assignments
              </BodyText>
              <BodyText variant="xs" color={theme.colors.ink.muted}>
                2 Pending
              </BodyText>
            </TactileCard>
          </TouchableOpacity>
        </View>

        {/* Notice Card */}
        <TactileCard style={[styles.noticeCard, { backgroundColor: theme.colors.surface.muted }]}>
          <View style={styles.noticeRow}>
            <BodyText variant="base" style={{ marginRight: 10 }}>
              📢
            </BodyText>
            <View style={{ flex: 1 }}>
              <BodyText variant="xs" weight="bold" color={theme.colors.ink.primary}>
                Weekly Mathematics Assessment
              </BodyText>
              <BodyText variant="xs" color={theme.colors.ink.muted} style={{ marginTop: 2 }}>
                Integration & Differentiation chapter test scheduled for this Friday at 10:00 AM.
              </BodyText>
            </View>
          </View>
        </TactileCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coachingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  greetingTitle: {
    fontSize: 26,
    marginTop: 2,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCard: {
    marginBottom: 16,
    borderWidth: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIconWrapper: {
    marginRight: 12,
  },
  activeClassCard: {
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  classCardDivider: {
    height: 1,
    backgroundColor: '#EAE6DF',
    marginVertical: 12,
  },
  markedSuccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  attendanceSummaryCard: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryMetricCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  safeZoneBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  gridItem: {
    width: '50%',
    padding: 6,
  },
  gridCard: {
    padding: 14,
    alignItems: 'center',
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridTitle: {
    marginBottom: 2,
    textAlign: 'center',
  },
  noticeCard: {
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
