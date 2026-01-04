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
      console.error('Failed to initialize audio recording:', error);
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    if (this.isRecording) {
      console.warn('Recording already in progress');
      return false;
    }

    try {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      await this.recording.startAsync();
      this.isRecording = true;

      console.log('Recording started successfully');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.cleanup();
      return false;
    }
  }

  async stopRecording(): Promise<RecordingResult> {
    if (!this.isRecording || !this.recording) {
      return { success: false, error: 'No active recording' };
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      this.isRecording = false;
      this.recording = null;

      if (!uri) {
        return { success: false, error: 'Recording URI not available' };
      }

      console.log('Recording stopped successfully, URI:', uri);
      return { success: true, uri };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.cleanup();
      return { success: false, error: 'Failed to stop recording' };
    }
  }

  async cancelRecording(): Promise<void> {
    if (this.isRecording && this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (error) {
        console.error('Failed to cancel recording:', error);
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