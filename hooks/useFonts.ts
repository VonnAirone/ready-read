import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export default function useCustomFonts() {
  const [fontsLoaded, fontError] = useFonts({
    'Figtree-Regular': require('../assets/fonts/Figtree-Regular.ttf'),
    'Figtree-Medium': require('../assets/fonts/Figtree-Medium.ttf'),
    'Figtree-SemiBold': require('../assets/fonts/Figtree-SemiBold.ttf'),
    'Figtree-Bold': require('../assets/fonts/Figtree-Bold.ttf'),
  });

  useEffect(() => {
    if (fontError) {
      console.error('Error loading fonts:', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    async function prepare() {
      try {
        // Keep splash screen visible while fonts are loading
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.warn('SplashScreen error:', e);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen when fonts are ready or if there's an error
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [fontsLoaded, fontError]);

  return fontsLoaded;
}