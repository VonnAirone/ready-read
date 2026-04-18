/**
 * Content Integration Helper
 * Bridges old system (studentLevel, currentMacroLevel) to new system (r1-r4, m1-m4)
 */

import {
  getRandomizedContentItems,
  getOrCreateSessionId,
  resetSession,
  getContentByType,
} from './contentLoader';
import { ContentItem } from '../types/content';

/**
 * Map studentLevel (1-4) to readerLevelId (r1-r4)
 */
export function mapStudentLevelToReaderLevel(studentLevel: number): string {
  return `r${Math.max(1, Math.min(4, studentLevel))}`;
}

/**
 * Map macroLevel (1-4) to macroLevelId (m1-m4)
 */
export function mapMacroLevelToId(macroLevel: number): string {
  return `m${Math.max(1, Math.min(4, macroLevel))}`;
}

/**
 * Determine content type from micro level (1-30)
 * 1-10: words, 11-20: sentences, 21-30: paragraphs
 */
export function getContentTypeFromMicroLevel(microLevel: number): 'word' | 'sentence' | 'paragraph' {
  if (microLevel >= 1 && microLevel <= 10) return 'word';
  if (microLevel >= 11 && microLevel <= 20) return 'sentence';
  return 'paragraph';
}

/**
 * Get index within content type (0-9 for each group)
 */
export function getIndexWithinType(microLevel: number): number {
  return (microLevel - 1) % 10;
}

/**
 * Load randomized content for current session
 * Maps old system to new and returns content items
 */
export async function loadRandomizedContent(
  userId: string,
  sessionId: string,
  studentLevel: number,
  currentMacroLevel: number,
  contentType: 'word' | 'sentence' | 'paragraph',
  count: number = 25,
  excludeIds: Set<string> = new Set()
): Promise<ContentItem[]> {
  const readerLevelId = mapStudentLevelToReaderLevel(studentLevel);
  const macroLevelId = mapMacroLevelToId(currentMacroLevel);

  return getRandomizedContentItems(
    userId,
    sessionId,
    readerLevelId,
    macroLevelId,
    contentType,
    count,
    excludeIds
  );
}

/**
 * Get all content for a specific type (for batch loading)
 */
export async function loadAllContentByType(
  studentLevel: number,
  currentMacroLevel: number,
  contentType: 'word' | 'sentence' | 'paragraph'
): Promise<ContentItem[]> {
  const readerLevelId = mapStudentLevelToReaderLevel(studentLevel);
  const macroLevelId = mapMacroLevelToId(currentMacroLevel);

  return getContentByType(readerLevelId, macroLevelId, contentType);
}

/**
 * Initialize or get session for user
 */
export async function initializeUserSession(userId: string): Promise<string> {
  return getOrCreateSessionId(userId);
}

export { getOrCreateSessionId };

/**
 * Reset session on retry/back
 */
export async function resetUserSession(userId: string): Promise<string> {
  return resetSession(userId);
}

/**
 * Convert ContentItem text to legacy format for compatibility
 */
export interface LegacyContentItem {
  content: string;
  id: string;
}

export function contentItemToLegacy(item: ContentItem): LegacyContentItem {
  return {
    id: item.id,
    content: item.text,
  };
}

/**
 * Helper to generate exclude set from array of IDs
 */
export function createExcludeSet(ids: string[]): Set<string> {
  return new Set(ids);
}

/**
 * Helper to add item to exclude set (returns new Set for immutability)
 */
export function addToExcludeSet(excludeSet: Set<string>, itemId: string): Set<string> {
  const newSet = new Set(excludeSet);
  newSet.add(itemId);
  return newSet;
}
