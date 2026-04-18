# Game Content Refactoring - Summary

## Changes Made

### 1. **New Type System** (`src/types/content.ts`)
Simplified and clarified data structures:

- **`ContentItem`** - Individual words/sentences/paragraphs with simplified ID structure (no encoding)
  - `id`: UUID or sequential identifier
  - `text`: The actual content to pronounce
  - `type`: 'word' | 'sentence' | 'paragraph'
  - `difficulty`: 1-5 (per macro level only)
  - `category`: Semantic grouping (e.g., "animals", "food", "family")
  - `keyWords`: For feedback and semantic analysis
  - `basePoints`: Base value before difficulty/accuracy scaling

- **`MacroLevel`** - Container for words, sentences, paragraphs at similar complexity
- **`ReaderLevel`** - Full hierarchy (r1-r4 with macro levels m1-m4)
- **`PronunciationScore`** - Aligned with actual Google Speech-to-Text capabilities
  - Only tracks `wordAccuracy` (0-100) not three separate metrics
  - `attempt` number for tracking progression

- **`StudentGameProgress`** - Simplified tracking
  - `completedItems`: Set of used content IDs
  - `attempts`: Pronunciation records per item
  - `bestScores`: Best accuracy for each item
  - `stats`: Summary statistics

- **Helper Functions**:
  - `calculatePoints(basePoints, difficulty, accuracy)` - Scales points by difficulty and pronunciation accuracy
  - `getNextContentType(attemptCount)` - Spiral pattern: words → sentences → paragraphs → repeat
  - `determineReaderLevel(score)` - Maps assessment scores to reader levels (r1-r4)

### 2. **Content Loader** (`src/utils/contentLoader.ts`)
Robust runtime content loading system:

```typescript
// Load all content (cached)
const db = await loadGameContent();

// Get specific reader/macro level
const readerLevel = await getReaderLevel('r1');
const macroLevel = await getMacroLevel('r1', 'm1');

// Get random items (avoids already-used content)
const word = await getRandomContentItem('r1', 'm1', 'word', completedSet);
const items = await getRandomContentItems('r1', 'm1', 'sentence', 10, completedSet);

// Get by ID
const item = await getContentItemById('r1_m1_w001');

// Search by keyword
const results = await searchContentByKeyword('family');

// Get stats
const stats = await getContentStats();
```

### 3. **JSON-Based Content** (`public/gameContent.json`)
- Content stored externally in JSON format
- Loaded at runtime (not bundled with code)
- No recompilation needed for content updates
- Currently contains Reader Level 1 complete data (sample structure for other levels)

### 4. **Updated gameContent.ts** 
Now serves as a clean export hub:
- Re-exports new types
- Re-exports loader utilities
- Includes deprecation notice for old GAME_CONTENT structure
- Maintains backward compatibility through exports

## Benefits

✅ **Maintainability**
- Content separated from code
- Easy to add/update words, sentences, paragraphs without recompilation

✅ **Type Safety**
- Clear, documented interfaces
- No more ambiguous nested objects

✅ **Aligned Scoring**
- Points scale with difficulty (1-5) and actual accuracy (0-100)
- No undefined "phonemeAccuracy", "stressIntonation", "vowelClarity" fields
- Matches actual Google Speech-to-Text capabilities

✅ **Clear Progression**
- Spiral content pattern: words → sentences → paragraphs
- No ambiguity about what students do next

✅ **Clean IDs**
- Simple identifiers without structural encoding
- Easier to manage and scale

✅ **Content Rotation**
- Support for backup content (items 101-300+)
- System automatically falls back when active content exhausted
- Easy to rotate and refresh content periodically

## Migration Guide

### Old Way
```typescript
import { GAME_CONTENT } from '../data/gameContent';
const item = GAME_CONTENT['reader-level-1'].macroLevels.macroLevel1.words[0];
```

### New Way
```typescript
import { getRandomContentItem } from '../data/gameContent';
const item = await getRandomContentItem('r1', 'm1', 'word', completedSet);
```

## Next Steps

1. **Add remaining reader levels** - Levels 2, 3, 4 data to JSON
2. **Add backup content** - Items 101-300+ for each macro level
3. **Update components** - Use new loader functions instead of direct access
4. **Database integration** - Consider loading from Firestore instead of bundled JSON
5. **Validation** - Add content validation schema (Zod/Yup)

## File Structure

```
src/
  ├─ types/
  │  └─ content.ts          (NEW - refined types)
  ├─ utils/
  │  └─ contentLoader.ts    (NEW - runtime loader)
  ├─ data/
  │  ├─ gameContent.ts      (REFACTORED - hub/exports)
  │  ├─ assessmentData.ts   (unchanged)
  │  └─ demoContent.ts      (legacy, can deprecate)
  
public/
  └─ gameContent.json       (NEW - external content)
```

## Backward Compatibility

The old `gameContent.ts` is now deprecated but still exports old helpers for gradual migration:
- `getContentForLevel(readerLevel, macroLevel)`
- `getSequentialContent(readerLevel, macroLevel, microLevel)`
- `getContentTypeForMicroLevel(microLevel)`

These can be updated incrementally in components using the new system.
