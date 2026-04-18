/**
 * Content Loading and Management Utilities
 * Loads game content from JSON with smart randomization per user/session
 * 
 * Key Features:
 * - Per-user randomization (same user gets same random order within a session)
 * - Per-session randomization (new shuffle when app closes and reopens)
 * - Per-retry randomization (new shuffle when user clicks retry/back)
 * - Exclude set tracking (prevents duplicate content in same session)
 */

import { getItemWithTimeout, setItemWithTimeout, removeItemWithTimeout } from './asyncStorageWithTimeout';
import { GameContentDatabase, ReaderLevel, MacroLevel, ContentItem } from '../types/content';

// Import game content directly instead of fetching
let cachedContent: GameContentDatabase | null = null;
let contentLoadAttempted = false;

// ============================================================================
// Session Management
// ============================================================================

/**
 * Get or create session ID (persists across app close/open)
 */
export async function getOrCreateSessionId(userId: string = 'anonymous'): Promise<string> {
  const sessionKey = `session_${userId}`;
  let sessionId: string | null = null;
  
  try {
    sessionId = await getItemWithTimeout(sessionKey, 3000);
  } catch (error) {
    console.error('Failed to retrieve session ID from storage:', error);
  }

  if (!sessionId) {
    sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      await setItemWithTimeout(sessionKey, sessionId, 3000);
    } catch (error) {
      console.error('Failed to save session ID to storage:', error);
      // Continue anyway - session will just be random each time
    }
  }

  return sessionId;
}

/**
 * Reset session (call on retry or back button)
 */
export async function resetSession(userId: string = 'anonymous'): Promise<string> {
  const sessionKey = `session_${userId}`;
  try {
    await removeItemWithTimeout(sessionKey, 3000);
  } catch (error) {
    console.error('Failed to reset session ID:', error);
  }
  return getOrCreateSessionId(userId);
}

// ============================================================================
// Content Loading
// ============================================================================

/**
 * Load game content from JSON file
 * Cached in memory after first load
 * Uses require() for React Native/Expo compatibility
 */
export async function loadGameContent(): Promise<GameContentDatabase> {
  if (cachedContent) {
    return cachedContent;
  }

  try {
    // Use require for React Native compatibility
    // This loads the file at build time and bundles it with the app
    const gameContentData = require('../../public/gameContent.json');
    cachedContent = gameContentData;
    contentLoadAttempted = true;
    return cachedContent as GameContentDatabase;
  } catch (error) {
    console.error('Error loading game content:', error);
    contentLoadAttempted = true;
    throw error;
  }
}

// ============================================================================
// Randomization Utilities
// ============================================================================

/**
 * Seeded random number generator (reproducible randomization)
 * Same seed always produces same sequence
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate reproducible seed from user + session + scope
 */
function generateSeed(userId: string, sessionId: string, scope: string): number {
  const combined = `${userId}:${sessionId}:${scope}`;
  let hash = 0;

  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash);
}

/**
 * Fisher-Yates shuffle with optional deterministic seed
 */
