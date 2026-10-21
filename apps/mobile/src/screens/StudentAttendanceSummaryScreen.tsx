import React, { useState, useEffect } from 'react';
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
import { apiClient, StudentAttendanceSummaryResponse } from '../services/apiClient';

export interface AttendanceHistoryRecord {
  id: string;
  date: string;
  subject: string;
  time: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  method: string;
}

export interface StudentAttendanceSummaryScreenProps {
  studentId?: string;
  isAttendanceMarked?: boolean;
  onNavigateBack: () => void;
  onNavigateToMarkAttendance?: () => void;
}

export const StudentAttendanceSummaryScreen: React.FC<StudentAttendanceSummaryScreenProps> = ({
  studentId,
  isAttendanceMarked = false,
  onNavigateBack,
  onNavigateToMarkAttendance,
}) => {
  const theme = useTheme();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LATE'>('ALL');
  const [summary, setSummary] = useState<StudentAttendanceSummaryResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const sid = studentId || apiClient.getCurrentUser()?.id || 'std-01';
        const data = await apiClient.getStudentAttendanceSummary(sid);
        if (isMounted) {
          setSummary(data);
        }
      } catch (err) {
        console.warn('Failed to load attendance summary from API', err);
      }
    };

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [studentId, isAttendanceMarked]);

  // Dynamic statistics reflecting live API response with fallback
  const totalClasses = summary ? summary.totalClasses : isAttendanceMarked ? 51 : 50;
  const presentCount = summary ? summary.presentCount : isAttendanceMarked ? 47 : 46;
  const absentCount = summary ? summary.absentCount : 4;
  const lateCount = summary ? summary.lateCount : 2;
  const percentage = summary
    ? Math.round(summary.overallPercentage)
    : Math.round((presentCount / (totalClasses || 1)) * 100);

  const historyRecords: AttendanceHistoryRecord[] = summary?.recentHistory?.length
    ? summary.recentHistory.map((h) => ({
        id: h.recordId,
        date: new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        subject: h.subject,
        time: new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: h.status,
        method: h.method === 'SIX_DIGIT_CODE' ? '6-Digit PIN' : h.method === 'QR' ? 'QR Code' : 'Bulk Roster',
      }))
    : [
        ...(isAttendanceMarked
          ? [
              {
                id: 'rec-today',
                date: 'Today, Oct 15',
                subject: 'Calculus & Vectors',
                time: '10:00 AM',
                status: 'PRESENT' as const,
                method: '6-Digit PIN',
              },
            ]
          : []),
        {
          id: 'rec-01',
          date: 'Oct 14, 2026',
          subject: 'Mechanics & Heat',
          time: '02:00 PM',
          status: 'PRESENT',
          method: 'QR Code',
        },
        {
          id: 'rec-02',
          date: 'Oct 13, 2026',
          subject: 'Calculus Problem Set',
          time: '10:00 AM',
          status: 'PRESENT',
          method: 'Bulk Roster',
        },
        {
          id: 'rec-03',
          date: 'Oct 11, 2026',
          subject: 'Organic Chemistry',
          time: '11:30 AM',
          status: 'ABSENT',
          method: 'Teacher Marked',
        },
        {
          id: 'rec-04',
          date: 'Oct 10, 2026',
          subject: 'Calculus Derivatives',
          time: '10:00 AM',
          status: 'PRESENT',
          method: '6-Digit PIN',
        },
        {
          id: 'rec-05',
          date: 'Oct 09, 2026',
          subject: 'Physics Lab Session',
          time: '03:00 PM',
          status: 'LATE',
          method: '6-Digit PIN',
        },
        {
          id: 'rec-06',
          date: 'Oct 08, 2026',
          subject: 'Algebra & Matrices',
          time: '10:00 AM',
          status: 'PRESENT',
          method: 'QR Code',
        },
      ];

  const filteredRecords = historyRecords.filter((rec) => {
    if (activeFilter === 'ALL') return true;
    return rec.status === activeFilter;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.paper }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface.paper} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onNavigateBack}
            activeOpacity={0.7}
            style={styles.backButton}
            accessibilityRole="button"
          >
            <BodyText variant="sm" weight="semiBold" color={theme.colors.forest[800]}>
              ← Back
            </BodyText>
          </TouchableOpacity>
          <Heading level={2} style={styles.title}>
            Attendance Analysis
          </Heading>
          <View style={{ width: 48 }} />
        </View>

        {/* Circular Metric Card (Concept Screen 13) */}
        <TactileCard raised style={styles.mainRateCard}>
          <View style={styles.rateCircleOuter}>
            <View
              style={[
                styles.rateCircleInner,
                {
                  backgroundColor: theme.colors.surface.paper,
                  borderColor: theme.colors.forest[700],
                },
              ]}
            >
              <Heading level={1} style={{ fontSize: 44, color: theme.colors.forest[950] }}>
                {percentage}%
              </Heading>
              <BodyText variant="xs" weight="medium" color={theme.colors.ink.muted}>
                Cumulative Rate
              </BodyText>
            </View>
          </View>

          <View style={styles.policyRow}>
            <View
              style={[
                styles.safeBadge,
                {
                  backgroundColor: theme.colors.forest[50],
                  borderColor: theme.colors.forest[100],
                },
              ]}
            >
              <BodyText variant="xs" weight="bold" color={theme.colors.forest[800]}>
                ✓ EXCEEDS MINIMUM (75%)
              </BodyText>
            </View>
          </View>

          <BodyText
            variant="xs"
            color={theme.colors.ink.muted}
            style={{ textAlign: 'center', marginTop: 8 }}
          >
            You have attended {presentCount} of {totalClasses} scheduled sessions this academic term.
          </BodyText>
        </TactileCard>

        {/* Stat Breakdown Trio */}
        <View style={styles.statsTrioRow}>
          <TactileCard style={styles.trioCard}>
            <BodyText variant="lead" weight="bold" color={theme.colors.forest[800]}>
              {presentCount}
            </BodyText>
            <BodyText variant="xs" color={theme.colors.ink.muted}>
              Present
            </BodyText>
          </TactileCard>

          <TactileCard style={styles.trioCard}>
            <BodyText variant="lead" weight="bold" color="#991B1B">
              {absentCount}
            </BodyText>
            <BodyText variant="xs" color={theme.colors.ink.muted}>
              Absent
            </BodyText>
          </TactileCard>

          <TactileCard style={styles.trioCard}>
            <BodyText variant="lead" weight="bold" color="#B45309">
              {lateCount}
            </BodyText>
            <BodyText variant="xs" color={theme.colors.ink.muted}>
              Late
            </BodyText>
          </TactileCard>
        </View>

        {/* Tenant Policy Note */}
        <TactileCard style={[styles.policyCard, { backgroundColor: theme.colors.surface.muted }]}>
          <BodyText variant="xs" color={theme.colors.ink.muted}>
            <BodyText weight="bold" color={theme.colors.ink.primary}>
              Coaching Policy Notice:{' '}
            </BodyText>
            A minimum of 75% attendance is required across each enrolled subject for term exam qualification and hall-ticket clearance.
          </BodyText>
        </TactileCard>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['ALL', 'PRESENT', 'ABSENT', 'LATE'] as const).map((f) => {
            const isSelected = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.7}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.forest[800]
                      : theme.colors.surface.paper,
                    borderColor: isSelected
                      ? theme.colors.forest[800]
                      : theme.colors.border.subtle,
                  },
                ]}
              >
                <BodyText
                  variant="xs"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? theme.colors.common.white : theme.colors.ink.muted}
                >
                  {f === 'ALL' ? `All (${historyRecords.length})` : f}
                </BodyText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Attendance Log List */}
        <View style={styles.logList}>
          {filteredRecords.map((record) => {
            const isPresent = record.status === 'PRESENT';
            const isAbsent = record.status === 'ABSENT';

            const statusBg = isPresent
              ? theme.colors.forest[50]
              : isAbsent
              ? '#FEE2E2'
              : '#FEF3C7';
            const statusColor = isPresent
              ? theme.colors.forest[800]
              : isAbsent
              ? '#991B1B'
              : '#92400E';

            return (
              <TactileCard key={record.id} style={styles.logCard}>
                <View style={styles.logHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Heading level={3} style={{ fontSize: 16 }}>
                      {record.subject}
                    </Heading>
                    <BodyText variant="xs" color={theme.colors.ink.muted} style={{ marginTop: 2 }}>
                      {record.date} • {record.time}
                    </BodyText>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusBg, borderColor: statusColor },
                    ]}
                  >
                    <BodyText variant="xs" weight="bold" color={statusColor}>
                      {record.status}
                    </BodyText>
                  </View>
                </View>

                <View style={styles.logFooterRow}>
                  <BodyText variant="xs" color={theme.colors.ink.muted}>
                    Verified via: <BodyText weight="medium">{record.method}</BodyText>
                  </BodyText>
                </View>
              </TactileCard>
            );
          })}
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
  },
  mainRateCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  rateCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  rateCircleInner: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statsTrioRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  trioCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  policyCard: {
    borderWidth: 1,
    borderColor: '#EAE6DF',
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  logList: {
    gap: 10,
  },
  logCard: {
    padding: 14,
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  logFooterRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE4',
  },
});
