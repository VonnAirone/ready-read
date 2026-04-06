# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React Native (Expo SDK 51) pronunciation feedback app for Filipino education. Teachers create game rooms with pronunciation words; students join rooms, record their pronunciation, and get scored. Uses Google Cloud Speech-to-Text for transcription and Firebase for auth/data.

## Development Commands

```bash
npx expo start          # Start Metro bundler (dev server)
npx expo run:android    # Build and run on Android device/emulator
npx expo run:ios        # Build and run on iOS simulator
npx expo start --web    # Start web version
```

Backend (Flask + Whisper, optional local transcription):
```bash
cd backend && python app.py   # Runs on port 5000
```

No test suite or linter is configured.

## Architecture

### Two-role system
- **Teachers**: Create accounts, create game rooms with room codes, add pronunciation words to rooms, view student results and leaderboards
- **Students**: Create accounts, set up player profile (playerName), join rooms by code, practice pronunciation, track personal progress

### Navigation (App.tsx)
Auth state drives navigation via `onAuthStateChanged`. Three conditional stacks:
1. **Auth stack** (no user): Login, Signup, TeacherSignup
2. **Teacher stack** (role=teacher): TeacherDashboard, Room management, StudentList, AssessmentResults
3. **Student stack** (role=student): Branches on `hasPlayerName` — requires SetupPlayerProfile before accessing dashboard

### Firebase Collections
- `teacherAccounts` / `studentAccounts` — role determination by document existence
- `Playername` — student display names (keyed by uid)
- Rooms, leaderboard data stored in Firestore

### Speech/Audio Pipeline
1. `src/services/audioRecording.ts` — handles recording via expo-av
2. `src/services/googleSpeech.ts` — Google Cloud Speech-to-Text REST API (WEBM_OPUS encoding, retry with exponential backoff)
3. `src/services/speechRecognition.ts` — orchestrates transcription, calculates word-level accuracy
4. `src/services/scoring.ts` — Levenshtein-based pronunciation scoring (0-100)

Google Speech is initialized with credentials from `.env` via `@env` module (react-native-dotenv).

### Key Conventions
- Environment variables: accessed via `import { VAR } from "@env"` (declared in `env.d.ts`)
- Theme constants: `src/constants/theme.ts` (COLORS, GRADIENTS, FONT_SIZES, SPACING, BORDER_RADIUS)
- Custom font: Figtree (Regular, Medium, SemiBold, Bold) loaded via `hooks/useFonts`
- Firebase config: `src/services/firebase.ts` exports `auth` and `db`
- Onboarding: `src/contexts/OnboardingContext.tsx` tracks first-time users via AsyncStorage
- Babel: `react-native-reanimated/plugin` must remain the **last** plugin in `babel.config.js`

### Content System
- PDF source material in `src/assets/content/reader-level-{1-4}/`
- Python extraction scripts in `scripts/` convert PDFs to JSON
- `src/data/demoContent.ts` populates game content on app startup
- `src/data/assessmentData.ts` contains assessment word/sentence data
