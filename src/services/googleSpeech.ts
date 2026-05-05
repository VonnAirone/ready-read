/**
 * Google Cloud Speech-to-Text Service
 * Handles audio transcription using Google Cloud Speech REST API
 * Optimized for React Native applications
 */

import * as FileSystem from 'expo-file-system';

interface GoogleSpeechConfig {
  encoding: 'ENCODING_UNSPECIFIED' | 'LINEAR16' | 'FLAC' | 'MP3' | 'WEBM_OPUS' | 'WAV';
  sampleRateHertz?: number;
  languageCode: string;
  enableAutomaticPunctuation: boolean;
  model: 'latest_long' | 'latest_short' | 'command_and_search';
}

interface TranscriptionResult {
  transcript: string;
  confidence: number;
}

export class GoogleSpeechService {
  private projectId: string;
  private apiKey: string;

  constructor(projectId: string, apiKey: string) {
    this.projectId = projectId;
    this.apiKey = apiKey;
  }

  /**
   * Debug method to test API connectivity and audio data
   */
  async debugTranscription(audioUri: string): Promise<void> {
    try {
      // Check file info using expo-file-system (reliable for local URIs in React Native)
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists || fileInfo.size === 0) {
        return;
      }

      const base64 = await this.convertAudioToBase64(audioUri);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
    }
  }

  private estimateAudioDuration(base64Data: string): number {
    // Rough estimation: base64 length / 1.33 (base64 expansion) / (sample rate * bytes per sample)
    const bytesApprox = base64Data.length / 1.33;
    return bytesApprox / (16000 * 2); // 16kHz, 16-bit (2 bytes per sample)
  }

  /**
   * Make API request with automatic retry for the 20% error rate
   */
  private async makeRequestWithRetry(requestPayload: unknown, maxRetries: number = 3): Promise<Response> {
    let lastError: Error | null = null;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      // Create timeout controller for this attempt
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        if (attempt === 1) {
        } else {
        }

        const response = await fetch(
          `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload),
            signal: controller.signal
          }
        );

        // Clear timeout on success
        clearTimeout(timeoutId);

        // Success
        if (response.ok) {
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          if (attempt > 1) {
          } else {
          }
          return response;
        }

        // Client error (4xx) - don't retry, these won't succeed
        if (response.status >= 400 && response.status < 500) {
          clearTimeout(timeoutId);
          const errorData = await response.json().catch(() => ({}));
          return response; // Return to handle error upstream
        }

        // Server error (5xx) - worth retrying
        clearTimeout(timeoutId);
        const errorText = await response.text();
        lastError = new Error(`Server error HTTP ${response.status}: ${errorText}`);

        if (attempt <= maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (networkError: unknown) {
        clearTimeout(timeoutId); // Clear timeout on error

        const isNetworkErr = networkError instanceof Error;
        const isTimeout = isNetworkErr && (
          networkError.name === 'AbortError' ||
          networkError.name === 'TimeoutError' ||
          networkError.message?.includes('timeout')
        );
        const errorType = isTimeout ? 'Timeout' : 'Network';

        lastError = isNetworkErr ? networkError : new Error(String(networkError));

        if (attempt <= maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Transcribe audio file using Google Cloud Speech-to-Text API
   */
  async transcribeAudio(
    audioUri: string,
    config: Partial<GoogleSpeechConfig> = {}
  ): Promise<TranscriptionResult> {
    try {
      // Default configuration - use ENCODING_UNSPECIFIED so Google auto-detects
      // the audio format from the file headers (works with M4A/AAC recordings)
      const defaultConfig: GoogleSpeechConfig = {
        encoding: 'ENCODING_UNSPECIFIED',
        languageCode: 'en-PH',
        enableAutomaticPunctuation: true,
        model: 'latest_short'
      };

      const finalConfig = { ...defaultConfig, ...config };

      // Convert audio file to base64
      const audioBase64 = await this.convertAudioToBase64(audioUri);

      // Validate audio data
      if (!audioBase64 || audioBase64.length === 0) {
        throw new Error('Audio conversion resulted in empty data');
      }

      // Estimate audio duration and validate minimum length
      const estimatedDuration = this.estimateAudioDuration(audioBase64);

      if (estimatedDuration < 0.5) {
      }

      // Prepare request payload
      const requestPayload = {
        config: finalConfig,
        audio: {
          content: audioBase64
        }
      };

      // Make API request to Google Cloud Speech with retry logic
      const response = await this.makeRequestWithRetry(requestPayload);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `Google Speech API error: ${response.status} ${response.statusText}`);
      }

      // Extract transcription result
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        if (result.alternatives && result.alternatives.length > 0) {
          const alternative = result.alternatives[0];
          return {
            transcript: alternative.transcript.trim(),
            confidence: alternative.confidence || 0
          };
        } else {
          return { transcript: '', confidence: 0 };
        }
      } else {
        return { transcript: '', confidence: 0 };
      }

    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Transcription failed: ${errMsg}`);
    }
  }

  /**
   * Convert audio file to base64 string using expo-file-system
   */
  private async convertAudioToBase64(audioUri: string): Promise<string> {
    try {
      const base64Data = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64Data || base64Data.length === 0) {
        throw new Error('Audio conversion resulted in empty data');
      }

      return base64Data;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Audio conversion failed: ${errMsg}`);
    }
  }

  /**
   * Get optimal configuration for pronunciation assessment
   */
  static getPronunciationConfig(): Partial<GoogleSpeechConfig> {
    return {
      encoding: 'ENCODING_UNSPECIFIED',
      model: 'latest_short',
      enableAutomaticPunctuation: false,
    };
  }

  /**
   * Get optimal configuration for passage reading
   */
  static getPassageConfig(): Partial<GoogleSpeechConfig> {
    return {
      encoding: 'ENCODING_UNSPECIFIED',
      model: 'latest_long',
      enableAutomaticPunctuation: true,
    };
  }
}

// Export singleton instance
let speechService: GoogleSpeechService | null = null;

export const initializeGoogleSpeech = (projectId: string, apiKey: string) => {
  speechService = new GoogleSpeechService(projectId, apiKey);
  return speechService;
};

export const getGoogleSpeechService = (): GoogleSpeechService => {
  if (!speechService) {
    throw new Error('Google Speech service not initialized. Call initializeGoogleSpeech first.');
  }
  return speechService;
};
