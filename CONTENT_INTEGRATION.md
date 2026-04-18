# Content Integration Guide

## Overview

The game content system has been completely refactored to:
- **Load content from external JSON** (`gameContent.json`) instead of hard-coded TypeScript
- **Implement per-user, per-session randomization** to provide unique content ordering
- **Support multiple reader levels and difficulty tiers** with flexible content progression

## Key Changes

### 1. CSV to JSON Pipeline

**Status:** ✅ Complete
- Location: `scripts/csvToJson.py`
- Input: 4 Reader Level CSV files
- Output: `public/gameContent.json`

**Content Summary:**
- **Reader Level 1:** Everyday Language (230 items: 25W + 25S + 25P per macro level)
- **Reader Level 2:** Transactional Language
- **Reader Level 3:** Academic Language
- **Reader Level 4:** Abstract Language
- **Total:** 690 items across 4 reader levels × 4 macro levels each

**File Structure:**
```
public/gameContent.json
├── readerLevels (4 levels)
│   └── macroLevels (4 per level: m1, m2, m3, m4)
│       └── contentByType
│           ├── words (25 items per macro level)
│           ├── sentences (25 items per macro level)
│           └── paragraphs (25 items per macro level)
```

### 2. Enhanced Content Loader

**Location:** `src/utils/contentLoader.ts`

**New Session Management Functions:**
```typescript
// Get or create persistent session ID
const sessionId = await getOrCreateSessionId(userId);

// Reset session (call on retry/back button)
const newSessionId = await resetSession(userId);
```

**Randomization Functions (Deterministic):**
```typescript
// Same user + same session = same random order
const items = await getRandomizedContentItems(
  userId,           // User ID for reproducibility
  sessionId,        // Session ID (changes on app reopen)
  'r1',            // Reader level ID
  'm1',            // Macro level ID
  'word',          // Content type
  5,               // Count
  excludeIds       // Items to skip
);

// Single item version
const item = await getRandomizedContentItem(userId, sessionId, 'r1', 'm1', 'word');
```

**Randomization Functions (True Random):**
```typescript
// New shuffle every time, no reproducibility
const items = await getRandomContentItems('r1', 'm1', 'word', 5);
const item = await getRandomContentItem('r1', 'm1', 'word');
```

### 3. Randomization Behavior

| Scenario | Behavior |
|----------|----------|
| **Same user, same session** | Same random order (deterministic) |
| **Same user, new session** | Different random order |
| **User closes/reopens app** | NEW session ID → new random order |
| **User clicks retry/back** | Call `resetSession()` → new session ID → new order |
| **Different user** | Different seed → different order |

### 4. Usage Examples

#### Example 1: Student Joins Game Room

```typescript
import { getOrCreateSessionId, getRandomizedContentItems } from 'src/utils/contentLoader';

// On app initialization
const userId = auth.currentUser?.uid || 'anonymous';
const sessionId = await getOrCreateSessionId(userId);

// Load content for the room
const words = await getRandomizedContentItems(
  userId,
  sessionId,
  'r1',      // Reader Level 1
  'm2',      // Macro Level 2
  'word',
  10,
  new Set()  // No excluded items yet
);

// Use words for game
```

#### Example 2: Student Retries the Game

```typescript
// When user clicks "Try Again"
const newSessionId = await resetSession(userId);

// This causes a new random shuffle
const newWords = await getRandomizedContentItems(
  userId,
  newSessionId,
  'r1',
  'm2',
  'word',
  10,
  new Set()
);
```

#### Example 3: Track Completed Items (No Duplicates in Session)

```typescript
const excludedIds = new Set<string>();
let currentItem = null;

// Get first item
currentItem = await getRandomizedContentItem(
  userId,
  sessionId,
  'r1',
  'm2',
  'word',
  excludedIds
);

// After student completes/scores, add to excluded set
if (currentItem) {
  excludedIds.add(currentItem.id);
}

// Get next item (won't duplicate)
currentItem = await getRandomizedContentItem(
  userId,
  sessionId,
  'r1',
  'm2',
  'word',
  excludedIds  // Prevents same item again
);
```

## Integration Checklist

### Phase 1: Component Integration
- [ ] Update `StudentDashboard` to initialize session on load
- [ ] Update game room components to call `getRandomizedContentItems()`
- [ ] Update retry/back button handlers to call `resetSession()`
- [ ] Pass `userId` and `sessionId` to all content loading functions

### Phase 2: User Progress Tracking
- [ ] Ensure `StudentGameProgress` type tracks session-scoped exclude set
- [ ] Save/restore `sessionId` in player profile
- [ ] Track `excludedIds` per session for duplicate prevention

