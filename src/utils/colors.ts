// Color utility functions
import { COLORS, GRADIENTS } from '../constants/theme';

// Helper functions for consistent color usage
export const getButtonColor = (type: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
  switch (type) {
    case 'secondary': return COLORS.secondary;
    case 'tertiary': return COLORS.tertiary;
    default: return COLORS.primary;
  }
};

export const getGradient = (type: 'primary' | 'secondary' | 'accent' = 'primary') => {
  switch (type) {
    case 'secondary': return GRADIENTS.secondary;
    case 'accent': return GRADIENTS.accent;
    default: return GRADIENTS.primary;
  }
};

// Commonly used color combinations
export const colorSchemes = {
  loginScreen: {
    background: GRADIENTS.primary,
    button: COLORS.primary,
    accent: COLORS.primary,
  },
  teacherScreens: {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    accent: COLORS.tertiary,
  },
  studentScreens: {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    accent: COLORS.tertiary,
  },
};