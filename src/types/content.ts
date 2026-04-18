/**
 * Refined content types for the pronunciation game
 * Designed for clarity, maintainability, and alignment with actual scoring capabilities
 */

/**
 * Individual content item (word, sentence, or paragraph)
 * Simplified structure - removed redundant ID encoding
 */
export interface ContentItem {
  id: string; // UUID or sequential ID, no structural encoding
  text: string; // The actual content to pronounce
  type: 'word' | 'sentence' | 'paragraph'; // Content type
  difficulty: 1 | 2 | 3 | 4 | 5; // Difficulty within the macro level
  category?: string; // Optional semantic category (e.g., "family", "food", "action")
  keyWords: string[]; // Keywords for feedback and analysis
  basePoints: number; // Base points before difficulty scaling
  isBackup?: boolean; // True if this is backup content (items 101-300)
  source?: string; // Where this came from (e.g., "pdf-level-1-macro-1")
}

/**
 * A macro level collection within a reader level
 * Contains words, sentences, and paragraphs at similar complexity
 */
export interface MacroLevel {
  id: string; // e.g., "m1", "m2", "m3", "m4"
  name: string; // e.g., "Basic Foundation"
  description: string;
  contentByType: {
    words: ContentItem[];
    sentences: ContentItem[];
    paragraphs: ContentItem[];
  };
}

/**
 * A complete reader level with all macro levels
 * Reader levels represent overall complexity progression
 */
export interface ReaderLevel {
  id: string; // e.g., "r1", "r2", "r3", "r4"
  name: string; // e.g., "Reader Level 1"
  focus: string; // e.g., "Basic & Survival Language"
  description: string;
  macroLevels: MacroLevel[];
}

/**
 * Complete game content database
 */
export interface GameContentDatabase {
  readerLevels: ReaderLevel[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalItems: number;
  };
}

/**
 * Scoring result for a single pronunciation attempt
 * Aligned with actual Google Speech-to-Text capabilities
 */
export interface PronunciationScore {
  contentId: string;
  expected: string; // The expected text
  spoken: string; // What the user actually said
  wordAccuracy: number; // 0-100: similarity between expected and spoken
  timestamp: Date;
  attempt: number; // Which attempt (1st, 2nd, 3rd, etc.)
  feedback?: string; // Optional user-friendly feedback
}

/**
 * Student progress tracking - simplified and aligned with actual data
 */
export interface StudentGameProgress {
  studentId: string;
  currentReaderLevel: string; // e.g., "r1"
  currentMacroLevel: string; // e.g., "m1"
  
  // Track which content items have been used
  completedItems: Set<string>; // Set of content IDs already attempted
  
  // Store pronunciation attempts
  attempts: {
    [contentId: string]: PronunciationScore[];
  };
  
  // Summary scores per content item
  bestScores: {
    [contentId: string]: number; // Best word accuracy (0-100) for each item
  };
  
  // Statistics
  stats: {
    totalAttempts: number;
    averageAccuracy: number; // Across all attempts
    completedWords: number;
    completedSentences: number;
    completedParagraphs: number;
  };
}

/**
 * Calculate points earned from accuracy score
 * Scales with difficulty
 */
export function calculatePoints(basePoints: number, difficulty: 1 | 2 | 3 | 4 | 5, accuracy: number): number {
  const difficultyMultiplier = difficulty / 3; // Ranges from 0.33 to 1.67
  const accuracyMultiplier = accuracy / 100; // 0-1 based on pronunciation accuracy
  return Math.round(basePoints * difficultyMultiplier * accuracyMultiplier);
}

/**
 * Determine which content type to show next in a session
 * Pattern: words → sentences → paragraphs → repeat
 */
export function getNextContentType(attemptCount: number): 'word' | 'sentence' | 'paragraph' {
  const cycle = attemptCount % 3;
  switch (cycle) {
    case 0:
      return 'word';
    case 1:
      return 'sentence';
    case 2:
      return 'paragraph';
    default:
      return 'word';
  }
}

/**
 * Determine reader level based on assessment score
 */
export function determineReaderLevel(totalScore: number): string {
  if (totalScore >= 31) return 'r4'; // 31-40 points -> Reader Level 4
  if (totalScore >= 21) return 'r3'; // 21-30 points -> Reader Level 3
  if (totalScore >= 11) return 'r2'; // 11-20 points -> Reader Level 2
  return 'r1'; // 0-10 points -> Reader Level 1
}
