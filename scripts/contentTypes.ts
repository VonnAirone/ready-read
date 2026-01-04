// Generated TypeScript interfaces for pronunciation content
export interface WordItem {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface MacroContent {
  words: WordItem[];
  sentences: string[];
  paragraphs: string[];
}

export interface ReaderLevel {
  [macroKey: string]: MacroContent;
}

export interface PronunciationContent {
  [readerKey: string]: ReaderLevel;
}
