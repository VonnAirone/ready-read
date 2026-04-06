import { useState, useCallback, useRef, useEffect } from 'react';
import { ASSESSMENT_ITEMS, determineReaderLevel, calculateTotalScore, READER_LEVEL_INFO } from '../data/assessmentData';
import { audioRecordingService } from '../services/audioRecording';
import { speechRecognitionService } from '../services/speechRecognition';
import { Alert } from 'react-native';

export type AssessmentPhase = 'intro' | 'progress' | 'recording' | 'processing' | 'results';

export interface AssessmentResult {
  itemId: string;
  content: string;
  percentage: number;
  points: number;
  readerLevel: number;
  focusArea: string;
}

export interface UsePronunciationGameProps {
  onComplete?: (readerLevel: 1 | 2 | 3 | 4, results: AssessmentResult[]) => void;
}

export function usePronunciationGame({ onComplete }: UsePronunciationGameProps = {}) {
  const [assessmentPhase, setAssessmentPhase] = useState<AssessmentPhase>('intro');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopRecordingRef = useRef<() => Promise<void>>();

  const currentItem = ASSESSMENT_ITEMS[currentItemIndex];
  const isLastItem = currentItemIndex >= ASSESSMENT_ITEMS.length - 1;

  const startAssessment = useCallback(() => {
    setAssessmentPhase('progress');
    setCurrentItemIndex(0);
    setAssessmentResults([]);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setIsRecording(true);
      const success = await audioRecordingService.startRecording();
      
      if (!success) {
        Alert.alert('Error', 'Failed to start recording. Please try again.');
        setIsRecording(false);
        return;
      }

      // Auto-stop recording after 10 seconds (use ref to avoid stale closure)
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecordingRef.current?.();
      }, 10000);

    } catch (error) {
      Alert.alert('Error', 'Recording failed. Please try again.');
      setIsRecording(false);
    }
  }, []);

  // Keep the ref pointing to the latest stopRecording so the auto-stop timeout
  // always calls the version with fresh currentItem / isLastItem values.
  const stopRecording = useCallback(async () => {
    try {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      setIsRecording(false);
      setIsProcessing(true);
      setAssessmentPhase('processing');

      const result = await audioRecordingService.stopRecording();
      
      if (!result.success || !result.uri) {
        Alert.alert('Error', result.error || 'Failed to stop recording');
        setIsProcessing(false);
        setAssessmentPhase('progress');
        return;
      }

      // Transcribe the audio
      const transcriptionResult = await speechRecognitionService.transcribeAudio(result.uri);

      if (!transcriptionResult.success) {
        Alert.alert('Error', transcriptionResult.error || 'Failed to process audio');
        setIsProcessing(false);
        setAssessmentPhase('progress');
        return;
      }

      // Check if no audio was detected (empty transcript)
      if (!transcriptionResult.text || transcriptionResult.text.trim() === '') {
        Alert.alert(
          'No Audio Detected', 
          'We couldn\'t detect any audio. Please try again and speak clearly into the microphone.',
          [{ text: 'Try Again', style: 'default' }]
        );
        setIsProcessing(false);
        setAssessmentPhase('progress');
        return;
      }

      // Calculate accuracy
      const accuracy = currentItem.keyWords 
        ? speechRecognitionService.getKeyWordAccuracy(
            currentItem.content, 
            transcriptionResult.text, 
            currentItem.keyWords
          )
        : speechRecognitionService.calculateAccuracy(
            currentItem.content, 
            transcriptionResult.text
          );

      // Store result
      const assessmentResult: AssessmentResult = {
        itemId: currentItem.id,
        content: currentItem.content,
        percentage: Math.round(accuracy),
        points: currentItem.points,
        readerLevel: currentItem.readerLevel,
        focusArea: currentItem.focusArea,
      };

      setAssessmentResults(prev => [...prev, assessmentResult]);
      setIsProcessing(false);

      // Move to next item or show results
      if (isLastItem) {
        setAssessmentPhase('results');
        calculateFinalLevel(assessmentResult);
      } else {
        setCurrentItemIndex(prev => prev + 1);
        setAssessmentPhase('progress');
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to process your recording. Please try again.');
      setIsProcessing(false);
      setAssessmentPhase('progress');
    }
  }, [currentItem, isLastItem]);

  // Keep the ref in sync with the latest stopRecording (inside useEffect to
  // avoid mutating a ref during render in React concurrent mode).
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const calculateFinalLevel = useCallback((lastResult: AssessmentResult) => {
    const allResults = [...assessmentResults, lastResult];
    const totalScore = allResults.reduce((sum, result) => sum + (result.percentage * 10 / 100), 0);
    const maxScore = ASSESSMENT_ITEMS.length * 10;

    let level: string;
    if (totalScore >= maxScore * 0.8) {
      level = 'advanced';
    } else if (totalScore >= maxScore * 0.6) {
      level = 'intermediate';
    } else {
      level = 'beginner';
    }

    // Don't auto-complete - let user manually proceed
    return { level, allResults };
  }, [assessmentResults]);

  const handleProceed = useCallback(() => {
    if (isLastItem) {
      setAssessmentPhase('results');
    } else {
      setCurrentItemIndex(prev => prev + 1);
    }
  }, [isLastItem]);

  const completeAssessment = useCallback(() => {
    const totalScore = calculateTotalScore(
      assessmentResults.map(result => ({ 
        percentage: result.percentage, 
        points: result.points 
      }))
    );
    const readerLevel = determineReaderLevel(totalScore);

    onComplete?.(readerLevel, assessmentResults);
  }, [assessmentResults, onComplete]);

  const resetAssessment = useCallback(() => {
    setAssessmentPhase('intro');
    setCurrentItemIndex(0);
    setAssessmentResults([]);
    setIsRecording(false);
    setIsProcessing(false);

    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }, []);

  // Cancel any active recording when the component using this hook unmounts
  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      audioRecordingService.cancelRecording();
    };
  }, []);

  return {
    assessmentPhase,
    currentItem,
    currentItemIndex,
    totalItems: ASSESSMENT_ITEMS.length,
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
  };
}