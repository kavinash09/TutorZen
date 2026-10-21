import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import {
  useFonts,
  EBGaramond_400Regular,
  EBGaramond_600SemiBold,
  EBGaramond_700Bold,
} from '@expo-google-fonts/eb-garamond';
import {
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
} from '@expo-google-fonts/barlow';
import { registerRootComponent } from 'expo';
import { ThemeProvider } from './src/theme/ThemeContext';
import { BodyText, Heading } from './src/components/Typography';
import { RoleSwitcherPill, UserRole } from './src/components/RoleSwitcherPill';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';

// Teacher Flow Components
import { TeacherHomeScreen } from './src/screens/TeacherHomeScreen';
import { MarkAttendanceScreen } from './src/screens/MarkAttendanceScreen';
import { UploadNotesScreen } from './src/screens/UploadNotesScreen';
import { TeacherBottomNav, TeacherTab } from './src/components/TeacherBottomNav';

// Student Flow Components
import { StudentHomeScreen } from './src/screens/StudentHomeScreen';
import { StudentAttendanceEntryScreen } from './src/screens/StudentAttendanceEntryScreen';
import { StudentAttendanceSummaryScreen } from './src/screens/StudentAttendanceSummaryScreen';
import { StudentBottomNav, StudentTab } from './src/components/StudentBottomNav';

export type TeacherScreenState = 'teacher_home' | 'mark_attendance' | 'upload_notes';
export type StudentScreenState = 'student_home' | 'student_attendance_entry' | 'student_attendance_summary';

function MainApp() {
  const { user, isAuthenticated, signOut, switchUserRole } = useAuth();

  // If not authenticated, render the AuthScreen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Derive role
  const currentRole: UserRole = user?.role === 'STUDENT' ? 'student' : 'teacher';

  // Coordinated Session & Verification State across Teacher and Student
  const [sessionCode, setSessionCode] = useState<string>('742916');
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const [isStudentAttendanceMarked, setIsStudentAttendanceMarked] = useState<boolean>(false);

  // Teacher navigation state
  const [teacherScreen, setTeacherScreen] = useState<TeacherScreenState>('teacher_home');
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('home');
  const [activeSessionId, setActiveSessionId] = useState<string>('session-math-a');

  // Student navigation state
  const [studentScreen, setStudentScreen] = useState<StudentScreenState>('student_home');
  const [studentTab, setStudentTab] = useState<StudentTab>('home');

  const handleStartAttendance = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setTeacherScreen('mark_attendance');
  };

  const handleStudentSubmitSuccess = (_code: string) => {
    setIsStudentAttendanceMarked(true);
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      {/* Universal Top Header with Brand, Role Switcher, and User Sign Out */}
      <View style={styles.topRoleHeader}>
        <View style={styles.brandingBox}>
          <Heading level={3} style={styles.brandTitle}>
            TutorZen
          </Heading>
          <BodyText variant="xs" color="#686F64" style={styles.brandSub}>
            {user?.fullName || 'Apex Coaching'} • {user?.email}
          </BodyText>
        </View>

        <View style={styles.headerActions}>
          <RoleSwitcherPill
            currentRole={currentRole}
            onRoleChange={(role) => switchUserRole(role === 'student' ? 'STUDENT' : 'TEACHER')}
          />
          <TouchableOpacity onPress={() => signOut()} style={styles.signOutBtn} activeOpacity={0.7}>
            <BodyText variant="xs" color="#A03025" weight="semiBold">
              Sign Out
            </BodyText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area Based on Role */}
      <View style={styles.contentContainer}>
        {currentRole === 'teacher' ? (
          /* TEACHER FLOW */
          <>
            {teacherScreen === 'teacher_home' && (
              <>
                <TeacherHomeScreen
                  onNavigateToMarkAttendance={handleStartAttendance}
                  onNavigateToClasses={() => setTeacherTab('classes')}
                  onNavigateToUploadNotes={() => setTeacherScreen('upload_notes')}
                />
                <TeacherBottomNav
                  activeTab={teacherTab}
                  onTabChange={(tab) => {
                    setTeacherTab(tab);
                    setTeacherScreen('teacher_home');
                  }}
                />
              </>
            )}

            {teacherScreen === 'mark_attendance' && (
              <MarkAttendanceScreen
                sessionId={activeSessionId}
                sharedSessionCode={sessionCode}
                onSessionCodeChange={(newCode) => setSessionCode(newCode)}
                isSessionExpired={isSessionExpired}
                onSessionExpiryChange={(expired) => setIsSessionExpired(expired)}
                studentAttendanceMarked={isStudentAttendanceMarked}
                onNavigateBack={() => setTeacherScreen('teacher_home')}
              />
            )}

            {teacherScreen === 'upload_notes' && (
              <UploadNotesScreen
                onNavigateBack={() => setTeacherScreen('teacher_home')}
              />
            )}
          </>

        ) : (
          /* STUDENT FLOW */
          <>
            {studentScreen === 'student_home' && (
              <>
                <StudentHomeScreen
                  studentName={user?.fullName?.split(' ')[0] || 'Aditya'}
                  isAttendanceMarked={isStudentAttendanceMarked}
                  onNavigateToMarkAttendance={() => setStudentScreen('student_attendance_entry')}
                  onNavigateToAttendanceSummary={() => setStudentScreen('student_attendance_summary')}
                  onNavigateToClasses={() => setTeacherTab('classes')}
                />
                <StudentBottomNav
                  activeTab={studentTab}
                  onTabChange={(tab) => {
                    setStudentTab(tab);
                    if (tab === 'attendance') {
                      setStudentScreen('student_attendance_summary');
                    } else if (tab === 'home') {
                      setStudentScreen('student_home');
                    }
                  }}
                />
              </>
            )}

            {studentScreen === 'student_attendance_entry' && (
              <StudentAttendanceEntryScreen
                sessionCode={sessionCode}
                sessionId={activeSessionId}
                studentId={user?.id}
                isSessionExpired={isSessionExpired}
                isAlreadyMarked={isStudentAttendanceMarked}
                onSuccessSubmit={handleStudentSubmitSuccess}
                onNavigateBack={() => setStudentScreen('student_home')}
                onNavigateToSummary={() => setStudentScreen('student_attendance_summary')}
              />
            )}

            {studentScreen === 'student_attendance_summary' && (
              <>
                <StudentAttendanceSummaryScreen
                  studentId={user?.id}
                  isAttendanceMarked={isStudentAttendanceMarked}
                  onNavigateBack={() => setStudentScreen('student_home')}
                  onNavigateToMarkAttendance={() => setStudentScreen('student_attendance_entry')}
                />
                <StudentBottomNav
                  activeTab={studentTab}
                  onTabChange={(tab) => {
                    setStudentTab(tab);
                    if (tab === 'home') {
                      setStudentScreen('student_home');
                    }
                  }}
                />
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_600SemiBold,
    EBGaramond_700Bold,
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
  });

  if (Platform.OS !== 'web' && !fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D4A25" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  topRoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F7F5EE',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E2D8',
    zIndex: 1000,
  },
  brandingBox: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    color: '#1D4A25',
    lineHeight: 22,
  },
  brandSub: {
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signOutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  contentContainer: {
    flex: 1,
  },
});

registerRootComponent(App);
