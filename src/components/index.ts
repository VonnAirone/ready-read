// Assessment Components
export { default as AssessmentIntro } from './assessment/AssessmentIntro';
export { default as AssessmentProgress } from './assessment/AssessmentProgress';
export { default as AssessmentResults } from './assessment/AssessmentResults';
export { default as RecordingInterface } from './assessment/RecordingInterface';

// Hooks
export { usePronunciationGame } from '../hooks/usePronunciationGame';
export type { AssessmentPhase, AssessmentResult } from '../hooks/usePronunciationGame';

// Services
export { audioRecordingService } from '../services/audioRecording';
export { speechRecognitionService } from '../services/speechRecognition';
export type { TranscriptionResult } from '../services/speechRecognition';