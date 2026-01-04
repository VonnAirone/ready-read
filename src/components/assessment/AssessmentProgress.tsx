import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AssessmentItem } from '../../data/assessmentData';

interface AssessmentProgressProps {
  currentIndex: number;
  totalItems: number;
  currentItem: AssessmentItem;
  onProceed: () => void;
  isLastItem: boolean;
}

export default function AssessmentProgress({
  currentIndex,
  totalItems,
  currentItem,
  onProceed,
  isLastItem,
}: AssessmentProgressProps) {
  const progressPercentage = ((currentIndex + 1) / totalItems) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {totalItems}
        </Text>
      </View>

      {/* Current Passage Info */}
      <View style={styles.sentenceInfo}>
        <Text style={styles.sentenceType}>Reader Level {currentItem.readerLevel} Assessment</Text>
        <Text style={styles.focusArea}>{currentItem.focusArea}</Text>
        <Text style={styles.sentence}>{currentItem.content}</Text>
        <Text style={styles.instruction}>
          Read this passage aloud when ready ({currentItem.points} points)
        </Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity style={styles.proceedButton} onPress={onProceed}>
        <Text style={styles.proceedButtonText}>
          {isLastItem ? 'Complete Assessment' : 'Next Passage'}
        </Text>
        <Ionicons 
          name={isLastItem ? "checkmark" : "arrow-forward"} 
          size={20} 
          color="#ffffff" 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center" as const,
  },
  sentenceInfo: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  sentenceType: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600" as const,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  focusArea: {
    fontSize: 14,
    color: "#FFB74D",
    fontWeight: "500" as const,
    marginBottom: 12,
    textAlign: "center" as const,
  },
  sentence: {
    fontSize: 22,
    color: "#ffffff",
    fontWeight: "500" as const,
    textAlign: "center" as const,
    lineHeight: 32,
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center" as const,
  },
  proceedButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 40,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginRight: 8,
  },
});