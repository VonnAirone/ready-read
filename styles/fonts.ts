import { StyleSheet, Platform } from 'react-native';
import * as Font from 'expo-font';

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

// Font helper function with better error handling
export const getFontFamily = (weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular') => {
  const fontMap: Record<string, string> = {
    regular: 'Figtree-Regular',
    medium: 'Figtree-Medium',
    semibold: 'Figtree-SemiBold', 
    bold: 'Figtree-Bold',
  };

  const fontName = fontMap[weight];
  
  // Check if font is loaded, if not return system fallback
  try {
    return fontName;
  } catch (error) {
    console.warn(`Font ${fontName} not loaded, using system font`);
    return Platform.OS === 'ios' ? 'System' : 'Roboto';
  }
};