### Phase 3: Testing
- [ ] Test same user gets consistent order in same session ✓
- [ ] Test new session gives different order ✓
- [ ] Test exclude set prevents duplicates ✓
- [ ] Test reset session generates new shuffles ✓

## API Reference

### Session Management
```typescript
// Get or create session
async function getOrCreateSessionId(userId?: string): Promise<string>

// Reset session
async function resetSession(userId?: string): Promise<string>
```

### Content Loading
```typescript
// Load all content (auto-cached)
async function loadGameContent(): Promise<GameContentDatabase>

// Query functions
async function getReaderLevel(id: string): Promise<ReaderLevel | null>
async function getMacroLevel(readerId: string, macroId: string): Promise<MacroLevel | null>
async function getContentByType(
  readerId: string,
  macroId: string,
  type: 'word' | 'sentence' | 'paragraph'
): Promise<ContentItem[]>
```

### Randomization (Deterministic - Per User/Session)
```typescript
// Get randomized items (same seed, same order)
async function getRandomizedContentItems(
  userId: string,
  sessionId: string,
  readerLevelId: string,
  macroLevelId: string,
  contentType: 'word' | 'sentence' | 'paragraph',
  count: number,
  excludeIds?: Set<string>
): Promise<ContentItem[]>

// Get single randomized item
async function getRandomizedContentItem(
  userId: string,
  sessionId: string,
  readerLevelId: string,
  macroLevelId: string,
  contentType: 'word' | 'sentence' | 'paragraph',
  excludeIds?: Set<string>
): Promise<ContentItem | null>
```

### Randomization (True Random - No Seed)
```typescript
// Get truly random items (new shuffle every time)
async function getRandomContentItems(
  readerLevelId: string,
  macroLevelId: string,
  contentType: 'word' | 'sentence' | 'paragraph',
  count: number,
  excludeIds?: Set<string>
): Promise<ContentItem[]>

// Get single random item
async function getRandomContentItem(
  readerLevelId: string,
  macroLevelId: string,
  contentType: 'word' | 'sentence' | 'paragraph',
  excludeIds?: Set<string>
): Promise<ContentItem | null>
```

### Search & Discovery
```typescript
// Search by keyword
async function searchContentByKeyword(keyword: string): Promise<ContentItem[]>

// Get single item by ID
async function getContentItemById(itemId: string): Promise<ContentItem | null>

// Get all content for a reader level
async function getReaderLevelContent(readerId: string): Promise<{
  words: ContentItem[];
  sentences: ContentItem[];
  paragraphs: ContentItem[];
}>
```

### Metadata
```typescript
// Get content statistics
async function getContentStats(): Promise<{
  totalReaderLevels: number;
  totalMacroLevels: number;
  totalItems: number;
  itemsByType: { words: number; sentences: number; paragraphs: number };
  itemsByReaderLevel: Record<string, number>;
}>
```

## Content Structure

Each content item has:
```typescript
{
  id: string;                    // Unique identifier (e.g., "r1_w1_1")
  text: string;                  // The actual content (word/sentence/paragraph)
  type: 'word' | 'sentence' | 'paragraph';
  difficulty: number;            // 1-5 (scaled from CSV tiers)
  category: string;              // Empty for now, can be populated later
  keyWords: string[];            // First 5 words for search
  basePoints: number;            // Points before accuracy scaling (1 for words, 2 for sentences, 3 for paragraphs)
}
```

## Performance Considerations

- **Content cached in memory** after first load (subsequent calls instant)
- **Seeded randomization** uses deterministic algorithm (no async overhead)
- **Session ID persisted** in AsyncStorage (minimal I/O)
- **Exclude sets** as native JavaScript Sets (O(1) lookup)

## Migration Path

**Old System:** Hard-coded content in `src/data/gameContent.ts`
**New System:** External JSON loaded at runtime

Backward compatibility maintained via re-exports in `src/data/gameContent.ts`.

## Updating Content

To update game content:

1. Edit CSV files in workspace root
2. Run: `python3 scripts/csvToJson.py`
3. Commit updated `public/gameContent.json`
4. No code changes needed

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Content not loading | Check `/public/gameContent.json` exists and is valid JSON |
| Same randomization each time | Use `getRandomContentItems()` instead of `getRandomizedContentItems()` |
| Duplicates appearing | Ensure `excludeIds` set is passed and updated correctly |
| Session not persisting | Check AsyncStorage is available and permissions granted |
| Performance degradation | Check if content is being reloaded unnecessarily (use cached version) |

## Next Steps

1. Integrate session management in app initialization
2. Update game room components to use `getRandomizedContentItems()`
3. Add session reset on retry/back buttons
4. Test randomization behavior end-to-end
5. Monitor performance in production
