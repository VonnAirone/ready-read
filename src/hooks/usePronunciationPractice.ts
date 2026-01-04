import { useState, useCallback } from 'react';
import { 
  getContentForLevel, 
  getSubLevelContent, 
  calculateProgression,
  ContentItem,
  GameProgress 
} from '../data/gameContent';
import { SpeechRecognitionService } from '../services/speechRecognition';

interface ScoreResult {
  phonemeAccuracy: number;
  stressIntonation: number;
  vowelClarity: number;
  totalScore: number;
}

export function usePronunciationPractice(initialReaderLevel: 1 | 2 | 3 | 4) {
  const [gameProgress, setGameProgress] = useState<GameProgress>({
    currentReaderLevel: initialReaderLevel,
    currentMacroLevel: 1,
    currentSubLevel: 1,
    completedContent: [],
    scores: {}
  });

  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const loadCurrentContent = useCallback(() => {
    const content = getSubLevelContent(
      gameProgress.currentReaderLevel,
      gameProgress.currentMacroLevel,
      gameProgress.currentSubLevel
    );
    setCurrentContent(content);
    return content;
  }, [gameProgress.currentReaderLevel, gameProgress.currentMacroLevel, gameProgress.currentSubLevel]);

  const startPractice = useCallback(() => {
    setIsLoading(true);
    
    // Load initial content
    const content = loadCurrentContent();
    
    if (content) {
      setProgressMessage(`Starting ${getContentTypeLabel(gameProgress.currentSubLevel)} practice`);
    } else {
      setProgressMessage('No content available for this level');
    }
    
    setTimeout(() => {
      setIsLoading(false);
      setProgressMessage('');
    }, 1000);
  }, [loadCurrentContent, gameProgress.currentSubLevel]);

  const submitAnswer = useCallback(async (audioUri: string) => {
    if (!currentContent) return;

    setIsLoading(true);
    setProgressMessage('Processing your pronunciation...');

    try {
      // Get transcription
      const speechService = new SpeechRecognitionService();
      const transcriptionResult = await speechService.transcribeAudio(audioUri, currentContent.content);
      const transcription = transcriptionResult.text;
      
      // Calculate pronunciation score
      const scoreResult = calculatePronunciationScore(
        currentContent.content, 
        transcription
      );
      
      setScore(scoreResult);

      // Update game progress
      const progression = calculateProgression(scoreResult.totalScore, gameProgress.currentSubLevel);
      
      // Save score
      const updatedScores = {
        ...gameProgress.scores,
        [currentContent.id]: {
          ...scoreResult,
          attempts: (gameProgress.scores[currentContent.id]?.attempts || 0) + 1
        }
      };

      // Update progress
      const newGameProgress: GameProgress = {
        ...gameProgress,
        currentSubLevel: progression.newSubLevel,
        completedContent: [...gameProgress.completedContent, currentContent.id],
        scores: updatedScores
      };

      // Check if macro level completed
      if (progression.newSubLevel > 30) {
        // Advance to next macro level
        newGameProgress.currentMacroLevel = Math.min(gameProgress.currentMacroLevel + 1, 4) as 1 | 2 | 3 | 4;
        newGameProgress.currentSubLevel = 1;
        setProgressMessage(`Congratulations! Advanced to Macro Level ${newGameProgress.currentMacroLevel}`);
      } else if (progression.action === 'advance') {
        setProgressMessage(`Great job! Score: ${scoreResult.totalScore}% - Advancing to next sub-level`);
      } else if (progression.action === 'stay') {
        setProgressMessage(`Good effort! Score: ${scoreResult.totalScore}% - Practice this level again`);
      } else {
        setProgressMessage(`Score: ${scoreResult.totalScore}% - Let's try an easier level`);
      }

      setGameProgress(newGameProgress);
      
      // Load new content after a delay
      setTimeout(() => {
        loadCurrentContent();
        setProgressMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error processing recording:', error);
      setProgressMessage('Error processing recording. Please try again.');
      setTimeout(() => setProgressMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [currentContent, gameProgress, loadCurrentContent]);

  const getContentTypeLabel = useCallback((subLevel?: number) => {
    const level = subLevel || gameProgress.currentSubLevel;
    if (level <= 10) return 'Word';
    if (level <= 20) return 'Sentence'; 
    return 'Paragraph';
  }, [gameProgress.currentSubLevel]);

  const getProgressInfo = useCallback(() => {
    const { currentReaderLevel, currentMacroLevel, currentSubLevel } = gameProgress;
    const contentType = getContentTypeLabel();
    
    let typeProgress = '';
    if (currentSubLevel <= 10) {
      typeProgress = `Word ${currentSubLevel} of 10`;
    } else if (currentSubLevel <= 20) {
      typeProgress = `Sentence ${currentSubLevel - 10} of 10`;
    } else {
      typeProgress = `Paragraph ${currentSubLevel - 20} of 10`;
    }

    return `Reader Level ${currentReaderLevel} • Macro Level ${currentMacroLevel} • ${typeProgress}`;
  }, [gameProgress, getContentTypeLabel]);

  return {
    currentReaderLevel: gameProgress.currentReaderLevel,
    currentMacroLevel: gameProgress.currentMacroLevel,
    currentSubLevel: gameProgress.currentSubLevel,
    currentContent,
    score,
    isLoading,
    progressMessage,
    startPractice,
    submitAnswer,
    getContentTypeLabel,
    getProgressInfo
  };
}

// Helper function to calculate pronunciation score
function calculatePronunciationScore(expectedText: string, actualText: string): ScoreResult {
  // This is a simplified scoring algorithm
  // In a real implementation, you would use more sophisticated speech analysis
  
  const expectedWords = expectedText.toLowerCase().split(/\s+/);
  const actualWords = actualText.toLowerCase().split(/\s+/);
  
  // Basic word matching for phoneme accuracy
  let matchedWords = 0;
  const minLength = Math.min(expectedWords.length, actualWords.length);
  
  for (let i = 0; i < minLength; i++) {
    if (expectedWords[i] === actualWords[i]) {
      matchedWords++;
    } else {
      // Check for partial matches (simplified)
      const similarity = calculateSimilarity(expectedWords[i], actualWords[i]);
      if (similarity > 0.7) {
        matchedWords += similarity;
      }
    }
  }
  
  // Calculate scores with some randomization for realistic simulation
  const baseAccuracy = (matchedWords / expectedWords.length) * 100;
  const variance = Math.random() * 20 - 10; // ±10% variance
  
  const phonemeAccuracy = Math.max(0, Math.min(100, baseAccuracy + variance));
  const stressIntonation = Math.max(0, Math.min(100, baseAccuracy + (Math.random() * 15 - 7.5)));
  const vowelClarity = Math.max(0, Math.min(100, baseAccuracy + (Math.random() * 10 - 5)));
  
  // Weighted average: 60% phonemes, 25% stress, 15% vowels
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

// Simple string similarity function
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
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