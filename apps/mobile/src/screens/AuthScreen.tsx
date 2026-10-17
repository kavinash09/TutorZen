import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Heading, BodyText } from '../components/Typography';
import { TactileCard } from '../components/TactileCard';
import { TactileButton } from '../components/TactileButton';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const theme = useTheme();
  const { signIn, isLoading } = useAuth();

  const [email, setEmail] = useState('teacher@demo.com');
  const [password, setPassword] = useState('password123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (emailToUse?: string, passwordToUse?: string) => {
    const targetEmail = (emailToUse || email).trim();
    const targetPassword = passwordToUse || password;

    if (!targetEmail || !targetPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage(null);
    try {
      await signIn(targetEmail, targetPassword);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    }
  };

  const handleDemoSignIn = (role: 'teacher' | 'student') => {
    if (role === 'teacher') {
      setEmail('teacher@demo.com');
      setPassword('password123');
      handleSignIn('teacher@demo.com', 'password123');
    } else {
      setEmail('student@demo.com');
      setPassword('password123');
      handleSignIn('student@demo.com', 'password123');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.surface.paper }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface.paper} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Brand Header */}
        <View style={styles.header}>
          <Heading level={1} style={{ color: theme.colors.forest[950], textAlign: 'center' }}>
            TutorZen
          </Heading>
          <BodyText variant="sm" color={theme.colors.ink.muted} style={{ textAlign: 'center', marginTop: 4 }}>
            Coaching & Institute Management System
          </BodyText>
        </View>

        <TactileCard raised padding={5} style={styles.card}>
          <Heading level={2} style={{ textAlign: 'center' }}>
            Sign In
          </Heading>
          <BodyText variant="xs" color={theme.colors.ink.muted} style={{ textAlign: 'center', marginTop: 4 }}>
            Enter your coaching credentials to access your dashboard
          </BodyText>

          {errorMessage && (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: theme.colors.status.dangerLight,
                  borderColor: theme.colors.status.danger,
                  borderRadius: theme.radii.control,
                },
              ]}
            >
              <BodyText variant="xs" color={theme.colors.status.danger} weight="semiBold">
                ⚠️ {errorMessage}
              </BodyText>
            </View>
          )}

          {/* Form Inputs */}
          <View style={{ marginTop: theme.spacing[4] }}>
            <BodyText variant="xs" weight="bold" color={theme.colors.forest[700]} style={{ marginBottom: 4 }}>
              EMAIL ADDRESS
            </BodyText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface.paper,
                  borderColor: theme.colors.border.strong,
                  borderRadius: theme.radii.control,
                },
              ]}
              placeholder="e.g. teacher@demo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <BodyText
              variant="xs"
              weight="bold"
              color={theme.colors.forest[700]}
              style={{ marginTop: theme.spacing[3], marginBottom: 4 }}
            >
              PASSWORD
            </BodyText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface.paper,
                  borderColor: theme.colors.border.strong,
                  borderRadius: theme.radii.control,
                },
              ]}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Submit Action */}
          <TactileButton
            title={isLoading ? 'Signing In...' : 'Sign In'}
            variant="primary"
            style={{ marginTop: theme.spacing[5] }}
            disabled={isLoading}
            onPress={() => handleSignIn()}
          />

          {/* Quick Demo Logins Helper */}
          <View style={styles.demoSection}>
            <BodyText variant="xs" color={theme.colors.ink.muted} style={{ textAlign: 'center', marginBottom: 8 }}>
              — OR SIGN IN WITH DEMO ACCOUNT —
            </BodyText>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                onPress={() => handleDemoSignIn('teacher')}
                style={[
                  styles.demoButton,
                  {
                    backgroundColor: theme.colors.forest[100],
                    borderColor: theme.colors.forest[700],
                    borderRadius: theme.radii.control,
                  },
                ]}
              >
                <BodyText variant="xs" weight="bold" color={theme.colors.forest[950]}>
                  👨‍🏫 Teacher Demo
                </BodyText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDemoSignIn('student')}
                style={[
                  styles.demoButton,
                  {
                    backgroundColor: theme.colors.surface.muted,
                    borderColor: theme.colors.border.strong,
                    borderRadius: theme.radii.control,
                  },
                ]}
              >
                <BodyText variant="xs" weight="bold" color={theme.colors.ink.primary}>
                  👨‍🎓 Student Demo
                </BodyText>
              </TouchableOpacity>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  card: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  errorBanner: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  demoSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E2D8',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
