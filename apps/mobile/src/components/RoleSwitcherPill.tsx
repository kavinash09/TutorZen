import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BodyText } from './Typography';

export type UserRole = 'teacher' | 'student';

export interface RoleSwitcherPillProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcherPill: React.FC<RoleSwitcherPillProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.pillContainer,
        {
          backgroundColor: theme.colors.surface.muted,
          borderColor: theme.colors.border.subtle,
          borderRadius: theme.radii.full,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onRoleChange('teacher')}
        activeOpacity={0.8}
        style={[
          styles.pillButton,
          currentRole === 'teacher' && {
            backgroundColor: theme.colors.forest[800],
            borderRadius: theme.radii.full,
          },
        ]}
      >
        <BodyText
          variant="xs"
          weight={currentRole === 'teacher' ? 'bold' : 'medium'}
          color={currentRole === 'teacher' ? theme.colors.common.white : theme.colors.ink.muted}
        >
          👨‍🏫 Teacher
        </BodyText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onRoleChange('student')}
        activeOpacity={0.8}
        style={[
          styles.pillButton,
          currentRole === 'student' && {
            backgroundColor: theme.colors.forest[800],
            borderRadius: theme.radii.full,
          },
        ]}
      >
        <BodyText
          variant="xs"
          weight={currentRole === 'student' ? 'bold' : 'medium'}
          color={currentRole === 'student' ? theme.colors.common.white : theme.colors.ink.muted}
        >
          👨‍🎓 Student
        </BodyText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 3,
    borderWidth: 1,
    shadowColor: '#20251F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 999,
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

