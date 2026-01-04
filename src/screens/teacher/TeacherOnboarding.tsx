import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { getFontFamily } from '../../../styles/fonts';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  features: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    icon: 'school-outline',
    title: 'Welcome to Your\nTeaching Hub',
    description: 'Empower your students with advanced pronunciation learning tools',
    features: [
      'Create interactive pronunciation rooms',
      'Track student progress in real-time',
      'Access 4-level reader assessment system'
    ]
  },
  {
    icon: 'people-outline',
    title: 'Manage Your\nClassrooms',
    description: 'Create and organize pronunciation learning experiences',
    features: [
      'Generate unique room codes instantly',
      'Customize content for different levels',
      'Monitor multiple classes simultaneously'
    ]
  },
  {
    icon: 'analytics-outline',
    title: 'Track Student\nProgress',
    description: 'Get detailed insights into your students\' pronunciation development',
    features: [
      'View detailed performance analytics',
      'Export progress reports',
      'Identify areas needing improvement'
    ]
  }
];

interface TeacherOnboardingProps {
  navigation: any;
}

export default function TeacherOnboarding({ navigation }: TeacherOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and go to dashboard
      navigation.replace('TeacherDashboard');
    }
  };

  const handleSkip = () => {
    navigation.replace('TeacherDashboard');
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.activeDot,
                index < currentStep && styles.completedDot
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons 
              name={currentStepData.icon} 
              size={80} 
              color="rgba(255, 255, 255, 0.9)" 
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{currentStepData.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{currentStepData.description}</Text>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            {currentStepData.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureBullet}>
                  <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons 
                name={currentStep === onboardingSteps.length - 1 ? 'rocket' : 'arrow-forward'} 
                size={20} 
                color="white" 
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 20,
  },
  skipButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 10,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: 'white',
    width: 30,
  },
  completedDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: getFontFamily('bold'),
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 38,
  },
  description: {
    fontSize: 18,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 15,
  },
  featureBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: 'white',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 30,
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    gap: 10,
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
  },
});