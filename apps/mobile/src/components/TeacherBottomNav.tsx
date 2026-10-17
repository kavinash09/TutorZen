import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BodyText } from './Typography';

export type TeacherTab = 'home' | 'classes' | 'learn' | 'profile';

export interface TeacherBottomNavProps {
  activeTab: TeacherTab;
  onTabChange: (tab: TeacherTab) => void;
}

export const TeacherBottomNav: React.FC<TeacherBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const theme = useTheme();

  const tabs: { key: TeacherTab; label: string; iconSymbol: string }[] = [
    { key: 'home', label: 'Home', iconSymbol: '🏠' },
    { key: 'classes', label: 'Classes', iconSymbol: '📅' },
    { key: 'learn', label: 'Learn', iconSymbol: '📚' },
    { key: 'profile', label: 'Profile', iconSymbol: '👤' },
  ];

  return (
    <View
      style={[
        styles.navContainer,
        {
          backgroundColor: theme.colors.surface.paper,
          borderTopColor: theme.colors.border.subtle,
          paddingBottom: theme.spacing[4],
          paddingTop: theme.spacing[2],
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const color = isActive ? theme.colors.forest[800] : theme.colors.ink.muted;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={styles.tabButton}
          >
            <BodyText variant="base" style={{ marginBottom: 2 }}>
              {tab.iconSymbol}
            </BodyText>
            <BodyText
              variant="xs"
              weight={isActive ? 'bold' : 'medium'}
              color={color}
            >
              {tab.label}
            </BodyText>
            {isActive && (
              <View
                style={[
                  styles.activeIndicator,
                  { backgroundColor: theme.colors.forest[800] },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    shadowColor: '#20251F',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  activeIndicator: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    marginTop: 4,
  },
});

