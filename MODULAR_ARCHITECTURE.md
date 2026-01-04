# Pronunciation Game - Modular Architecture

This document describes the refactored modular architecture for the Pronunciation Game component, which was previously contained in a single large file.

## Overview

The large `PronunciationGame.tsx` file has been broken down into smaller, more manageable and reusable components. This improves maintainability, testability, and code organization.

## New File Structure

```
src/
├── components/
│   ├── assessment/
│   │   ├── AssessmentIntro.tsx        # Assessment introduction screen
│   │   ├── AssessmentProgress.tsx     # Progress tracking between sentences
│   │   ├── AssessmentResults.tsx      # Results display with level determination
│   │   └── RecordingInterface.tsx     # Audio recording UI
│   └── index.ts                       # Component exports
├── hooks/
│   └── usePronunciationGame.ts        # Core game logic hook
├── services/
│   ├── audioRecording.ts              # Audio recording service
│   ├── speechRecognition.ts           # Speech transcription service
│   └── googleSpeech.ts                # (existing) Google Cloud Speech API
├── screens/student/
│   ├── PronunciationGame.tsx          # (original) Large monolithic component
│   └── PronunciationGameModular.tsx   # New modular implementation
└── constants/
    └── theme.ts                       # (existing) Shared theme constants
```

## Component Architecture

### Core Components

#### 1. AssessmentIntro
- **Purpose**: Welcome screen explaining the assessment process
- **Features**: 3-sentence overview, estimated time, level determination info
- **Props**: `onStartAssessment()` callback

#### 2. AssessmentProgress
- **Purpose**: Shows current progress and sentence to read
- **Features**: Progress bar, sentence display, key words highlighting
- **Props**: Current item, progress info, proceed callback

#### 3. RecordingInterface
- **Purpose**: Handles audio recording UI during assessment
- **Features**: Animated record button, sentence display, status indicators
- **Props**: Recording state, audio controls, current sentence

#### 4. AssessmentResults
- **Purpose**: Displays final results and level determination
- **Features**: Trophy display, score breakdown, individual sentence results
- **Props**: Level, scores, results array, start practice callback

### Core Hook

#### usePronunciationGame
- **Purpose**: Centralizes all game state and logic
- **Features**:
  - Assessment phase management
  - Audio recording coordination
  - Speech recognition handling
  - Score calculation and level determination
  - Progress tracking
- **Returns**: State and action methods for UI components

### Service Layer

#### audioRecordingService
- **Purpose**: Handles audio recording using Expo Audio
- **Features**:
  - Permission handling
  - Recording state management
  - M4A format output
  - Error handling and cleanup

#### speechRecognitionService
- **Purpose**: Wraps Google Speech API with assessment-specific logic
- **Features**:
  - Audio transcription
  - Accuracy calculation
  - Key word detection
  - Error handling

## Migration Guide

### From Original to Modular

If you want to use the new modular components:

1. **Replace the import**:
   ```typescript
   // Old
   import PronunciationGame from './screens/student/PronunciationGame';
   
   // New
   import PronunciationGameModular from './screens/student/PronunciationGameModular';
   ```

2. **Same interface**: The modular version maintains the same props interface:
   ```typescript
   <PronunciationGameModular
     onComplete={(level) => handleComplete(level)}
     onBack={() => navigation.goBack()}
   />
   ```

### Gradual Migration

You can migrate gradually by:

1. **Extract individual components** from the original file
2. **Replace sections** one at a time
3. **Test each component** independently
4. **Keep both versions** until migration is complete

## Benefits

### 1. Maintainability
- Each component has a single responsibility
- Easier to locate and fix bugs
- Clear separation of concerns

### 2. Reusability
- Components can be used in different contexts
- Services can be shared across features
- Custom hook can power different UIs

### 3. Testability
- Individual components can be unit tested
- Service layer can be mocked easily
- Business logic is separated from UI

### 4. Performance
- Components can be individually optimized
- Better memory management
- Easier to implement lazy loading

## Usage Examples

### Using Individual Components

```typescript
import { AssessmentIntro, usePronunciationGame } from '../components';

function CustomAssessment() {
  const { startAssessment } = usePronunciationGame();
  
  return (
    <AssessmentIntro onStartAssessment={startAssessment} />
  );
}
```

### Using Services Directly

```typescript
import { speechRecognitionService } from '../services/speechRecognition';

async function processAudio(audioUri: string, expectedText: string) {
  const result = await speechRecognitionService.transcribeAudio(audioUri);
  const accuracy = speechRecognitionService.calculateAccuracy(expectedText, result.text);
  return { result, accuracy };
}
```

### Custom Hook Integration

```typescript
import { usePronunciationGame } from '../hooks/usePronunciationGame';

function CustomPronunciationFlow() {
  const game = usePronunciationGame({
    onComplete: (level, results) => {
      // Custom completion logic
      console.log('Assessment completed:', { level, results });
    }
  });

  // Use any part of the game state/logic
  return (
    <YourCustomUI
      phase={game.assessmentPhase}
      progress={game.currentItemIndex / game.totalItems}
      onRecord={game.startRecording}
    />
  );
}
```

## Next Steps

1. **Test the modular implementation** thoroughly
2. **Migrate gradually** from original to modular
3. **Add unit tests** for individual components
4. **Consider adding** more specialized components as needed
5. **Optimize performance** based on usage patterns

## Notes

- The original `PronunciationGame.tsx` remains unchanged for backward compatibility
- Both versions use the same underlying services and data structures
- The modular version provides identical functionality with better organization