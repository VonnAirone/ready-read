import { Audio } from 'expo-av';
import { Alert } from 'react-native';

interface RecordingResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export class AudioRecordingService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  async initialize(): Promise<boolean> {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permissions to use this feature.');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    if (this.isRecording) {
      return false;
    }

    try {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }

      const { recording } = await Audio.Recording.createAsync({
        android: {
          // DEFAULT format produces 3GPP/AMR which Azure Speech cannot decode.
          // MPEG_4 + AAC produces real MP4/AAC audio that Azure accepts.
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      this.recording = recording;
      this.isRecording = true;

      return true;
    } catch (error) {
      this.cleanup();
      return false;
    }
  }

  async stopRecording(): Promise<RecordingResult> {
    if (!this.isRecording || !this.recording) {
      return { success: false, error: 'No active recording' };
    }

    try {
      // Get recording status before stopping
      const status = await this.recording.getStatusAsync();
      const durationMs = status.durationMillis || 0;
      
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      this.isRecording = false;
      this.recording = null;

      // Reset audio mode so TTS / playback works normally after recording
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});

      if (!uri) {
        return { success: false, error: 'Recording URI not available' };
      }

      // Validate minimum duration (500ms)
      if (durationMs < 500) {
        return { 
          success: false, 
          error: 'Recording too short. Please record for at least 1 second.' 
        };
      }

      return { success: true, uri };
    } catch (error) {
      this.cleanup();
      return { success: false, error: 'Failed to stop recording' };
    }
  }

  async cancelRecording(): Promise<void> {
    if (this.isRecording && this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (error) {
        // stopAndUnloadAsync can fail if the recording was already stopped —
        // log but do not rethrow; cleanup must still run to release the ref.
        console.warn('cancelRecording: stopAndUnloadAsync failed:', error);
      }
    }
    this.cleanup();
  }

  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      hasActiveRecording: this.recording !== null,
    };
  }

  private cleanup() {
    this.isRecording = false;
    this.recording = null;
  }
}

// Singleton instance
export const audioRecordingService = new AudioRecordingService();