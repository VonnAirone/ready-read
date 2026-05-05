const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/audio/transcriptions';

interface GroqWord {
  word: string;
  start: number;
  end: number;
  probability: number;
}

interface GroqTranscriptionResult {
  transcript: string;
  confidence: number;
  words: GroqWord[];
}

export class GroqSpeechService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(
    audioUri: string,
    options: { expectedText?: string } = {},
  ): Promise<GroqTranscriptionResult> {
    const formData = new FormData();

    if (audioUri.startsWith('blob:')) {
      // Web recording — URI is a blob URL; fetch it as a real Blob for FormData
      const res = await fetch(audioUri);
      const blob = await res.blob();
      const mimeType = blob.type || 'audio/webm';
      const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
      formData.append('file', blob, `recording.${ext}`);
    } else {
      formData.append('file', {
        uri: audioUri,
        type: this.getMimeType(audioUri),
        name: `recording.${this.getExtension(audioUri)}`,
      } as unknown as Blob);
    }
    formData.append('model', 'whisper-large-v3-turbo');
    // No language field — let Whisper auto-detect.
    // Locking to 'en' breaks transcription of Filipino/Tagalog content.
    formData.append('response_format', 'verbose_json');
    // Word-level timestamps give us per-word probabilities for real confidence scores.
    formData.append('timestamp_granularities[]', 'word');

    // Providing the expected text as a prompt dramatically improves accuracy for
    // specific vocabulary (proper nouns, uncommon words, Filipino phonetics).
    if (options.expectedText) {
      formData.append('prompt', options.expectedText.slice(0, 224));
    }

    const response = await this.makeRequestWithRetry(formData);
    const data = await response.json();

    const words: GroqWord[] = (data.words ?? []).map((w: any) => ({
      word: w.word?.trim() ?? '',
      start: w.start ?? 0,
      end: w.end ?? 0,
      probability: w.probability ?? 1.0,
    }));

    const confidence =
      words.length > 0
        ? words.reduce((sum, w) => sum + w.probability, 0) / words.length
        : 0;

    return {
      transcript: data.text?.trim() ?? '',
      confidence,
      words,
    };
  }

  private getMimeType(uri: string): string {
    const lower = uri.toLowerCase().split('?')[0];
    if (lower.endsWith('.m4a') || lower.endsWith('.mp4') || lower.endsWith('.aac')) return 'audio/m4a';
    if (lower.endsWith('.wav')) return 'audio/wav';
    if (lower.endsWith('.mp3')) return 'audio/mpeg';
    if (lower.endsWith('.webm')) return 'audio/webm';
    if (lower.endsWith('.ogg') || lower.endsWith('.opus')) return 'audio/ogg';
    return 'audio/m4a';
  }

  private getExtension(uri: string): string {
    const lower = uri.toLowerCase().split('?')[0];
    const parts = lower.split('.');
    return parts[parts.length - 1] || 'm4a';
  }

  private async makeRequestWithRetry(formData: FormData, maxRetries = 3): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.apiKey}` },
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) return response;

        if (response.status >= 400 && response.status < 500) {
          const err = await response.json().catch(() => ({}));
          throw new Error(`Groq API error ${response.status}: ${(err as any).error?.message || response.statusText}`);
        }

        lastError = new Error(`Groq server error ${response.status}`);
      } catch (error: unknown) {
        clearTimeout(timeoutId);
        lastError = error instanceof Error ? error : new Error(String(error));
        if (lastError.message.includes('Groq API error')) throw lastError;
      }

      if (attempt <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }

    throw lastError ?? new Error('All Groq retry attempts failed');
  }
}

let groqService: GroqSpeechService | null = null;

export const initializeGroqSpeech = (apiKey: string): GroqSpeechService | null => {
  if (!apiKey || apiKey.trim().length === 0) {
    console.error('Groq API key is empty or invalid');
    return null;
  }
  groqService = new GroqSpeechService(apiKey);
  console.log('Groq Speech service initialized');
  return groqService;
};

export const getGroqSpeechService = (): GroqSpeechService => {
  if (!groqService) {
    throw new Error('Groq Speech service not initialized. Call initializeGroqSpeech first.');
  }
  return groqService;
};
