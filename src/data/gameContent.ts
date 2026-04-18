/**
 * Game Content Management (Refactored)
 * 
 * This file now serves as an interface to the content loading system.
 * All game content is loaded from public/gameContent.json at runtime.
 * 
 * Old structure: Hard-coded TypeScript objects
 * New structure: JSON file + runtime loader + clean utilities
 * 
 * Benefits:
 * - Content is maintainable outside of code
 * - Easy to add/update content without recompilation
 * - Type-safe access patterns
 * - Simplified caching
 */

// Import types and utilities
import { ContentItem } from '../types/content';
import { getContentByType } from '../utils/contentLoader';

// Re-export the new types and utilities
export { 
  ContentItem,
  MacroLevel,
  ReaderLevel,
  GameContentDatabase,
  PronunciationScore,
  StudentGameProgress,
  calculatePoints,
  getNextContentType,
  determineReaderLevel
} from '../types/content';

export {
  loadGameContent,
  getReaderLevel,
  getMacroLevel,
  getContentItemById,
  getContentByType,
  getRandomContentItem,
  getRandomContentItems,
  getRandomizedContentItem,
  getRandomizedContentItems,
  searchContentByKeyword,
  getContentStats
} from '../utils/contentLoader';

/**
 * DEPRECATED: Old hard-coded GAME_CONTENT object
 * 
 * The old inline content structure has been removed.
 * Use the functions exported above instead:
 * 
 * // Load all content
 * const db = await loadGameContent();
 * 
 * // Get random item for a student
 * const item = await getRandomContentItem('r1', 'm1', 'word', completedSet);
 * 
 * // Get multiple items
 * const items = await getRandomContentItems('r1', 'm1', 'sentence', 10, completedSet);
 * 
 * // Get item by ID
 * const found = await getContentItemById('r1_m1_w001');
 */

/**
 * Micro-levels 1-10: words, 11-20: sentences, 21-30: paragraphs
 * Get sequential content by reader level, macro level, and micro level
 */
export async function getSequentialContent(
  readerLevel: 1 | 2 | 3 | 4,
  macroLevel: 1 | 2 | 3 | 4,
  microLevel: number
): Promise<ContentItem | null> {
  const readerLevelId = `r${readerLevel}`;
  const macroLevelId = `m${macroLevel}`;

  // Determine content type based on micro level
  if (microLevel <= 10) {
    // Words (micro levels 1-10)
    const items = await getContentByType(readerLevelId, macroLevelId, 'word');
    return items[microLevel - 1] || null;
  } else if (microLevel <= 20) {
    // Sentences (micro levels 11-20)
    const items = await getContentByType(readerLevelId, macroLevelId, 'sentence');
    return items[microLevel - 11] || null;
  } else {
    // Paragraphs (micro levels 21-30)
    const items = await getContentByType(readerLevelId, macroLevelId, 'paragraph');
    return items[microLevel - 21] || null;
  }
}

/**
 * Get content type label for a given micro-level number
 */
export function getContentTypeForMicroLevel(microLevel: number): 'words' | 'sentences' | 'paragraphs' {
  if (microLevel <= 10) return 'words';
  if (microLevel <= 20) return 'sentences';
  return 'paragraphs';
}
