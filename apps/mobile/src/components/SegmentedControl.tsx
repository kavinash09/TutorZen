import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BodyText } from './Typography';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  badge?: number | string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  selected: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
}

export function SegmentedControl<T extends string>({
  options,
  selected,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface.muted,
          borderRadius: theme.radii.control,
          padding: 4,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const isSelected = option.value === selected;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.tab,
              {
                borderRadius: theme.radii.control - 2,
                backgroundColor: isSelected
                  ? theme.colors.surface.paper
                  : theme.colors.common.transparent,
                shadowColor: isSelected ? theme.colors.forest[950] : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isSelected ? 0.08 : 0,
                shadowRadius: 4,
                elevation: isSelected ? 2 : 0,
              },
            ]}
          >
            <BodyText
              variant="sm"
              weight={isSelected ? 'semiBold' : 'medium'}
              color={isSelected ? theme.colors.forest[800] : theme.colors.ink.muted}
            >
              {option.label}
              {option.badge !== undefined && ` (${option.badge})`}
            </BodyText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

