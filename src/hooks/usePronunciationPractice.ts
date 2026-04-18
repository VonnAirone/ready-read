import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getSequentialContent,
  getContentTypeForMicroLevel,
  ContentItem
} from '../data/gameContent';
import { speechRecognitionService } from '../services/speechRecognition';
import { WordMatchResult } from '../types';

interface ScoreResult {
  phonemeAccuracy: number;
  stressIntonation: number;
  vowelClarity: number;
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

      // Use Azure's real scores if available, otherwise fall back to text-based calculation
      const scoreResult = transcriptionResult.azureScores
        ? {
            phonemeAccuracy: Math.round(transcriptionResult.azureScores.accuracyScore),
            stressIntonation: Math.round(transcriptionResult.azureScores.fluencyScore),
            vowelClarity: Math.round(transcriptionResult.azureScores.completenessScore),
            totalScore: Math.round(transcriptionResult.azureScores.pronScore),
          }
        : calculatePronunciationScore(currentContent.text, transcription);
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

// Helper function to calculate pronunciation score
function calculatePronunciationScore(expectedText: string, actualText: string): ScoreResult {
  const expectedWords = expectedText.toLowerCase().split(/\s+/);
  const actualWords = actualText.toLowerCase().split(/\s+/);

  let matchedWords = 0;
  const minLength = Math.min(expectedWords.length, actualWords.length);

  for (let i = 0; i < minLength; i++) {
    if (expectedWords[i] === actualWords[i]) {
      matchedWords++;
    } else {
      const similarity = calculateSimilarity(expectedWords[i], actualWords[i]);
      if (similarity > 0.7) {
        matchedWords += similarity;
      }
    }
  }

  const baseAccuracy = (matchedWords / expectedWords.length) * 100;

  const phonemeAccuracy = Math.max(0, Math.min(100, baseAccuracy));
  const stressIntonation = Math.max(0, Math.min(100, baseAccuracy));
  const vowelClarity = Math.max(0, Math.min(100, baseAccuracy));

  const totalScore = Math.round(
    (phonemeAccuracy * 0.6) +
    (stressIntonation * 0.25) +
    (vowelClarity * 0.15)
  );

  return {
    phonemeAccuracy: Math.round(phonemeAccuracy),
    stressIntonation: Math.round(stressIntonation),
    vowelClarity: Math.round(vowelClarity),
    totalScore
  };
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}
