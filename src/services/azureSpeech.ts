/**
 * Azure Cognitive Services - Pronunciation Assessment
 * Provides word-level and phoneme-level pronunciation scoring,
 * replacing the previous Google STT + Levenshtein approach.
 */

export interface AzurePhonemeResult {
  phoneme: string;
  accuracyScore: number;
}

export interface AzureWordResult {
  word: string;
  accuracyScore: number;
  errorType: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation';
  phonemes: AzurePhonemeResult[];
}

export interface AzurePronunciationResult {
  recognizedText: string;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronScore: number;
  words: AzureWordResult[];
}

const EMPTY_RESULT: AzurePronunciationResult = {
  recognizedText: '',
  accuracyScore: 0,
  fluencyScore: 0,
  completenessScore: 0,
  pronScore: 0,
  words: [],
};

// Azure short-audio REST endpoint — requires format=detailed to get NBest + pronunciation scores
// en-PH (Philippine English) is used so Azure's acoustic model matches Filipino speakers,
// avoiding false mispronunciation errors caused by natural Filipino-English accent patterns.
const STT_ENDPOINT = (region: string) =>
  `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-PH&format=detailed`;

export class AzureSpeechService {
  private key: string;
  private region: string;

  constructor(key: string, region: string) {
    this.key = key;
    this.region = region;
  }

  /**
   * Assess pronunciation against a reference text.
   * Returns per-word accuracy scores and an overall pronunciation score.
   */
  async assessPronunciation(audioUri: string, referenceText: string): Promise<AzurePronunciationResult> {
    // Azure requires the pronunciation assessment config as base64-encoded JSON
    const configJson = JSON.stringify({
      ReferenceText: referenceText,
      GradingSystem: 'HundredMark',
      Granularity: 'Phoneme',
      Dimension: 'Comprehensive',
      EnableMiscue: 'True', // Must be string, not boolean
    });
    // btoa is polyfilled in React Native / Hermes via Expo SDK 51+
    const assessmentConfig = btoa(unescape(encodeURIComponent(configJson)));

    const audioBlob = await this.readAudioBlob(audioUri);
    const contentType = this.getAudioContentType(audioUri);


    const response = await this.makeRequestWithRetry(
      STT_ENDPOINT(this.region),
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.key,
          'Content-Type': contentType,
          'Accept': 'application/json',
          'Pronunciation-Assessment': assessmentConfig,
        },
        body: audioBlob,
      }
    );

    const data = await response.json();

    if (
      data.RecognitionStatus === 'NoMatch' ||
      data.RecognitionStatus === 'InitialSilenceTimeout' ||
      data.RecognitionStatus === 'BabbleTimeout'
    ) {
      return EMPTY_RESULT;
    }

    if (data.RecognitionStatus !== 'Success') {
      throw new Error(`Azure recognition failed: ${data.RecognitionStatus}`);
    }

    // format=detailed puts all results inside NBest[0]
    const best = data.NBest?.[0];
    if (!best) {
      return EMPTY_RESULT;
    }


    // Scores are directly on NBest[0] — NOT nested under PronunciationAssessment
    return {
      recognizedText: best.Display || best.ITN || '',
      accuracyScore: best.AccuracyScore ?? 0,
      fluencyScore: best.FluencyScore ?? 0,
      completenessScore: best.CompletenessScore ?? 0,
      pronScore: best.PronScore ?? 0,
      words: (best.Words ?? []).map((w: any) => ({
        word: w.Word,
        accuracyScore: w.AccuracyScore ?? 0,
        errorType: w.ErrorType ?? 'None',
        phonemes: (w.Phonemes ?? []).map((p: any) => ({
          phoneme: p.Phoneme,
          accuracyScore: p.PronunciationAssessment?.AccuracyScore ?? 0,
        })),
      })),
    };
  }

  /**
   * Plain transcription without pronunciation scoring.
   * Used when no reference text is available.
   */
  async transcribeOnly(audioUri: string): Promise<{ text: string; confidence: number }> {
    const audioBlob = await this.readAudioBlob(audioUri);

    const response = await this.makeRequestWithRetry(
      STT_ENDPOINT(this.region),
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.key,
          'Content-Type': this.getAudioContentType(audioUri),
          'Accept': 'application/json',
        },
        body: audioBlob,
      }
    );

    const data = await response.json();

    if (data.RecognitionStatus !== 'Success') {
      return { text: '', confidence: 0 };
    }

    const best = data.NBest?.[0];
    return {
      text: best?.Display || best?.ITN || '',
      confidence: best?.Confidence ?? 0,
    };
  }

  private getAudioContentType(audioUri: string): string {
    const lower = audioUri.toLowerCase().split('?')[0];
    if (lower.endsWith('.m4a') || lower.endsWith('.mp4') || lower.endsWith('.aac')) {
      return 'audio/mp4; codecs="mp4a.40.2"';
    }
    if (lower.endsWith('.ogg') || lower.endsWith('.opus')) {
      return 'audio/ogg; codecs=opus';
    }
    if (lower.endsWith('.webm')) {
      return 'audio/webm; codecs=opus';
    }
    // Default: WAV PCM
    return 'audio/wav; codecs=audio/pcm; samplerate=16000';
  }

  private async readAudioBlob(audioUri: string): Promise<Blob> {
    const fileResponse = await fetch(audioUri);
    if (!fileResponse.ok) {
      throw new Error(`Failed to read audio file: ${fileResponse.status}`);
    }
    return fileResponse.blob();
  }

  private async makeRequestWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) return response;

        // 4xx errors won't succeed on retry — parse and throw immediately
        if (response.status >= 400 && response.status < 500) {
          const err = await response.json().catch(() => ({}));
          throw new Error(`Azure API error ${response.status}: ${err.error?.message || response.statusText}`);
        }

        lastError = new Error(`Azure server error ${response.status}`);
      } catch (error: any) {
        clearTimeout(timeoutId);
        lastError = error;
        if (error.message?.includes('Azure API error')) throw error;
      }

      if (attempt <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }

    throw lastError || new Error('All Azure retry attempts failed');
  }
}

let azureService: AzureSpeechService | null = null;
let initializationError: Error | null = null;

export const initializeAzureSpeech = (key: string, region: string): AzureSpeechService | null => {
  try {
    // Validate credentials
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      throw new Error('Azure Speech key is empty or invalid');
    }
    if (!region || typeof region !== 'string' || region.trim().length === 0) {
      throw new Error('Azure Speech region is empty or invalid');
    }

    azureService = new AzureSpeechService(key, region);
    initializationError = null;
    console.log('Azure Speech service initialized successfully');
    return azureService;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    initializationError = err;
    console.error('Failed to initialize Azure Speech service:', err.message);
    azureService = null;
    return null;
  }
};

export const getAzureSpeechService = (): AzureSpeechService => {
  if (!azureService) {
    const errorMessage = initializationError 
      ? `Azure Speech service not available: ${initializationError.message}`
      : 'Azure Speech service not initialized. Call initializeAzureSpeech first.';
    throw new Error(errorMessage);
  }
  return azureService;
};

export const isAzureSpeechServiceAvailable = (): boolean => {
  return azureService !== null;
};
