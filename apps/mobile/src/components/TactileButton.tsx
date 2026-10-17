import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BodyText } from './Typography';

export interface TactileButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}) => {
  const theme = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface.muted,
          borderColor: theme.colors.border.subtle,
          borderWidth: 1,
        };
      case 'outline':
        return {
          backgroundColor: theme.colors.common.transparent,
          borderColor: theme.colors.forest[800],
          borderWidth: 1.5,
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.colors.forest[800],
          borderColor: theme.colors.forest[700],
          borderWidth: 1,
          shadowColor: theme.claymorphism.control.shadowColor,
          shadowOffset: theme.claymorphism.control.shadowOffset,
          shadowOpacity: theme.claymorphism.control.shadowOpacity,
          shadowRadius: theme.claymorphism.control.shadowRadius,
          elevation: theme.claymorphism.control.elevation,
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled) return theme.colors.ink.muted;
    if (variant === 'primary') return theme.colors.common.white;
    if (variant === 'outline') return theme.colors.forest[800];
    return theme.colors.ink.primary;
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: loading }}
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.buttonBase,
        {
          borderRadius: theme.radii.control,
          paddingHorizontal: theme.spacing[5],
        },
        getVariantStyles(),
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <BodyText weight="semiBold" color={getTextColor()}>
          {title}
        </BodyText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    minHeight: 48, // Accessible touch target >= 48dp
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.5,
  },
});

