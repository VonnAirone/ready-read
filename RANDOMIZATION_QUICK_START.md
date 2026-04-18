import { getOrCreateSessionId, getRandomizedContentItems, resetSession } from 'src/utils/contentLoader';

/**
 * QUICK START: Using Randomized Content in Components
 * 
 * Copy & paste these patterns into your game room components
 */

// ============================================================================
// Pattern 1: Initialize Session on App Load
// ============================================================================
// Use this in App.tsx or your main dashboard component

```typescript
import { useEffect, useState } from 'react';
import { getOrCreateSessionId } from 'src/utils/contentLoader';

export function MyDashboard() {
  const [sessionId, setSessionId] = useState<string>('');
  const userId = auth.currentUser?.uid || 'anonymous';

  useEffect(() => {
    async function initSession() {
      const id = await getOrCreateSessionId(userId);
      setSessionId(id);
    }
    initSession();
  }, [userId]);

  return (
    <div>
      <GameRoom userId={userId} sessionId={sessionId} />
    </div>
  );
}
```

// ============================================================================
// Pattern 2: Load Randomized Content for Game
// ============================================================================
// Use this in your game room component

```typescript
import { getRandomizedContentItems } from 'src/utils/contentLoader';

export function GameRoom({ userId, sessionId }: { userId: string; sessionId: string }) {
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [excludedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadContent() {
      const items = await getRandomizedContentItems(
        userId,
        sessionId,
        'r1',           // Reader Level 1
        'm1',           // Macro Level 1
        'word',         // Content type: word | sentence | paragraph
        1,              // Get 1 item
        excludedIds     // Exclude already-used items
      );

      if (items.length > 0) {
        setCurrentItem(items[0]);
      }
    }

    loadContent();
  }, [userId, sessionId, excludedIds]);

  const handleNext = async () => {
    if (currentItem) {
      excludedIds.add(currentItem.id);  // Mark as used
      
      const items = await getRandomizedContentItems(
        userId,
        sessionId,
        'r1',
        'm1',
        'word',
        1,
        excludedIds
      );

      if (items.length > 0) {
        setCurrentItem(items[0]);
      }
    }
  };

  return (
    <div>
      {currentItem && (
        <div>
          <Text>{currentItem.text}</Text>
          <Text>Difficulty: {currentItem.difficulty}/5</Text>
          <Button onPress={handleNext}>Next Word</Button>
        </div>
      )}
    </div>
  );
}
```

// ============================================================================
// Pattern 3: Handle Retry/Back Button (New Shuffle)
// ============================================================================
// Use this in your game screen

```typescript
import { resetSession } from 'src/utils/contentLoader';

export function GameScreen({ userId, sessionId, setSessionId }) {
  const handleRetry = async () => {
    // Reset session to generate new randomization
    const newSessionId = await resetSession(userId);
    setSessionId(newSessionId);
    
    // Component will re-render with new session
    // This triggers new randomized content
  };

  return (
    <div>
      <Button onPress={handleRetry}>Try Again</Button>
    </div>
  );
}
```

// ============================================================================
// Pattern 4: Track User Progress (No Duplicates)
// ============================================================================
// Use this to maintain progress within a session

```typescript
import { getRandomizedContentItem } from 'src/utils/contentLoader';

interface GameProgress {
  completedItemIds: Set<string>;
  currentScore: number;
}

export function GameFlow({ userId, sessionId }: Props) {
  const [progress, setProgress] = useState<GameProgress>({
    completedItemIds: new Set(),
    currentScore: 0
  });
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    loadNextItem();
  }, []);

  async function loadNextItem() {
    const item = await getRandomizedContentItem(
      userId,
      sessionId,
      'r1',
      'm1',
      'word',
      progress.completedItemIds  // Prevents duplicates
    );
    setCurrentItem(item);
  }

  const handleItemComplete = (score: number) => {
    if (currentItem) {
      // Mark as completed
      const newCompleted = new Set(progress.completedItemIds);
      newCompleted.add(currentItem.id);

      setProgress({
        completedItemIds: newCompleted,
        currentScore: progress.currentScore + score
      });

      // Load next item
      loadNextItem();
    }
  };

  return (
    <div>
      {currentItem && (
        <GameCard
          item={currentItem}
          onComplete={handleItemComplete}
        />
      )}
      <Text>Progress: {progress.completedItemIds.size} items completed</Text>
      <Text>Score: {progress.currentScore}</Text>
    </div>
  );
}
```

