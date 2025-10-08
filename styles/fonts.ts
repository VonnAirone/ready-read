import { StyleSheet } from 'react-native';

export const globalFonts = StyleSheet.create({
  regular: {
    fontFamily: 'Figtree-Regular',
  },
  medium: {
    fontFamily: 'Figtree-Medium',
  },
  semiBold: {
    fontFamily: 'Figtree-SemiBold',
  },
  bold: {
    fontFamily: 'Figtree-Bold',
  },
});

// Font helper function
export const getFontFamily = (weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular') => {
  switch (weight) {
    case 'medium': return 'Figtree-Medium';
    case 'semibold': return 'Figtree-SemiBold';
    case 'bold': return 'Figtree-Bold';
    default: return 'Figtree-Regular';
  }
};