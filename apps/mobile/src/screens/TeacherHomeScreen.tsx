import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Heading, BodyText } from '../components/Typography';
import { TactileCard } from '../components/TactileCard';
import { TactileButton } from '../components/TactileButton';
import { TeacherClassSession } from '../types/teacher';
import { apiClient } from '../services/apiClient';

export interface TeacherHomeScreenProps {
  onNavigateToMarkAttendance: (sessionId: string) => void;
  onNavigateToClasses?: () => void;
}

export const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({
  onNavigateToMarkAttendance,
  onNavigateToClasses,
}) => {
  const theme = useTheme();
  const [sessions, setSessions] = useState<TeacherClassSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getTodayTeacherSessions();
      setSessions(res.sessions);
      setIsLiveBackend(res.isLive);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.surface.paper },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface.paper} />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: theme.spacing[4], paddingTop: theme.spacing[3], paddingBottom: theme.spacing[10] },
        ]}
      >
        {/* Top Header Row with Avatar */}
        <View style={styles.topHeader}>
          <View>
            <BodyText variant="sm" color={theme.colors.ink.muted}>
              Good Morning
            </BodyText>
            <Heading level={1} style={{ marginTop: 2 }}>
              Priya Ma'am 👋
            </Heading>
            <BodyText variant="sm" color={theme.colors.forest[700]} weight="medium" style={{ marginTop: 2 }}>
              You have 3 classes today
            </BodyText>
          </View>
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: theme.colors.forest[100],
                borderColor: theme.colors.forest[700],
              },
            ]}
          >
            <BodyText variant="base" weight="bold" color={theme.colors.forest[800]}>
              PM
            </BodyText>
          </View>
        </View>

        {/* Backend & Offline Sync State Banner */}
        <View
          style={[
            styles.syncBanner,
            {
              backgroundColor: isLiveBackend ? theme.colors.forest[50] : theme.colors.surface.muted,
              borderColor: isLiveBackend ? theme.colors.forest[100] : theme.colors.border.subtle,
              borderRadius: theme.radii.control,
              padding: theme.spacing[3],
              marginTop: theme.spacing[4],
            },
          ]}
        >
          <View
            style={[
              styles.syncDot,
              { backgroundColor: isLiveBackend ? theme.colors.status.success : theme.colors.status.warning },
            ]}
          />
          <BodyText variant="xs" color={theme.colors.forest[950]} weight="medium">
            {isLiveBackend
              ? '● Spring Boot API Connected (Live Database Sessions)'
              : 'Offline Attendance Sync: All submissions synced with server'}
          </BodyText>
        </View>

        {/* Summary Metric Cards */}
        <View style={[styles.metricsRow, { marginTop: theme.spacing[4] }]}>
          <TactileCard padding={4} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View
                style={[
                  styles.metricIconWrap,
                  { backgroundColor: theme.colors.forest[100] },
                ]}
              >
                <BodyText variant="base">📅</BodyText>
              </View>
              <BodyText variant="sm" color={theme.colors.ink.muted}>
                Today's Classes
              </BodyText>
            </View>
            <Heading level={1} style={{ marginTop: theme.spacing[2] }}>
              3
            </Heading>
          </TactileCard>

          <TactileCard padding={4} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View
                style={[
                  styles.metricIconWrap,
                  { backgroundColor: theme.colors.status.warningLight },
                ]}
              >
                <BodyText variant="base">👥</BodyText>
              </View>
              <BodyText variant="sm" color={theme.colors.ink.muted}>
                Total Students
              </BodyText>
            </View>
            <Heading level={1} style={{ marginTop: theme.spacing[2] }}>
              86
            </Heading>
          </TactileCard>
        </View>

        {/* Today's Classes Section Header */}
        <View style={[styles.sectionHeaderRow, { marginTop: theme.spacing[6] }]}>
          <Heading level={2}>Today's Classes</Heading>
          <TouchableOpacity onPress={onNavigateToClasses} activeOpacity={0.7}>
            <BodyText variant="sm" weight="semiBold" color={theme.colors.forest[800]}>
              View All
            </BodyText>
          </TouchableOpacity>
        </View>

        {/* Today's Classes List */}
        {sessions.map((session) => (
          <TactileCard
            key={session.id}
            padding={4}
            style={{ marginTop: theme.spacing[3] }}
          >
            <View style={styles.sessionCardContent}>
              <View style={{ flex: 1 }}>
                <Heading level={3}>
                  {session.subject} – {session.batchName}
                </Heading>
                <BodyText variant="sm" color={theme.colors.ink.muted} style={{ marginTop: 2 }}>
                  {session.timeSlot}
                </BodyText>
                <BodyText variant="xs" color={theme.colors.forest[700]} weight="medium" style={{ marginTop: 2 }}>
                  {session.enrolledStudentsCount} students enrolled • {session.room}
                </BodyText>
              </View>

              <TactileButton
                title="Start"
                variant="primary"
                style={styles.startButton}
                onPress={() => onNavigateToMarkAttendance(session.id)}
              />
            </View>
          </TactileCard>
        ))}

        {/* Quick Action Tiles */}
        <View style={[styles.sectionHeaderRow, { marginTop: theme.spacing[6] }]}>
          <Heading level={2}>Quick Actions</Heading>
        </View>

        <View style={[styles.quickActionsRow, { marginTop: theme.spacing[3] }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onNavigateToMarkAttendance(sessions[0].id)}
            style={styles.quickActionTouch}
          >
            <TactileCard padding={4} style={styles.quickActionCard}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: theme.colors.forest[100] },
                ]}
              >
                <BodyText variant="base">📝</BodyText>
              </View>
              <BodyText variant="sm" weight="semiBold" style={{ marginTop: theme.spacing[2], textAlign: 'center' }}>
                Mark Attendance
              </BodyText>
            </TactileCard>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.quickActionTouch}>
            <TactileCard padding={4} style={styles.quickActionCard}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: theme.colors.status.infoLight },
                ]}
              >
                <BodyText variant="base">📄</BodyText>
              </View>
              <BodyText variant="sm" weight="semiBold" style={{ marginTop: theme.spacing[2], textAlign: 'center' }}>
                Upload Notes
              </BodyText>
            </TactileCard>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.quickActionTouch}>
            <TactileCard padding={4} style={styles.quickActionCard}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: theme.colors.status.dangerLight },
                ]}
              >
                <BodyText variant="base">📋</BodyText>
              </View>
              <BodyText variant="sm" weight="semiBold" style={{ marginTop: theme.spacing[2], textAlign: 'center' }}>
                Create Test
              </BodyText>
            </TactileCard>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#237A45',
    marginRight: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  startButton: {
    minWidth: 80,
    paddingHorizontal: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionTouch: {
    flex: 1,
  },
  quickActionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