function shuffleArray<T>(
  array: T[],
  seed?: number
): T[] {
  const arr = [...array];

  if (seed !== undefined) {
    // Deterministic shuffle with seed
    for (let i = arr.length - 1; i > 0; i--) {
      const randValue = seededRandom(seed + i);
      const j = Math.floor(randValue * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } else {
    // Random shuffle (no seed)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  return arr;
}

// ============================================================================
// Content Query Functions
// ============================================================================

/**
 * Get a reader level by ID
 */
export async function getReaderLevel(readerLevelId: string): Promise<ReaderLevel | null> {
  const content = await loadGameContent();
  return content.readerLevels.find(rl => rl.id === readerLevelId) || null;
}

/**
 * Get a macro level within a reader level
 */
export async function getMacroLevel(
  readerLevelId: string,
  macroLevelId: string
): Promise<MacroLevel | null> {
  const readerLevel = await getReaderLevel(readerLevelId);
  if (!readerLevel) return null;
  return readerLevel.macroLevels.find(ml => ml.id === macroLevelId) || null;
}

/**
 * Get all content items for a specific type within a macro level
 */
export async function getContentByType(
  readerLevelId: string,
  macroLevelId: string,
  contentType: 'word' | 'sentence' | 'paragraph'
): Promise<ContentItem[]> {
  const macroLevel = await getMacroLevel(readerLevelId, macroLevelId);
  if (!macroLevel) return [];

  const contentByType = contentType === 'word'
    ? 'words'
    : contentType === 'sentence'
      ? 'sentences'
      : 'paragraphs';

  return macroLevel.contentByType[contentByType] || [];
}

// ============================================================================
// Randomized Content Retrieval
// ============================================================================

/**
 * Get randomized content items with per-user, per-session determinism
 * 
 * Behavior:
 * - Same user + same session → same random order (deterministic)
 * - Same user + different session → different random order
 * - Different user → different random order
 * - Excluded items are never returned
 * 
 * @param userId Unique identifier for user (for reproducibility)
 * @param sessionId Unique session identifier (changes on app reopen or manual reset)
 * @param readerLevelId ID of reader level
 * @param macroLevelId ID of macro level
 * @param contentType Type of content (word, sentence, paragraph)
 * @param count Number of items to return
 * @param excludeIds Set of item IDs to exclude from results
 */
export async function getRandomizedContentItems(
  userId: string,
  sessionId: string,
  readerLevelId: string,
  macroLevelId: string,
  contentType: 'word' | 'sentence' | 'paragraph',
  count: number,
  excludeIds: Set<string> = new Set()
): Promise<ContentItem[]> {
  const items = await getContentByType(readerLevelId, macroLevelId, contentType);

  // Filter excluded items
  const available = items.filter(item => !excludeIds.has(item.id));

  if (available.length === 0) {
    return [];
  }

  // Generate deterministic seed
  const scope = `${readerLevelId}:${macroLevelId}:${contentType}`;
  const seed = generateSeed(userId, sessionId, scope);

  // Shuffle with seed
  const shuffled = shuffleArray(available, seed);

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get randomized content items (random shuffle, no seeding)
 * Use this for true randomness without reproducibility
 */
export async function getRandomContentItems(
  readerLevelId: string,
  macroLevelId: string,
  contentType: 'word' | 'sentence' | 'paragraph',
  count: number,
  excludeIds: Set<string> = new Set()
): Promise<ContentItem[]> {
  const items = await getContentByType(readerLevelId, macroLevelId, contentType);

  // Filter excluded items
  const available = items.filter(item => !excludeIds.has(item.id));

  if (available.length === 0) {
    return [];
  }

  // Random shuffle (no seed)
  const shuffled = shuffleArray(available);

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get a single random content item with per-user/session randomization
 */
export async function getRandomizedContentItem(
  userId: string,
  sessionId: string,
  readerLevelId: string,
  macroLevelId: string,
  contentType: 'word' | 'sentence' | 'paragraph',
  excludeIds: Set<string> = new Set()
): Promise<ContentItem | null> {
  const items = await getRandomizedContentItems(
    userId,
    sessionId,
    readerLevelId,
    macroLevelId,
    contentType,
    1,
    excludeIds
  );
  return items.length > 0 ? items[0] : null;
}

/**
 * Get a single random content item (true randomness)
 */
export async function getRandomContentItem(
  readerLevelId: string,
  macroLevelId: string,
  contentType: 'word' | 'sentence' | 'paragraph',
  excludeIds: Set<string> = new Set()
): Promise<ContentItem | null> {
  const items = await getRandomContentItems(
    readerLevelId,
    macroLevelId,
    contentType,
    1,
    excludeIds
  );
  return items.length > 0 ? items[0] : null;
}

// ============================================================================
// Search and Discovery
// ============================================================================

/**
 * Search content by keyword across all levels
 */
export async function searchContentByKeyword(keyword: string): Promise<ContentItem[]> {
  const content = await loadGameContent();
  const results: ContentItem[] = [];
  const lowerKeyword = keyword.toLowerCase();

  content.readerLevels.forEach(level => {
    level.macroLevels.forEach(macro => {
      Object.values(macro.contentByType).forEach(items => {
        items.forEach(item => {
          if (
            item.text.toLowerCase().includes(lowerKeyword) ||
            item.keyWords.some(kw => kw.toLowerCase().includes(lowerKeyword))
          ) {
            results.push(item);
          }
        });
      });
    });
  });

  return results;
}

/**
 * Get content item by ID (if it exists)
 */
export async function getContentItemById(itemId: string): Promise<ContentItem | null> {
  const content = await loadGameContent();

  for (const level of content.readerLevels) {
    for (const macro of level.macroLevels) {
      for (const items of Object.values(macro.contentByType)) {
        const item = items.find(i => i.id === itemId);
        if (item) return item;
      }
    }
  }

  return null;
}

// ============================================================================
// Statistics and Metadata
// ============================================================================

/**
 * Get comprehensive content statistics
 */
export async function getContentStats(): Promise<{
  totalReaderLevels: number;
  totalMacroLevels: number;
  totalItems: number;
  itemsByType: { words: number; sentences: number; paragraphs: number };
  itemsByReaderLevel: Record<string, number>;
}> {
  const content = await loadGameContent();

  let totalItems = 0;
  const itemsByType = { words: 0, sentences: 0, paragraphs: 0 };
  const itemsByReaderLevel: Record<string, number> = {};

  content.readerLevels.forEach(level => {
    let levelCount = 0;
    level.macroLevels.forEach(macro => {
      const wordCount = macro.contentByType.words?.length || 0;
      const sentenceCount = macro.contentByType.sentences?.length || 0;
      const paragraphCount = macro.contentByType.paragraphs?.length || 0;

      itemsByType.words += wordCount;
      itemsByType.sentences += sentenceCount;
      itemsByType.paragraphs += paragraphCount;

      levelCount += wordCount + sentenceCount + paragraphCount;
      totalItems += wordCount + sentenceCount + paragraphCount;
    });
    itemsByReaderLevel[level.id] = levelCount;
  });

  return {
    totalReaderLevels: content.readerLevels.length,
    totalMacroLevels: content.readerLevels.reduce((sum, level) => sum + level.macroLevels.length, 0),
    totalItems,
    itemsByType,
    itemsByReaderLevel,
  };
}

/**
 * Get all available content for a specific reader level
 */
export async function getReaderLevelContent(readerLevelId: string): Promise<{
  words: ContentItem[];
  sentences: ContentItem[];
  paragraphs: ContentItem[];
}> {
  const readerLevel = await getReaderLevel(readerLevelId);
  if (!readerLevel) {
    return { words: [], sentences: [], paragraphs: [] };
  }

  const allWords: ContentItem[] = [];
  const allSentences: ContentItem[] = [];
  const allParagraphs: ContentItem[] = [];

  readerLevel.macroLevels.forEach(macro => {
    allWords.push(...(macro.contentByType.words || []));
    allSentences.push(...(macro.contentByType.sentences || []));
    allParagraphs.push(...(macro.contentByType.paragraphs || []));
  });

  return { words: allWords, sentences: allSentences, paragraphs: allParagraphs };
}
