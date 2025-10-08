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

// Font helper function (using system fonts for now)
export const getFontFamily = (weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular') => {
  // Temporarily using system fonts until Figtree is added
  return 'System';
  
  // Uncomment when Figtree fonts are added:
  // switch (weight) {
  //   case 'medium': return 'Figtree-Medium';
  //   case 'semibold': return 'Figtree-SemiBold';
  //   case 'bold': return 'Figtree-Bold';
  //   default: return 'Figtree-Regular';
  // }
};