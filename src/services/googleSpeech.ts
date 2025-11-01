/**
 * Google Cloud Speech-to-Text Service
 * Handles audio transcription using Google Cloud Speech REST API
 * Optimized for React Native applications
 */

interface GoogleSpeechConfig {
  encoding: 'LINEAR16' | 'FLAC' | 'MP3' | 'WEBM_OPUS' | 'WAV';
  sampleRateHertz: number;
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
    console.log('🔍 DEBUG: Starting transcription analysis...');
    
    try {
      // Test 1: Check audio file
      const response = await fetch(audioUri);
      const blob = await response.blob();
      console.log('🔍 Audio file stats:', {
        size: blob.size,
        type: blob.type,
        uri: audioUri
      });
      
      if (blob.size === 0) {
        console.log('❌ Audio file is empty!');
        return;
      }
      
      // Test 2: Check base64 conversion
      const base64 = await this.convertAudioToBase64(audioUri);
      console.log('🔍 Base64 conversion stats:', {
        length: base64.length,
        estimatedAudioSeconds: this.estimateAudioDuration(base64),
        firstChars: base64.substring(0, 50) + '...'
      });
      
      // Test 3: Make minimal API request
      const testConfig = {
        encoding: 'MP3' as const,
        languageCode: 'en-US'
      };
      
      const requestPayload = {
        config: testConfig,
        audio: { content: base64 }
      };
      
      console.log('🔍 Making test API request...');
      const apiResponse = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        }
      );
      
      const data = await apiResponse.json();
      console.log('🔍 API Response Analysis:', {
        status: apiResponse.status,
        ok: apiResponse.ok,
        hasResults: !!data.results,
        resultsCount: data.results ? data.results.length : 0,
        responseKeys: Object.keys(data),
        fullResponse: data
      });
      
    } catch (error) {
      console.error('🔍 Debug analysis failed:', error);
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
  private async makeRequestWithRetry(requestPayload: any, maxRetries: number = 2): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`🔄 API Request attempt ${attempt}/${maxRetries + 1}`);
        
        const response = await fetch(
          `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload)
          }
        );

        // If successful or client error (don't retry 4xx), return response
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          if (attempt > 1) {
            console.log(`✅ Request succeeded on attempt ${attempt}`);
          }
          return response;
        }

        // Server error (5xx) - worth retrying
        const errorText = await response.text();
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        console.warn(`⚠️ Attempt ${attempt} failed with server error:`, lastError.message);

        if (attempt <= maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (networkError: any) {
        lastError = networkError;
        console.warn(`⚠️ Attempt ${attempt} failed with network error:`, networkError.message);

        if (attempt <= maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

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
      // Default configuration - Use MP3 to match actual recording format
      const defaultConfig: GoogleSpeechConfig = {
        encoding: 'MP3',
        sampleRateHertz: 16000, // Will be ignored for MP3, but kept for compatibility
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'latest_short'
      };

      const finalConfig = { ...defaultConfig, ...config };

      // Convert audio file to base64
      const audioBase64 = await this.convertAudioToBase64(audioUri);

      // Prepare request payload
      const requestPayload = {
        config: finalConfig,
        audio: {
          content: audioBase64
        }
      };

      // Log request details for debugging
      console.log('Making API request to Google Cloud Speech:', {
        url: `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey.substring(0, 10)}...`,
        config: finalConfig,
        audioContentLength: audioBase64.length
      });

      // Log the full request payload (excluding audio content for readability)
      console.log('Request payload structure:', {
        config: requestPayload.config,
        audioContentType: typeof requestPayload.audio.content,
        audioContentLength: requestPayload.audio.content.length
      });

      // Make API request to Google Cloud Speech with retry logic
      const response = await this.makeRequestWithRetry(requestPayload);

      const data = await response.json();

      if (!response.ok) {
        console.error('Google Speech API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          data: data
        });
        throw new Error(data.error?.message || `Google Speech API error: ${response.status} ${response.statusText}`);
      }

      console.log('Google Speech API Response:', JSON.stringify(data, null, 2));

      // Detailed response analysis
      console.log('Response analysis:', {
        hasResults: !!data.results,
        resultsLength: data.results ? data.results.length : 0,
        fullResponse: data
      });

      // Extract transcription result
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        console.log('First result:', JSON.stringify(result, null, 2));
        
        if (result.alternatives && result.alternatives.length > 0) {
          const alternative = result.alternatives[0];
          console.log('Transcription successful:', {
            transcript: alternative.transcript,
            confidence: alternative.confidence
          });
          
          return {
            transcript: alternative.transcript.trim(),
            confidence: alternative.confidence || 0
          };
        } else {
          console.warn('No alternatives found in first result');
          return {
            transcript: '',
            confidence: 0
          };
        }
      } else {
        console.warn('No transcription results returned from Google Speech API');
        console.log('Response keys:', Object.keys(data));
        return {
          transcript: '',
          confidence: 0
        };
      }

    } catch (error) {
      console.error('Google Speech transcription error:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Convert audio file to base64 string
   */
  private async convertAudioToBase64(audioUri: string): Promise<string> {
    try {
      console.log('Converting audio to base64, URI:', audioUri);
      
      // For React Native, we'll read the file and convert to base64
      const response = await fetch(audioUri);
      console.log('Fetch response status:', response.status, response.ok);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('Blob created, size:', blob.size, 'type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('Audio file is empty');
      }
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          if (!base64) {
            reject(new Error('Failed to convert audio to base64'));
            return;
          }
          
          // Remove data URL prefix (data:audio/wav;base64,)
          let base64Data = base64.split(',')[1];
          console.log('Base64 conversion successful, length:', base64Data?.length || 0);
          
          if (!base64Data || base64Data.length === 0) {
            reject(new Error('Base64 conversion resulted in empty data'));
            return;
          }
          
          // Send complete WAV file with LINEAR16 encoding (official Google docs approach)
          console.log('Sending complete WAV file with LINEAR16 encoding (includes headers)');
          
          // Log basic audio info for debugging
          try {
            const audioBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            const riffCheck = String.fromCharCode(...audioBytes.slice(0, 4));
            console.log('Complete WAV file analysis:', {
              totalBytes: audioBytes.length,
              isWAV: riffCheck === 'RIFF',
              fileType: riffCheck === 'RIFF' ? String.fromCharCode(...audioBytes.slice(8, 12)) : 'Unknown',
              base64Length: base64Data.length,
              startsWithRIFF: base64Data.startsWith('UklGR') // "RIFF" in base64
            });
          } catch (analysisError) {
            console.warn('Could not analyze audio file:', analysisError);
          }
          
          resolve(base64Data);
        };
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          reject(new Error('FileReader failed to process audio'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Audio conversion error:', error);
      throw new Error(`Audio conversion failed: ${error.message}`);
    }
  }

  /**
   * Get optimal configuration for pronunciation assessment
   */
  static getPronunciationConfig(): Partial<GoogleSpeechConfig> {
    return {
      encoding: 'MP3', // Match actual recording format (M4A/MPEG)
      model: 'latest_short', // Best for short pronunciations
      enableAutomaticPunctuation: false, // More accurate for individual words
      // Note: sampleRateHertz not needed for MP3 - Google auto-detects
    };
  }

  /**
   * Get optimal configuration for passage reading
   */
  static getPassageConfig(): Partial<GoogleSpeechConfig> {
    return {
      encoding: 'MP3', // Match actual recording format (M4A/MPEG)
      model: 'latest_long', // Better for longer speech
      enableAutomaticPunctuation: true, // helpful for passages
      // Note: sampleRateHertz not needed for MP3 - Google auto-detects
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