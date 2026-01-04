import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePronunciationGame } from '../../hooks/usePronunciationGame';
import { determineReaderLevel, calculateTotalScore } from '../../data/assessmentData';
import AssessmentIntro from '../../components/assessment/AssessmentIntro';
import AssessmentProgress from '../../components/assessment/AssessmentProgress';
import RecordingInterface from '../../components/assessment/RecordingInterface';
import AssessmentResults from '../../components/assessment/AssessmentResults';

interface PronunciationGameModularProps {
  onComplete?: (readerLevel: 1 | 2 | 3 | 4) => void;
  onBack?: () => void;
}

export default function PronunciationGameModular({
  onComplete,
  onBack,
}: PronunciationGameModularProps) {
  const {
    assessmentPhase,
    currentItem,
    currentItemIndex,
    totalItems,
    assessmentResults,
    isRecording,
    isProcessing,
    isLastItem,
    startAssessment,
    startRecording,
    stopRecording,
    handleProceed,
    completeAssessment,
    resetAssessment,
  } = usePronunciationGame({
    onComplete: (readerLevel, results) => {
      console.log('Assessment completed with Reader Level:', readerLevel);
      console.log('Results:', results);
      onComplete?.(readerLevel);
    },
  });

  const renderCurrentPhase = () => {
    switch (assessmentPhase) {
      case 'intro':
        return <AssessmentIntro onStartAssessment={startAssessment} />;

      case 'progress':
        return (
          <AssessmentProgress
            currentIndex={currentItemIndex}
            totalItems={totalItems}
            currentItem={currentItem}
            onProceed={() => {
              // Start recording phase
              handleProceed();
            }}
            isLastItem={isLastItem}
          />
        );

      case 'recording':
      case 'processing':
        return (
          <RecordingInterface
            currentItem={currentItem}
            isRecording={isRecording}
            isProcessing={isProcessing}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />
        );

      case 'results':
        const totalScore = calculateTotalScore(
          assessmentResults.map(result => ({ 
            percentage: result.percentage, 
            points: result.points 
          }))
        );
        const maxScore = totalItems * 10; // Each passage worth 10 points
        const readerLevel = determineReaderLevel(totalScore);

        return (
          <AssessmentResults
            readerLevel={readerLevel}
            totalScore={totalScore}
            maxScore={maxScore}
            results={assessmentResults}
            onStartPractice={completeAssessment}
          />
        );

      default:
        return <AssessmentIntro onStartAssessment={startAssessment} />;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a237e', '#3949ab', '#5c6bc0']}
        style={styles.gradient}
      >
        {renderCurrentPhase()}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});