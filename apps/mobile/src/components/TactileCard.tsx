import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface TactileCardProps extends ViewProps {
  raised?: boolean;
  padding?: 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

export const TactileCard: React.FC<TactileCardProps> = ({
  raised = false,
  padding = 4,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();
  const clayPreset = raised ? theme.claymorphism.cardRaised : theme.claymorphism.card;

  return (
    <View
      style={[
        styles.cardBase,
        {
          backgroundColor: clayPreset.backgroundColor,
          borderColor: clayPreset.borderColor,
          borderWidth: clayPreset.borderWidth,
          borderRadius: theme.radii.card,
          padding: theme.spacing[padding],
          shadowColor: clayPreset.shadowColor,
          shadowOffset: clayPreset.shadowOffset,
          shadowOpacity: clayPreset.shadowOpacity,
          shadowRadius: clayPreset.shadowRadius,
          elevation: clayPreset.elevation,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    overflow: 'visible',
  },
});

