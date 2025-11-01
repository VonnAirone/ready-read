import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

interface SoundWaveAnimationProps {
  isRecording: boolean;
  audioLevel?: number; // 0 to 1
  color?: string;
  numberOfWaves?: number;
}

const SoundWaveAnimation: React.FC<SoundWaveAnimationProps> = ({
  isRecording,
  audioLevel = 0.5,
  color = '#4CAF50',
  numberOfWaves = 5
}) => {
  const waveAnimations = useRef(
    Array.from({ length: numberOfWaves }, () => new Animated.Value(0.3))
  ).current;

  const { width } = Dimensions.get('window');
  const waveWidth = Math.min(width * 0.6, 300);
  const barWidth = (waveWidth - (numberOfWaves - 1) * 4) / numberOfWaves;

  useEffect(() => {
    if (isRecording) {
      startWaveAnimation();
    } else {
      stopWaveAnimation();
    }
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      // Update wave heights based on audio level
      updateWaveHeights();
    }
  }, [audioLevel, isRecording]);

  const startWaveAnimation = () => {
    // Create staggered wave animations
    waveAnimations.forEach((animation, index) => {
      const animateWave = () => {
        Animated.sequence([
          Animated.timing(animation, {
            toValue: Math.random() * 0.7 + 0.3, // Random height between 0.3 and 1
            duration: 150 + Math.random() * 100, // Random duration 150-250ms
            useNativeDriver: false,
          }),
          Animated.timing(animation, {
            toValue: Math.random() * 0.5 + 0.2, // Random low height
            duration: 100 + Math.random() * 100,
            useNativeDriver: false,
          }),
        ]).start(() => {
          if (isRecording) {
            animateWave(); // Continue animation
          }
        });
      };

      // Start each wave with a slight delay for staggered effect
      setTimeout(() => {
        if (isRecording) {
          animateWave();
        }
      }, index * 50);
    });
  };

  const updateWaveHeights = () => {
    // Update waves based on actual audio level
    waveAnimations.forEach((animation, index) => {
      const baseHeight = 0.2;
      const maxHeight = 0.9;
      const waveHeight = baseHeight + (audioLevel * maxHeight);
      
      // Add some randomness and variation between waves
      const variation = (Math.sin(Date.now() * 0.01 + index) + 1) * 0.1;
      const finalHeight = Math.min(waveHeight + variation, 1);

      Animated.timing(animation, {
        toValue: finalHeight,
        duration: 100,
        useNativeDriver: false,
      }).start();
    });
  };

  const stopWaveAnimation = () => {
    // Animate all waves to minimum height
    waveAnimations.forEach(animation => {
      Animated.timing(animation, {
        toValue: 0.1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  const renderWaves = () => {
    return waveAnimations.map((animation, index) => (
      <Animated.View
        key={index}
        style={[
          styles.wave,
          {
            width: barWidth,
            backgroundColor: isRecording 
              ? color 
              : `${color}40`, // Semi-transparent when not recording
            height: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [4, 60], // Min 4px, max 60px height
            }),
            opacity: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1], // Fade effect
            }),
          }
        ]}
      />
    ));
  };

  return (
    <View style={[styles.container, { width: waveWidth }]}>
      <View style={styles.waveContainer}>
        {renderWaves()}
      </View>
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Animated.View style={[styles.recordingDot, { backgroundColor: color }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    gap: 4,
  },
  wave: {
    borderRadius: 2,
    minHeight: 4,
  },
  recordingIndicator: {
    marginTop: 10,
    alignItems: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
});

export default SoundWaveAnimation;