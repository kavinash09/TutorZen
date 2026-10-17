import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Heading, BodyText } from '../components/Typography';
import { TactileCard } from '../components/TactileCard';
import { TactileButton } from '../components/TactileButton';

export const HomeScreen: React.FC = () => {
  const theme = useTheme();

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
          { padding: theme.spacing[4] },
        ]}
      >
        {/* Top Header */}
        <View style={[styles.header, { marginBottom: theme.spacing[6] }]}>
          <BodyText variant="sm" color={theme.colors.forest[700]} weight="semiBold">
            APEX COACHING INSTITUTE
          </BodyText>
          <Heading level={1} style={{ marginTop: theme.spacing[1] }}>
            Today's Classes
          </Heading>
          <BodyText variant="sm" color={theme.colors.ink.muted}>
            Wednesday, October 15 • 3 sessions scheduled
          </BodyText>
        </View>

        {/* Offline Sync State Banner (Demonstrating ADR-0003 & System States) */}
        <View
          style={[
            styles.syncBanner,
            {
              backgroundColor: theme.colors.forest[100],
              borderRadius: theme.radii.control,
              padding: theme.spacing[3],
              marginBottom: theme.spacing[4],
            },
          ]}
        >
          <View style={styles.syncRow}>
            <View
              style={[
                styles.syncDot,
                { backgroundColor: theme.colors.status.success },
              ]}
            />
            <BodyText variant="sm" color={theme.colors.forest[950]} weight="medium">
              Offline attendance queue: All records synchronized
            </BodyText>
          </View>
        </View>

        {/* Hero Card: Next Upcoming Session */}
        <TactileCard
          raised
          padding={5}
          style={{ marginBottom: theme.spacing[6] }}
        >
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: theme.colors.forest[800],
                  borderRadius: theme.radii.full,
                  paddingHorizontal: theme.spacing[3],
                  paddingVertical: theme.spacing[1],
                },
              ]}
            >
              <BodyText variant="xs" color={theme.colors.common.white} weight="bold">
                STARTING IN 15 MIN
              </BodyText>
            </View>
            <BodyText variant="sm" color={theme.colors.ink.muted}>
              Room 204
            </BodyText>
          </View>

          <Heading level={2} style={{ marginTop: theme.spacing[3] }}>
            Physics: Wave Mechanics
          </Heading>
          <BodyText variant="base" color={theme.colors.ink.secondary} style={{ marginTop: theme.spacing[1] }}>
            Batch 11-A • 34 Students Enrolled
          </BodyText>
          <BodyText variant="sm" color={theme.colors.ink.muted} style={{ marginTop: theme.spacing[1] }}>
            10:00 AM – 11:30 AM
          </BodyText>

          <View style={[styles.actionRow, { marginTop: theme.spacing[5] }]}>
            <TactileButton
              title="Mark Attendance"
              variant="primary"
              style={{ flex: 1, marginRight: theme.spacing[2] }}
              onPress={() => {}}
            />
            <TactileButton
              title="View Roster"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => {}}
            />
          </View>
        </TactileCard>

        {/* Section: Later Today */}
        <Heading level={3} style={{ marginBottom: theme.spacing[3] }}>
          Later Today
        </Heading>

        <TactileCard padding={4} style={{ marginBottom: theme.spacing[3] }}>
          <View style={styles.classRow}>
            <View style={{ flex: 1 }}>
              <Heading level={3}>Chemistry: Organic Synthesis</Heading>
              <BodyText variant="sm" color={theme.colors.ink.muted}>
                Batch 12-B • 2:00 PM – 3:30 PM
              </BodyText>
            </View>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: theme.colors.surface.muted,
                  borderRadius: theme.radii.full,
                  paddingHorizontal: theme.spacing[3],
                  paddingVertical: theme.spacing[1],
                },
              ]}
            >
              <BodyText variant="xs" color={theme.colors.ink.muted} weight="medium">
                Scheduled
              </BodyText>
            </View>
          </View>
        </TactileCard>

        <TactileCard padding={4} style={{ marginBottom: theme.spacing[3] }}>
          <View style={styles.classRow}>
            <View style={{ flex: 1 }}>
              <Heading level={3}>Mathematics: Calculus II</Heading>
              <BodyText variant="sm" color={theme.colors.ink.muted}>
                Batch 12-A • 4:00 PM – 5:30 PM
              </BodyText>
            </View>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: theme.colors.surface.muted,
                  borderRadius: theme.radii.full,
                  paddingHorizontal: theme.spacing[3],
                  paddingVertical: theme.spacing[1],
                },
              ]}
            >
              <BodyText variant="xs" color={theme.colors.ink.muted} weight="medium">
                Scheduled
              </BodyText>
            </View>
          </View>
        </TactileCard>
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
  header: {
    marginTop: 8,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
  },
  actionRow: {
    flexDirection: 'row',
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    alignSelf: 'center',
  },
});

