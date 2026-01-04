import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { READER_LEVEL_INFO } from '../../data/assessmentData';

interface AssessmentResult {
  itemId: string;
  content: string;
  percentage: number;
  points: number;
  readerLevel: number;
  focusArea: string;
}

interface AssessmentResultsProps {
  readerLevel: 1 | 2 | 3 | 4;
  totalScore: number;
  maxScore: number;
  results: AssessmentResult[];
  onStartPractice: () => void;
}

const getReaderLevelInfo = (level: 1 | 2 | 3 | 4) => {
  const levelInfo = READER_LEVEL_INFO[level];
  const colors = {
    1: { primary: '#4CAF50', secondary: '#66BB6A' }, // Green for Level 1
    2: { primary: '#2196F3', secondary: '#42A5F5' }, // Blue for Level 2  
    3: { primary: '#FF9800', secondary: '#FFB74D' }, // Orange for Level 3
    4: { primary: '#9C27B0', secondary: '#BA68C8' }  // Purple for Level 4
  };
  
  return {
    ...levelInfo,
    colors: colors[level],
    icon: level === 1 ? 'leaf' : level === 2 ? 'school' : level === 3 ? 'library' : 'rocket'
  };
};

const getScoreColor = (percentage: number) => {
  if (percentage >= 80) return '#4CAF50';
  if (percentage >= 60) return '#FF9800';
  return '#F44336';
};

export default function AssessmentResults({
  readerLevel,
  totalScore,
  maxScore,
  results,
  onStartPractice,
}: AssessmentResultsProps) {
  const levelInfo = getReaderLevelInfo(readerLevel);
  const overallPercentage = Math.round((totalScore / maxScore) * 100);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Trophy and Reader Level Display */}
        <View style={styles.trophyContainer}>
          <Ionicons 
            name="trophy" 
            size={80} 
            color={levelInfo.colors.primary} 
          />
          <Text style={styles.levelTitle}>{levelInfo.label}</Text>
          <Text style={styles.levelFocus}>{levelInfo.focus}</Text>
          <Text style={styles.levelMessage}>{levelInfo.description}</Text>
        </View>

        {/* Score Range Information */}
        <View style={styles.scoreRangeContainer}>
          <Text style={styles.scoreRangeTitle}>Your Score Range</Text>
          <Text style={[styles.scoreRangeText, { color: levelInfo.colors.primary }]}>
            {levelInfo.scoreRange}
          </Text>
          <Text style={styles.yourScore}>
            You scored: {totalScore} out of {maxScore} points ({overallPercentage}%)
          </Text>
        </View>

        {/* Individual Passage Results */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Passage Results</Text>
          {results.map((result, index) => (
            <View key={result.itemId} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultNumber}>Reader Level {result.readerLevel} Passage</Text>
                <Text style={[
                  styles.resultPercentage,
                  { color: getScoreColor(result.percentage) }
                ]}>
                  {result.percentage}% ({Math.round((result.percentage / 100) * result.points)}/{result.points}pts)
                </Text>
              </View>
              <Text style={styles.resultType}>{result.focusArea}</Text>
              <Text style={styles.resultContent} numberOfLines={2}>
                {result.content}
              </Text>
            </View>
          ))}
        </View>

        {/* Start Practice Button */}
        <TouchableOpacity style={styles.startButton} onPress={onStartPractice}>
          <Text style={styles.startButtonText}>Continue to Practice</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.transitionMessage}>
          Ready to practice at your {levelInfo.label}? Tap the button above to continue.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: "center" as const,
  },
  trophyContainer: {
    alignItems: "center" as const,
    marginBottom: 30,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: "#ffffff",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  levelFocus: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center" as const,
  },
  levelMessage: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center" as const,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  scoreRangeContainer: {
    alignItems: "center" as const,
    marginBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  scoreRangeTitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  scoreRangeText: {
    fontSize: 20,
    fontWeight: "bold" as const,
    marginBottom: 8,
  },
  yourScore: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  resultsContainer: {
    width: "100%",
    marginBottom: 40,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center" as const,
  },
  resultItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  resultNumber: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  resultPercentage: {
    fontSize: 14,
    fontWeight: "bold" as const,
  },
  resultType: {
    fontSize: 12,
    color: "#4CAF50",
    marginBottom: 4,
  },
  resultContent: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginRight: 8,
  },
  transitionMessage: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center" as const,
    fontStyle: "italic" as const,
  },
});