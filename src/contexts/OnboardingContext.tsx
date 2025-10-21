import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  isFirstTime: boolean;
  setFirstTimeComplete: () => void;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      setIsFirstTime(hasSeenOnboarding === null);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsFirstTime(true);
    } finally {
      setIsLoading(false);
    }
  };

  const setFirstTimeComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error setting onboarding complete:', error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isFirstTime,
        setFirstTimeComplete,
        isLoading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};