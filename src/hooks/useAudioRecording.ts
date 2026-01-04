import { useState, useCallback } from 'react';
import { AudioRecordingService } from '../services/audioRecording';

export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [audioService] = useState(() => new AudioRecordingService());

  const startRecording = useCallback(async () => {
    try {
      setIsProcessing(true);
      
      // Initialize audio service
      const initialized = await audioService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize audio recording');
      }

      // Start recording
      const success = await audioService.startRecording();
      if (success) {
        setIsRecording(true);
        setRecordingUri(null); // Clear previous recording
      } else {
        throw new Error('Failed to start recording');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [audioService]);

  const stopRecording = useCallback(async () => {
    try {
      setIsProcessing(true);
      
      const result = await audioService.stopRecording();
      if (result.success && result.uri) {
        setIsRecording(false);
        setRecordingUri(result.uri);
      } else {
        throw new Error(result.error || 'Failed to stop recording');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [audioService]);

  const clearRecording = useCallback(() => {
    setRecordingUri(null);
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    isProcessing,
    recordingUri,
    startRecording,
    stopRecording,
    clearRecording,
  };
}