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
  
  // Return the font name - expo-font will handle loading
  // If font isn't loaded yet, React Native will use system font temporarily
  return fontName || (Platform.OS === 'ios' ? 'System' : 'Roboto');
};