// ============================================================================
// Pattern 5: Different Content Types (Word → Sentence → Paragraph)
// ============================================================================
// Use this for progressive difficulty

```typescript
export function ProgressiveGameRoom({ userId, sessionId }: Props) {
  const [contentType, setContentType] = useState<'word' | 'sentence' | 'paragraph'>('word');
  const [macroLevel, setMacroLevel] = useState<string>('m1');

  const handleLevelUp = () => {
    // Progress to harder macro level
    const nextLevel = parseInt(macroLevel[1]) + 1;
    if (nextLevel <= 4) {
      setMacroLevel(`m${nextLevel}`);
    } else {
      // Move to next content type
      if (contentType === 'word') {
        setContentType('sentence');
        setMacroLevel('m1');
      } else if (contentType === 'sentence') {
        setContentType('paragraph');
        setMacroLevel('m1');
      }
    }
  };

  return (
    <div>
      <GameRoom
        userId={userId}
        sessionId={sessionId}
        contentType={contentType}
        macroLevel={macroLevel}
        onLevelUp={handleLevelUp}
      />
    </div>
  );
}
```

// ============================================================================
// Pattern 6: True Random Content (No Seeding)
// ============================================================================
// Use this if you want different order every call

```typescript
import { getRandomContentItem } from 'src/utils/contentLoader';

export function RandomGameRoom() {
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);

  const loadRandomItem = async () => {
    // This uses TRUE randomization (no seeding)
    const item = await getRandomContentItem(
      'r1',      // Reader Level 1
      'm1',      // Macro Level 1
      'word'     // Content type
    );
    setCurrentItem(item);
  };

  return (
    <div>
      <Button onPress={loadRandomItem}>Get Random Word</Button>
      {currentItem && <Text>{currentItem.text}</Text>}
    </div>
  );
}
```

// ============================================================================
// Pattern 7: Search for Specific Content
// ============================================================================
// Use this for teacher preview or content search

```typescript
import { searchContentByKeyword } from 'src/utils/contentLoader';

export function ContentSearch() {
  const [results, setResults] = useState<ContentItem[]>([]);

  const handleSearch = async (keyword: string) => {
    const found = await searchContentByKeyword(keyword);
    setResults(found);
  };

  return (
    <div>
      <TextInput
        placeholder="Search content..."
        onChangeText={handleSearch}
      />
      {results.map(item => (
        <Text key={item.id}>{item.text}</Text>
      ))}
    </div>
  );
}
```

// ============================================================================
// Pattern 8: Content Statistics (For UI/Analytics)
// ============================================================================
// Use this to display content info

```typescript
import { getContentStats } from 'src/utils/contentLoader';

export function ContentInfoPanel() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      const data = await getContentStats();
      setStats(data);
    }
    loadStats();
  }, []);

  if (!stats) return <Text>Loading...</Text>;

  return (
    <div>
      <Text>Total Items: {stats.totalItems}</Text>
      <Text>Words: {stats.itemsByType.words}</Text>
      <Text>Sentences: {stats.itemsByType.sentences}</Text>
      <Text>Paragraphs: {stats.itemsByType.paragraphs}</Text>
      <Text>Reader Levels: {stats.totalReaderLevels}</Text>
      <Text>Macro Levels: {stats.totalMacroLevels}</Text>
    </div>
  );
}
```

// ============================================================================
// Types Reference
// ============================================================================

```typescript
interface ContentItem {
  id: string;                           // "r1_w1_1"
  text: string;                         // "Rice"
  type: 'word' | 'sentence' | 'paragraph';
  difficulty: number;                   // 1-5
  category: string;                     // ""
  keyWords: string[];                   // ["Rice"]
  basePoints: number;                   // 1, 2, or 3
}

// Content hierarchy:
// Reader Level: r1, r2, r3, r4
// Macro Level: m1, m2, m3, m4
// Content Type: 'word' | 'sentence' | 'paragraph'
```

// ============================================================================
// Common Issues & Solutions
// ============================================================================

// Issue: Content not loading
// Solution: Ensure /public/gameContent.json exists and is valid

// Issue: Same randomization every call
// Solution: Use getRandomContentItem() instead of getRandomizedContentItem()

// Issue: Content repeating (duplicates)
// Solution: Pass excludedIds set and update it as items are used

// Issue: New user sees same content as old user
// Solution: Pass unique userId to getRandomizedContentItems()

// Issue: App close/open changes content randomly
// Solution: This is normal! Different session ID = new shuffle.
//          Use getOrCreateSessionId() to get same session ID across app reopens.

