import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AssessmentItem } from '../../data/assessmentData';

interface RecordingInterfaceProps {
  currentItem: AssessmentItem;
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export default function RecordingInterface({
  currentItem,
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
}: RecordingInterfaceProps) {
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isRecording) {
      const pulse = () => {
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
        ]).start(pulse);
      };
      pulse();
    } else {
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording, pulseAnimation]);

  const getButtonColor = () => {
    if (isProcessing) return '#FF9800';
    if (isRecording) return '#F44336';
    return '#4CAF50';
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (isRecording) return 'Stop Recording';
    return 'Start Recording';
  };

  const getButtonIcon = () => {
    if (isProcessing) return 'hourglass';
    if (isRecording) return 'stop';
    return 'mic';
  };

  const handlePress = () => {
    if (isProcessing) return;
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <View style={styles.container}>
      {/* Passage Display */}
      <View style={styles.sentenceContainer}>
        <Text style={styles.sentenceType}>Reader Level {currentItem.readerLevel} Assessment</Text>
        <Text style={styles.focusArea}>{currentItem.focusArea}</Text>
        <Text style={styles.sentence}>{currentItem.content}</Text>
        
        {currentItem.keyWords && currentItem.keyWords.length > 0 && (
          <View style={styles.keyWordsContainer}>
            <Text style={styles.keyWordsLabel}>Key vocabulary to focus on:</Text>
            <View style={styles.keyWords}>
              {currentItem.keyWords.map((word, index) => (
                <Text key={index} style={styles.keyWord}>
                  {word}
                </Text>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>Worth {currentItem.points} points</Text>
        </View>
      </View>

      {/* Recording Status */}
      <View style={styles.statusContainer}>
        {isRecording && (
          <View style={styles.recordingStatus}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        )}
        {isProcessing && (
          <Text style={styles.processingText}>
            Processing your pronunciation...
          </Text>
        )}
      </View>

      {/* Record Button */}
      <TouchableOpacity
        style={styles.recordButtonContainer}
        onPress={handlePress}
        disabled={isProcessing}
      >
        <Animated.View
          style={[
            styles.recordButton,
            {
              backgroundColor: getButtonColor(),
              transform: [{ scale: pulseAnimation }],
            },
          ]}
        >
          <Ionicons 
            name={getButtonIcon() as any} 
            size={40} 
            color="#ffffff" 
          />
        </Animated.View>
      </TouchableOpacity>

      <Text style={styles.buttonLabel}>
        {getButtonText()}
      </Text>

      {!isRecording && !isProcessing && (
        <Text style={styles.instruction}>
          Tap the microphone and read the passage clearly
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  sentenceContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  sentenceType: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600" as const,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  focusArea: {
    fontSize: 12,
    color: "#FFB74D",
    fontWeight: "500" as const,
    marginBottom: 15,
    textAlign: "center" as const,
  },
  sentence: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "500" as const,
    textAlign: "center" as const,
    lineHeight: 30,
    marginBottom: 20,
  },
  keyWordsContainer: {
    alignItems: "center" as const,
    marginBottom: 15,
  },
  keyWordsLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 10,
  },
  keyWords: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "center" as const,
  },
  keyWord: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "500" as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 2,
  },
  pointsContainer: {
    backgroundColor: "rgba(255, 152, 0, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pointsText: {
    fontSize: 14,
    color: "#FFB74D",
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },
  statusContainer: {
    height: 60,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  recordingStatus: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#F44336",
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    color: "#F44336",
    fontWeight: "600" as const,
  },
  processingText: {
    fontSize: 16,
    color: "#FF9800",
    fontWeight: "500" as const,
    textAlign: "center" as const,
  },
  recordButtonContainer: {
    marginBottom: 20,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600" as const,
    marginBottom: 10,
    textAlign: "center" as const,
  },
  instruction: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center" as const,
    marginBottom: 40,
  },
});