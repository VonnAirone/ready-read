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
  private async makeRequestWithRetry(requestPayload: any, maxRetries: number = 3): Promise<Response> {
    let lastError: Error | null = null;
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      // Create timeout controller for this attempt
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        if (attempt === 1) {
          console.log(`📡 Making API request with ${requestPayload.config.encoding} encoding`);
        } else {
          console.log(`🔄 Retry attempt ${attempt}/${maxRetries + 1}`);
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
            console.log(`✅ Request succeeded on attempt ${attempt} (${duration}s total)`);
          } else {
            console.log(`✅ Request succeeded (${duration}s)`);
          }
          return response;
        }

        // Client error (4xx) - don't retry, these won't succeed
        if (response.status >= 400 && response.status < 500) {
          clearTimeout(timeoutId);
          const errorData = await response.json().catch(() => ({}));
          console.error(`❌ Client error ${response.status}:`, errorData);
          return response; // Return to handle error upstream
        }

        // Server error (5xx) - worth retrying
        clearTimeout(timeoutId);
        const errorText = await response.text();
        lastError = new Error(`Server error HTTP ${response.status}: ${errorText}`);
        console.warn(`⚠️ Attempt ${attempt}/${maxRetries + 1} failed:`, lastError.message);

        if (attempt <= maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s, 4s, 8s
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (networkError: any) {
        clearTimeout(timeoutId); // Clear timeout on error
        
        const isTimeout = networkError.name === 'AbortError' || networkError.name === 'TimeoutError' || networkError.message?.includes('timeout');
        const errorType = isTimeout ? 'Timeout' : 'Network';
        
        lastError = networkError;
        console.warn(`⚠️ Attempt ${attempt}/${maxRetries + 1} failed with ${errorType} error:`, networkError.message);

        if (attempt <= maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`❌ All ${maxRetries + 1} attempts failed after ${totalTime}s`);
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
      // Default configuration - Use WEBM_OPUS for better format handling
      // WEBM_OPUS is more flexible and can process M4A/AAC recordings
      const defaultConfig: GoogleSpeechConfig = {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 16000, // Will be ignored for WEBM_OPUS, but kept for compatibility
        languageCode: 'en-US',
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
      console.log('📊 Audio stats:', {
        base64Length: audioBase64.length,
        estimatedDuration: `${estimatedDuration.toFixed(2)}s`,
        encoding: finalConfig.encoding
      });

      if (estimatedDuration < 0.5) {
        console.warn('⚠️ Audio may be too short for reliable transcription (<0.5s)');
      }

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
          
          // Remove data URL prefix (data:audio/xxx;base64,)
          let base64Data = base64.split(',')[1] || base64;
          console.log('✅ Base64 conversion successful, length:', base64Data?.length || 0);
          
          if (!base64Data || base64Data.length === 0) {
            reject(new Error('Base64 conversion resulted in empty data'));
            return;
          }
          
          // Send complete audio file - WEBM_OPUS encoding handles various formats
          console.log('📦 Sending complete audio file with WEBM_OPUS encoding');
          
          // Validate base64 data
          try {
            const audioBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            console.log('📊 Audio file stats:', {
              totalBytes: audioBytes.length,
              base64Length: base64Data.length,
              estimatedKB: (audioBytes.length / 1024).toFixed(2)
            });
            
            if (audioBytes.length < 100) {
              console.warn('⚠️ Audio file suspiciously small (<100 bytes)');
            }
          } catch (analysisError) {
            console.warn('⚠️ Could not validate audio file:', analysisError);
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
      encoding: 'WEBM_OPUS', // Flexible encoding that handles M4A/AAC
      model: 'latest_short', // Best for short pronunciations
      enableAutomaticPunctuation: false, // More accurate for individual words
      // Note: sampleRateHertz not needed for WEBM_OPUS - Google auto-detects
    };
  }

  /**
   * Get optimal configuration for passage reading
   */
  static getPassageConfig(): Partial<GoogleSpeechConfig> {
    return {
      encoding: 'WEBM_OPUS', // Flexible encoding that handles M4A/AAC
      model: 'latest_long', // Better for longer speech
      enableAutomaticPunctuation: true, // helpful for passages
      // Note: sampleRateHertz not needed for WEBM_OPUS - Google auto-detects
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