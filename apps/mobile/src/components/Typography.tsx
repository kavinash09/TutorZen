import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface HeadingProps extends TextProps {
  level?: 1 | 2 | 3;
  color?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  color,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();

  const getStyle = (): TextStyle => {
    const fontFamily =
      Platform.OS === 'web'
        ? theme.typography.fontFamilies.heading
        : theme.typography.fonts.heading;

    switch (level) {
      case 1:
        return {
          fontFamily,
          fontSize: theme.typography.fontSizes['3xl'],
          lineHeight: theme.typography.lineHeights['3xl'],
          color: color || theme.colors.ink.primary,
        };
      case 2:
        return {
          fontFamily,
          fontSize: theme.typography.fontSizes['2xl'],
          lineHeight: theme.typography.lineHeights['2xl'],
          color: color || theme.colors.ink.primary,
        };
      case 3:
      default:
        return {
          fontFamily,
          fontSize: theme.typography.fontSizes.xl,
          lineHeight: theme.typography.lineHeights.xl,
          color: color || theme.colors.ink.primary,
        };
    }
  };

  return (
    <Text accessibilityRole="header" style={[getStyle(), style]} {...props}>
      {children}
    </Text>
  );
};

export interface BodyTextProps extends TextProps {
  variant?: 'base' | 'sm' | 'xs' | 'lead';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  color?: string;
}

export const BodyText: React.FC<BodyTextProps> = ({
  variant = 'base',
  weight = 'regular',
  color,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();

  const getFontSize = (): number => {
    switch (variant) {
      case 'xs':
        return theme.typography.fontSizes.xs;
      case 'sm':
        return theme.typography.fontSizes.sm;
      case 'lead':
        return theme.typography.fontSizes.lg;
      case 'base':
      default:
        return theme.typography.fontSizes.base;
    }
  };

  const getLineHeight = (): number => {
    switch (variant) {
      case 'xs':
        return theme.typography.lineHeights.xs;
      case 'sm':
        return theme.typography.lineHeights.sm;
      case 'lead':
        return theme.typography.lineHeights.lg;
      case 'base':
      default:
        return theme.typography.lineHeights.base;
    }
  };

  const getFontFamily = (): string => {
    if (Platform.OS === 'web') {
      return theme.typography.fontFamilies.body;
    }
    switch (weight) {
      case 'medium':
        return theme.typography.fonts.bodyMedium;
      case 'semiBold':
        return theme.typography.fonts.bodySemiBold;
      case 'bold':
        return theme.typography.fonts.bodyBold;
      case 'regular':
      default:
        return theme.typography.fonts.body;
    }
  };

  return (
    <Text
      style={[
        {
          fontFamily: getFontFamily(),
          fontSize: getFontSize(),
          lineHeight: getLineHeight(),
          color: color || theme.colors.ink.primary,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

