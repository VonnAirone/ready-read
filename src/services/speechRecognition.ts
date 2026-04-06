import { getAzureSpeechService, AzureWordResult } from './azureSpeech';
import { WordMatchResult } from '../types';

export interface TranscriptionResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
  azureScores?: {
    accuracyScore: number;
    fluencyScore: number;
    completenessScore: number;
    pronScore: number;
  };
}

export class SpeechRecognitionService {
  // Cached word results from the last assessPronunciation call
  private lastWordResults: AzureWordResult[] = [];

  async transcribeAudio(audioUri: string, expectedText?: string): Promise<TranscriptionResult> {
    try {
      const service = getAzureSpeechService();

      if (expectedText && expectedText.trim()) {
        // Full pronunciation assessment — returns word-level scores
        const result = await service.assessPronunciation(audioUri, expectedText);
        this.lastWordResults = result.words;

        if (!result.recognizedText) {
          return { text: '', confidence: 0, success: false, error: 'No transcription text received' };
        }

        return {
          text: result.recognizedText,
          confidence: result.accuracyScore / 100,
          success: true,
          azureScores: {
            accuracyScore: result.accuracyScore,
            fluencyScore: result.fluencyScore,
            completenessScore: result.completenessScore,
            pronScore: result.pronScore,
          },
        };
      } else {
        // Plain transcription (no reference text available)
        this.lastWordResults = [];
        const result = await service.transcribeOnly(audioUri);

        if (!result.text) {
          return { text: '', confidence: 0, success: false, error: 'No transcription text received' };
        }

        return { text: result.text, confidence: result.confidence, success: true };
      }
    } catch (error) {
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Calculates overall accuracy (0–100) between expected and transcribed text.
   * Uses Azure scores when available, otherwise Levenshtein-based comparison.
   */
  calculateAccuracy(original: string, transcribed: string): number {
    const results = this.getWordLevelResults(original, transcribed);
    if (results.length === 0) return 0;
    const correct = results.filter(r => r.isCorrect).length;
    return (correct / results.length) * 100;
  }

  /**
   * Calculates accuracy (0–100) based only on a specific set of keywords.
   * Useful when only key words matter for scoring (e.g. word-level assessment items).
   */
  getKeyWordAccuracy(original: string, transcribed: string, keywords: string[]): number {
    if (keywords.length === 0) return this.calculateAccuracy(original, transcribed);
    const normalize = (w: string) => w.toLowerCase().replace(/[^\w]/g, '');
    const transcribedWords = transcribed.toLowerCase().split(/\s+/).map(normalize);
    const matched = keywords.filter(kw => {
      const normalized = normalize(kw);
      return transcribedWords.some(w => this.wordSimilarity(w, normalized) >= 0.70);
    });
    return (matched.length / keywords.length) * 100;
  }

  /**
   * Returns per-word pronunciation results.
   * Uses Azure word scores when available (set after assessPronunciation),
   * falls back to Levenshtein comparison otherwise.
   */
  getWordLevelResults(original: string, transcribed: string): WordMatchResult[] {
    if (this.lastWordResults.length > 0) {
      return this.lastWordResults.map(w => ({
        expected: w.word,
        spoken: w.errorType === 'None' ? w.word : null,
        isCorrect: w.accuracyScore >= 70 && w.errorType !== 'Mispronunciation' && w.errorType !== 'Omission',
        similarity: w.accuracyScore / 100,
        phonemes: w.phonemes,
      }));
    }

    // Fallback: text-based Levenshtein comparison
    const normalizeText = (text: string) =>
      text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

    const expectedWords = normalizeText(original).split(' ').filter(w => w.length > 0);
    const transcribedWords = normalizeText(transcribed).split(' ').filter(w => w.length > 0);

    return expectedWords.map((expected, i) => {
      const spoken = transcribedWords[i] || null;
      if (!spoken) {
        return { expected, spoken: null, isCorrect: false, similarity: 0 };
      }
      const sim = this.wordSimilarity(expected, spoken);
      return { expected, spoken, isCorrect: sim >= 0.70, similarity: sim };
    });
  }

  private wordSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;

    const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
        else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return 1 - matrix[b.length][a.length] / maxLen;
  }
}

// Singleton instance
export const speechRecognitionService = new SpeechRecognitionService();
