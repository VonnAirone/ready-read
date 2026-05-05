import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getSequentialContent,
  getContentTypeForMicroLevel,
  ContentItem
} from '../data/gameContent';
import { speechRecognitionService } from '../services/speechRecognition';
import { calculateScore } from '../services/scoring';
import { WordMatchResult } from '../types';

interface ScoreResult {
  totalScore: number;
}

export function usePronunciationPractice(initialReaderLevel: 1 | 2 | 3 | 4) {
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear all pending timers on unmount
  useEffect(() => {
    return () => {
      timerRefs.current.forEach(clearTimeout);
    };
  }, []);

  const [currentReaderLevel, setCurrentReaderLevel] = useState(initialReaderLevel);
  const [currentMacroLevel, setCurrentMacroLevel] = useState<1 | 2 | 3 | 4>(1);
  const [currentMicroLevel, setCurrentMicroLevel] = useState(1);

  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string>('');

  // New state for word-level feedback and first-attempt tracking
  const [wordResults, setWordResults] = useState<WordMatchResult[]>([]);
  const [allWordsCorrect, setAllWordsCorrect] = useState(false);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);
  const [firstAttemptScores, setFirstAttemptScores] = useState<Record<number, number>>({});
  const [macroComplete, setMacroComplete] = useState(false);

  const loadCurrentContent = useCallback(async () => {
    const content = await getSequentialContent(
      currentReaderLevel,
      currentMacroLevel,
      currentMicroLevel
    );
    setCurrentContent(content);
    setWordResults([]);
    setAllWordsCorrect(false);
    setScore(null);
    setIsFirstAttempt(true);
    return content;
  }, [currentReaderLevel, currentMacroLevel, currentMicroLevel]);

  const startPractice = useCallback(async () => {
    setIsLoading(true);
    const content = await loadCurrentContent();
    if (content) {
      setProgressMessage(`Starting ${getContentTypeForMicroLevel(currentMicroLevel)} practice`);
    } else {
      setProgressMessage('No content available for this level');
    }
    timerRefs.current.push(setTimeout(() => {
      setIsLoading(false);
      setProgressMessage('');
    }, 1000));
  }, [loadCurrentContent, currentMicroLevel]);

  const submitAnswer = useCallback(async (audioUri: string) => {
    if (!currentContent) return;

    setIsLoading(true);
    setProgressMessage('Processing your pronunciation...');

    try {
      const transcriptionResult = await speechRecognitionService.transcribeAudio(audioUri, currentContent.text);
      const transcription = transcriptionResult.text;

      if (!transcription || transcription.trim() === '') {
        setIsLoading(false);
        setProgressMessage('');
        throw new Error('No audio detected. Please try again and speak clearly into the microphone.');
      }

      const totalScore = calculateScore(transcription, currentContent.text);
      const scoreResult: ScoreResult = { totalScore };
      setScore(scoreResult);

      // Get word-level comparison
      const results = speechRecognitionService.getWordLevelResults(currentContent.text, transcription);
      setWordResults(results);

      const allCorrect = results.every(r => r.isCorrect);
      setAllWordsCorrect(allCorrect);

      // Record first attempt only
      if (isFirstAttempt) {
        const updatedScores = { ...firstAttemptScores, [currentMicroLevel]: scoreResult.totalScore };
        setFirstAttemptScores(updatedScores);
        setIsFirstAttempt(false);
      }

      if (allCorrect) {
        setProgressMessage(`Score: ${scoreResult.totalScore}% - All words correct!`);
      } else {
        const mispronounced = results.filter(r => !r.isCorrect).map(r => r.expected);
        setProgressMessage(`Some words need practice: ${mispronounced.join(', ')}`);
      }
    } catch (error) {
      setProgressMessage('Error processing recording. Please try again.');
      timerRefs.current.push(setTimeout(() => setProgressMessage(''), 3000));
    } finally {
      setIsLoading(false);
    }
  }, [currentContent, isFirstAttempt, firstAttemptScores, currentMicroLevel]);

  // Advance to next micro-level (called by UI when allWordsCorrect)
  const advanceToNext = useCallback(async () => {
    if (currentMicroLevel >= 30) {
      setMacroComplete(true);
      setProgressMessage('Macro Level Complete!');
      return;
    }
    const nextLevel = currentMicroLevel + 1;
    setCurrentMicroLevel(nextLevel);
    setScore(null);
    setWordResults([]);
    setAllWordsCorrect(false);
    setIsFirstAttempt(true);
    setProgressMessage('');

    // Load content for next micro-level
    const content = await getSequentialContent(currentReaderLevel, currentMacroLevel, nextLevel);
    setCurrentContent(content);
  }, [currentMicroLevel, currentReaderLevel, currentMacroLevel]);

  // Retry current content (resets recording state but not first-attempt score)
  const retryCurrentLevel = useCallback(() => {
    setScore(null);
    setWordResults([]);
    setAllWordsCorrect(false);
    setProgressMessage('');
    // isFirstAttempt stays false — retries don't overwrite recorded score
  }, []);

  const getContentTypeLabel = useCallback((microLevel?: number) => {
    const level = microLevel || currentMicroLevel;
    if (level <= 10) return 'Word';
    if (level <= 20) return 'Sentence';
    return 'Paragraph';
  }, [currentMicroLevel]);

  const getProgressInfo = useCallback(() => {
    const contentType = getContentTypeLabel();
    let typeProgress = '';
    if (currentMicroLevel <= 10) {
      typeProgress = `Word ${currentMicroLevel} of 10`;
    } else if (currentMicroLevel <= 20) {
      typeProgress = `Sentence ${currentMicroLevel - 10} of 10`;
    } else {
      typeProgress = `Paragraph ${currentMicroLevel - 20} of 10`;
    }
    return `Reader Level ${currentReaderLevel} • Macro Level ${currentMacroLevel} • ${typeProgress}`;
  }, [currentReaderLevel, currentMacroLevel, currentMicroLevel, getContentTypeLabel]);

  return {
    currentReaderLevel,
    currentMacroLevel,
    currentMicroLevel,
    currentContent,
    score,
    isLoading,
    progressMessage,
    wordResults,
    allWordsCorrect,
    isFirstAttempt,
    firstAttemptScores,
    macroComplete,
    startPractice,
    submitAnswer,
    advanceToNext,
    retryCurrentLevel,
    getContentTypeLabel,
    getProgressInfo
  };
}

