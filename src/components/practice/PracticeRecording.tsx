import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioRecording } from '../../hooks/useAudioRecording';

interface PracticeRecordingProps {
  onSubmitRecording: (audioUri: string) => Promise<void>;
  content: string;
  isLoading?: boolean;
}

export default function PracticeRecording({
  onSubmitRecording,
  content,
  isLoading = false
}: PracticeRecordingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  const {
    isRecording,
    isProcessing,
    recordingUri,
    startRecording,
    stopRecording,
  } = useAudioRecording();

  React.useEffect(() => {
    if (isRecording) {
      let active = true;
      const pulse = () => {
        if (!active) return;
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished && active) pulse();
        });
      };
      pulse();
      return () => {
        active = false;
        pulseAnimation.stopAnimation();
        pulseAnimation.setValue(1);
      };
    }
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Recording Error", "Could not start recording. Please check microphone permissions and try again.");
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Recording Error", "Could not stop recording. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!recordingUri) return;

    setIsSubmitting(true);
    try {
      await onSubmitRecording(recordingUri);
    } catch (error) {
      console.error("Failed to submit recording:", error);
      Alert.alert("Submission Error", "Could not process your recording. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonColor = () => {
    if (isRecording) return '#E74C3C';
    if (recordingUri) return '#27AE60';
    return '#4A90E2';
  };

  const getButtonIcon = () => {
    if (isRecording) return 'stop';
    if (recordingUri) return 'checkmark';
    return 'mic';
  };

  const getButtonText = () => {
    if (isRecording) return 'Stop Recording';
    if (recordingUri) return 'Submit Recording';
    return 'Start Recording';
  };

  const isButtonDisabled = isProcessing || isSubmitting || isLoading;

  return (
    <View style={styles.container}>
      {/* Content Display */}
      <View style={styles.contentSection}>
        <Text style={styles.contentLabel}>Read this aloud:</Text>
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{content}</Text>
        </View>
      </View>

      {/* Recording Button */}
      <View style={styles.recordingSection}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            { backgroundColor: getButtonColor() },
            isButtonDisabled && styles.disabledButton
          ]}
          onPress={
            recordingUri 
              ? handleSubmit 
              : isRecording 
                ? handleStopRecording 
                : handleStartRecording
          }
          disabled={isButtonDisabled}
        >
          <Animated.View
            style={[
              styles.buttonContent,
              isRecording && { transform: [{ scale: pulseAnimation }] }
            ]}
          >
            <Ionicons 
              name={getButtonIcon()} 
              size={32} 
              color="white" 
            />
            <Text style={styles.buttonText}>
              {getButtonText()}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Status Messages */}
      <View style={styles.statusSection}>
        {isProcessing && (
          <Text style={styles.statusText}>Processing recording...</Text>
        )}
        {isSubmitting && (
          <Text style={styles.statusText}>Analyzing pronunciation...</Text>
        )}
        {recordingUri && !isSubmitting && (
          <Text style={styles.statusText}>Recording ready! Tap to submit.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentSection: {
    marginBottom: 20,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  contentContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  contentText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#2C3E50',
  },
  recordingSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  recordButton: {
    width: 200,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  statusSection: {
    alignItems: 'center',
    minHeight: 24,
  },
  statusText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
});