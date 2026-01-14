import { getGoogleSpeechService } from './googleSpeech';

export interface TranscriptionResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
}

export class SpeechRecognitionService {
  async transcribeAudio(audioUri: string, expectedText?: string): Promise<TranscriptionResult> {
    try {
      console.log('🎤 Starting transcription for URI:', audioUri);

      const speechService = getGoogleSpeechService();

      // Make the transcription request (retry logic handles failures)
      const result = await speechService.transcribeAudio(audioUri);

      if (result.transcript && result.transcript.trim()) {
        console.log('Transcription successful:', result.transcript);
        
        return {
          text: result.transcript,
          confidence: result.confidence || 0,
          success: true,
        };
      } else {
        console.warn('Transcription returned empty result');
        return {
          text: '',
          confidence: 0,
          success: false,
          error: 'No transcription text received',
        };
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  calculateAccuracy(original: string, transcribed: string): number {
    if (!original || !transcribed) return 0;

    // Normalize strings for comparison
    const normalizeText = (text: string) => 
      text.toLowerCase()
          .replace(/[^\w\s]/g, '') // Remove punctuation
          .replace(/\s+/g, ' ')    // Normalize whitespace
          .trim();

    const originalWords = normalizeText(original).split(' ');
    const transcribedWords = normalizeText(transcribed).split(' ');

    if (originalWords.length === 0) return 0;

    // Simple word-based accuracy calculation
    let correctWords = 0;
    const maxLength = Math.max(originalWords.length, transcribedWords.length);

    for (let i = 0; i < Math.min(originalWords.length, transcribedWords.length); i++) {
      if (originalWords[i] === transcribedWords[i]) {
        correctWords++;
      }
    }

    // Account for length differences
    const accuracy = (correctWords / originalWords.length) * 100;
    return Math.max(0, Math.min(100, accuracy));
  }

  getKeyWordAccuracy(original: string, transcribed: string, keyWords: string[]): number {
    if (!keyWords || keyWords.length === 0) {
      return this.calculateAccuracy(original, transcribed);
    }

    const normalizeText = (text: string) => 
      text.toLowerCase().replace(/[^\w\s]/g, '').trim();

    const transcribedNormalized = normalizeText(transcribed);
    let correctKeyWords = 0;

    for (const keyWord of keyWords) {
      const normalizedKeyWord = normalizeText(keyWord);
      if (transcribedNormalized.includes(normalizedKeyWord)) {
        correctKeyWords++;
      }
    }

    return (correctKeyWords / keyWords.length) * 100;
  }
}

// Singleton instance
export const speechRecognitionService = new SpeechRecognitionService();