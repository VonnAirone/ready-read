import { getGroqSpeechService } from './groqSpeech';
import { WordMatchResult } from '../types';

export interface TranscriptionResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
}

export class SpeechRecognitionService {
  async transcribeAudio(audioUri: string, expectedText?: string): Promise<TranscriptionResult> {
    try {
      const service = getGroqSpeechService();
      const result = await service.transcribeAudio(audioUri, { expectedText });

      if (!result.transcript) {
        return { text: '', confidence: 0, success: false, error: 'No transcription text received' };
      }

      return { text: result.transcript, confidence: result.confidence, success: true };
    } catch (error) {
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  calculateAccuracy(original: string, transcribed: string): number {
    const results = this.getWordLevelResults(original, transcribed);
    if (results.length === 0) return 0;
    const correct = results.filter(r => r.isCorrect).length;
    return (correct / results.length) * 100;
  }

  getKeyWordAccuracy(original: string, transcribed: string, keywords: string[]): number {
    if (keywords.length === 0) return this.calculateAccuracy(original, transcribed);
    const normalize = (w: string) => w.toLowerCase().replace(/[^\w]/g, '');
    const transcribedWords = transcribed.toLowerCase().split(/\s+/).map(normalize);
    const matched = keywords.filter(kw => {
      const normalized = normalize(kw);
      return transcribedWords.some(w => this.wordSimilarity(w, normalized) >= 0.80);
    });
    return (matched.length / keywords.length) * 100;
  }

  /**
   * Aligns expected vs transcribed words using global sequence alignment (Needleman-Wunsch).
   *
   * Positional matching breaks as soon as the student inserts or skips a word —
   * every subsequent word in the sentence shifts and gets mismatched. Alignment
   * finds the globally cheapest mapping so each expected word is compared to the
   * closest spoken equivalent, even across insertions/deletions.
   *
   * Cost model (integer, no float precision issues in traceback):
   *   match     (sim ≥ 0.80) = 0   → free
   *   near-miss (sim ≥ 0.50) = 1   → cheap, aligns but marks incorrect
   *   bad sub   (sim < 0.50) = 3   → costly, alignment prefers two gaps (2) instead
   *   gap                    = 1   → word missing or extra
   *
   * Result: very different words are shown as "missing" rather than confusingly
   * attributed to the wrong expected word.
   */
  getWordLevelResults(original: string, transcribed: string): WordMatchResult[] {
    const normalize = (text: string) =>
      text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

    const expected = normalize(original).split(' ').filter(w => w.length > 0);
    const spoken   = normalize(transcribed).split(' ').filter(w => w.length > 0);

    if (expected.length === 0) return [];
    if (spoken.length === 0) {
      return expected.map(w => ({ expected: w, spoken: null, isCorrect: false, similarity: 0 }));
    }

    const aligned = this.alignWordSequences(expected, spoken);

    return aligned.map(([exp, spk]) => {
      if (!spk) return { expected: exp, spoken: null, isCorrect: false, similarity: 0 };
      const sim = this.wordSimilarity(exp, spk);
      return { expected: exp, spoken: spk, isCorrect: sim >= 0.80, similarity: sim };
    });
  }

  private alignWordSequences(
    expected: string[],
    transcribed: string[],
  ): Array<[string, string | null]> {
    const n = expected.length;
    const m = transcribed.length;
    const GAP = 1;

    const subCost = (i: number, j: number): number => {
      const sim = this.wordSimilarity(expected[i], transcribed[j]);
      if (sim >= 0.80) return 0;
      if (sim >= 0.50) return 1;
      return 3;
    };

    // Build DP table
    const dp: number[][] = Array.from({ length: n + 1 }, (_, i) =>
      new Array(m + 1).fill(0),
    );
    for (let i = 0; i <= n; i++) dp[i][0] = i * GAP;
    for (let j = 0; j <= m; j++) dp[0][j] = j * GAP;

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + subCost(i - 1, j - 1),
          dp[i - 1][j] + GAP,
          dp[i][j - 1] + GAP,
        );
      }
    }

    // Traceback — prefer diagonal (match/sub) over gap when costs tie
    const result: Array<[string, string | null]> = [];
    let i = n;
    let j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + subCost(i - 1, j - 1)) {
        result.unshift([expected[i - 1], transcribed[j - 1]]);
        i--;
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j] === dp[i - 1][j] + GAP)) {
        result.unshift([expected[i - 1], null]); // expected word not found
        i--;
      } else {
        j--; // extra spoken word — not an expected word, discard
      }
    }

    return result;
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

export const speechRecognitionService = new SpeechRecognitionService();
