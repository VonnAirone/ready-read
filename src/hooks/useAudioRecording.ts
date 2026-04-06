import { useState, useCallback } from 'react';
import { audioRecordingService } from '../services/audioRecording';

export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setIsProcessing(true);

      const success = await audioRecordingService.startRecording();
      if (success) {
        setIsRecording(true);
        setRecordingUri(null);
      } else {
        throw new Error('Failed to start recording');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      setIsProcessing(true);

      const result = await audioRecordingService.stopRecording();
      if (result.success && result.uri) {
        setIsRecording(false);
        setRecordingUri(result.uri);
      } else {
        throw new Error(result.error || 'Failed to stop recording');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

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