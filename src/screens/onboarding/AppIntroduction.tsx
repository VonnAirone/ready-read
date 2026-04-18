import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SPACING, FONT_SIZES } from '../../constants/theme';
import { getFontFamily } from '../../../styles/fonts';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to\nFeedbackPronunciation',
    subtitle: 'Perfect Your Pronunciation',
    description: 'AI-powered pronunciation feedback to help you speak with confidence. Practice, learn, and improve your speaking skills.',
    icon: '🎤',
    color: GRADIENTS.primary,
  },
  {
    id: 2,
    title: 'Interactive\nLearning',
    subtitle: 'Real-time Feedback',
    description: 'Get instant feedback on your pronunciation with our advanced AI checker. Join classrooms and compete with friends.',
    icon: '🎯',
    color: GRADIENTS.accent,
  },
  {
    id: 3,
    title: 'Track Your\nProgress',
    subtitle: 'See Your Improvement',
    description: 'Monitor your learning journey with detailed analytics, scores, and progress tracking across all your sessions.',
    icon: '📈',
    color: GRADIENTS.secondary,
  },
];

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const gradientOpacity = useRef(new Animated.Value(1)).current;

  const currentItem = onboardingData[currentIndex];

  const animateToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      // Fade out current content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(iconScaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(gradientOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Change content
        setCurrentIndex(currentIndex + 1);
        
        // Reset animation values
        slideAnim.setValue(50);
        
        // Fade in new content
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(iconScaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(gradientOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
        ]).start();
      });
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.gradientContainer, { opacity: gradientOpacity }]}>
        <LinearGradient colors={currentItem.color} style={styles.gradient}>
          {/* Skip Button */}
          {currentIndex < onboardingData.length - 1 && (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}

          {/* Content Container */}
          <View style={styles.contentContainer}>
            {/* Top Section - Icon and Text */}
            <View style={styles.topSection}>
              {/* Animated Icon */}
              <Animated.View 
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: iconScaleAnim }],
                  }
                ]}
              >
                <Text style={styles.icon}>{currentItem.icon}</Text>
              </Animated.View>

              {/* Animated Text Content */}
              <Animated.View 
                style={[
                  styles.textContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }
                ]}
              >
                <Text style={styles.title}>{currentItem.title}</Text>
                <Text style={styles.subtitle}>{currentItem.subtitle}</Text>
                <Text style={styles.description}>{currentItem.description}</Text>
              </Animated.View>
            </View>

            {/* Bottom Section - Pagination and Button */}
            <View style={styles.bottomSection}>
              {/* Static Pagination Dots */}
              <View style={styles.pagination}>
                {onboardingData.map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: i === currentIndex ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                        width: i === currentIndex ? 20 : 10,
                        transform: [{ scale: i === currentIndex ? 1.2 : 1 }],
                      }
                    ]}
                  />
                ))}
              </View>

              {/* Action Button */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={currentIndex === onboardingData.length - 1 ? styles.getStartedButton : styles.nextButton}
                  onPress={animateToNext}
                >
                  <Text style={currentIndex === onboardingData.length - 1 ? styles.getStartedText : styles.nextText}>
                    {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
                  </Text>
                  <Ionicons 
                    name={currentIndex === onboardingData.length - 1 ? "arrow-forward" : "chevron-forward"} 
                    size={20} 
                    color={currentIndex === onboardingData.length - 1 ? COLORS.primary : "#fff"} 
                    style={{ marginLeft: currentIndex === onboardingData.length - 1 ? 8 : 4 }} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontFamily: getFontFamily('medium'),
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 60,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  icon: {
    fontSize: 60,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES['3xl'],
    fontFamily: getFontFamily('bold'),
    color: '#fff',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZES['3xl'] * 1.2,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: getFontFamily('semibold'),
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.base,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: SPACING.md,
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    color: '#fff',
    fontSize: FONT_SIZES.base,
    fontFamily: getFontFamily('semibold'),
  },
  getStartedButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  getStartedText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.lg,
    fontFamily: getFontFamily('bold'),
  },
});