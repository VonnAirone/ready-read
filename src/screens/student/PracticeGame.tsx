import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { usePronunciationPractice } from '../../hooks/usePronunciationPractice';
import PracticeRecording from '../../components/practice/PracticeRecording';

interface PracticeGameProps {
  initialReaderLevel: 1 | 2 | 3 | 4;
  onExit: () => void;
}

export default function PracticeGame({ initialReaderLevel, onExit }: PracticeGameProps) {
  const {
    currentReaderLevel,
    currentMacroLevel,
    currentSubLevel,
    currentContent,
    score,
    isLoading,
    progressMessage,
    startPractice,
    submitAnswer,
    getContentTypeLabel,
    getProgressInfo
  } = usePronunciationPractice(initialReaderLevel);

  useEffect(() => {
    startPractice();
  }, []);

  const handleSubmitRecording = async (audioUri: string) => {
    try {
      await submitAnswer(audioUri);
    } catch (error) {
      Alert.alert('Error', 'Failed to process recording. Please try again.');
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Practice',
      'Are you sure you want to exit? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: onExit }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading practice content...</Text>
      </View>
    );
  }

  if (!currentContent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No content available</Text>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Text style={styles.exitButtonText}>Return to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progressInfo = getProgressInfo();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Text style={styles.exitButtonText}>Exit</Text>
        </TouchableOpacity>
        
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>
            Reader Level {currentReaderLevel}
          </Text>
          <Text style={styles.macroText}>
            Macro Level {currentMacroLevel}
          </Text>
        </View>
      </View>

      {/* Progress Information */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>
          {getContentTypeLabel()} Practice
        </Text>
        <Text style={styles.progressSubtext}>
          Sub-level {currentSubLevel} of 30
        </Text>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentSubLevel / 30) * 100}%` }
            ]} 
          />
        </View>
        
        <Text style={styles.progressDetails}>
          {progressInfo}
        </Text>

        {progressMessage && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{progressMessage}</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        <Text style={styles.contentLabel}>
          Read aloud:
        </Text>
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>
            {currentContent.content}
          </Text>
        </View>
        
        <Text style={styles.instructionText}>
          Focus on clear pronunciation, proper stress, and vowel sounds
        </Text>
      </View>

      {/* Recording Interface */}
      <PracticeRecording
        onSubmitRecording={handleSubmitRecording}
        content={currentContent.content}
        isLoading={isLoading}
      />

      {/* Score Display */}
      {score && (
        <View style={styles.scoreSection}>
          <Text style={styles.scoreTitle}>Last Score: {score.totalScore}%</Text>
          <View style={styles.scoreBreakdown}>
            <Text style={styles.scoreItem}>
              Phonemes: {score.phonemeAccuracy}% (60%)
            </Text>
            <Text style={styles.scoreItem}>
              Stress: {score.stressIntonation}% (25%)
            </Text>
            <Text style={styles.scoreItem}>
              Vowels: {score.vowelClarity}% (15%)
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  exitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
  },
  exitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  levelInfo: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  macroText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  progressSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressDetails: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
  messageContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#E8F4FD',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  messageText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
  },
  contentSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  contentContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  contentText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#2C3E50',
    textAlign: 'left',
  },
  instructionText: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scoreSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    fontSize: 12,
    color: '#6C757D',
  },
});