// Assessment Data Configuration
// Updated for 4-Level Reader System with passages for level determination
// Each passage is worth 10 points (total 40 points possible)

export interface AssessmentItem {
  id: string;
  type: "word" | "passage" | "sentence";
  content: string;
  title?: string;
  readerLevel: 1 | 2 | 3 | 4;
  points: number;
  focusArea: string;
  keyWords?: string[];
}

// Reader Level Definitions
export const READER_LEVEL_INFO = {
  1: {
    label: "Reader Level 1",
    focus: "Basic & Survival Language",
    description: "Recognizing the most common, everyday words needed for basic communication and understanding concrete objects (kitchen, street, walk).",
    scoreRange: "0-10 points"
  },
  2: {
    label: "Reader Level 2", 
    focus: "Transactional & Social Language",
    description: "Using words required for navigating social situations, work, and community life, focusing on actions and interactions (cooperate, schedule, purchase).",
    scoreRange: "11-20 points"
  },
  3: {
    label: "Reader Level 3",
    focus: "Academic & Complex Language", 
    description: "Mastering the vocabulary needed for school and professional reports, focusing on analysis, procedure, and technical explanation (hypothesis, derive, validate).",
    scoreRange: "21-30 points"
  },
  4: {
    label: "Reader Level 4",
    focus: "Abstract & Philosophical Language",
    description: "Interpreting high-level abstract concepts, ideologies, and specialized terms used in critical evaluation and theory (paradigm, epistemology, dichotomy).",
    scoreRange: "31-40 points"
  }
};

// Assessment passages for determining Reader Level
// Each passage targets different vocabulary complexity levels
export const ASSESSMENT_ITEMS: AssessmentItem[] = [
  // Reader Level 1 Assessment - Basic & Survival Language
  {
    id: "r1_assessment",
    type: "passage",
    content: "The kitchen has a big table. People walk on the street every day. The sun is hot and the water is cold. Children play in the park with their friends.",
    title: "Basic Communication",
    readerLevel: 1,
    points: 10,
    focusArea: "Basic & Survival Language",
    keyWords: ["kitchen", "table", "walk", "street", "sun", "hot", "water", "cold", "children", "play", "park", "friends"]
  },
  
  // Reader Level 2 Assessment - Transactional & Social Language  
  {
    id: "r2_assessment",
    type: "passage", 
    content: "We need to cooperate with our team to schedule the meeting. Please purchase the supplies before the deadline. The manager will organize the project and communicate with clients.",
    title: "Social & Work Communication",
    readerLevel: 2,
    points: 10,
    focusArea: "Transactional & Social Language",
    keyWords: ["cooperate", "schedule", "meeting", "purchase", "supplies", "deadline", "organize", "project", "communicate", "clients"]
  },
  
  // Reader Level 3 Assessment - Academic & Complex Language
  {
    id: "r3_assessment", 
    type: "passage",
    content: "The hypothesis requires careful analysis to validate the research findings. Scientists must derive conclusions from experimental data and document the procedure systematically.",
    title: "Academic & Technical Communication",
    readerLevel: 3,
    points: 10,
    focusArea: "Academic & Complex Language", 
    keyWords: ["hypothesis", "analysis", "validate", "research", "findings", "derive", "conclusions", "experimental", "procedure", "systematically"]
  },
  
  // Reader Level 4 Assessment - Abstract & Philosophical Language
  {
    id: "r4_assessment",
    type: "passage",
    content: "The epistemological paradigm presents a fundamental dichotomy between empirical and theoretical approaches. This conceptual framework challenges traditional methodological assumptions in contemporary discourse.",
    title: "Abstract & Philosophical Communication", 
    readerLevel: 4,
    points: 10,
    focusArea: "Abstract & Philosophical Language",
    keyWords: ["epistemological", "paradigm", "dichotomy", "empirical", "theoretical", "conceptual", "framework", "methodological", "assumptions", "discourse"]
  }
];

// Determine Reader Level based on total assessment score
export const determineReaderLevel = (totalScore: number): 1 | 2 | 3 | 4 => {
  if (totalScore >= 31) return 4;      // 31-40 points -> Reader Level 4
  if (totalScore >= 21) return 3;      // 21-30 points -> Reader Level 3  
  if (totalScore >= 11) return 2;      // 11-20 points -> Reader Level 2
  return 1;                            // 0-10 points  -> Reader Level 1
};

// Calculate weighted total score (each passage worth 10 points)
export const calculateTotalScore = (results: { percentage: number; points: number }[]): number => {
  return results.reduce((total, result) => {
    return total + Math.round((result.percentage / 100) * result.points);
  }, 0);
};

// Content structure for each Reader Level (to be expanded)
export interface ContentLevel {
  words: string[];      // 100 active + 200 backup = 300 total
  sentences: string[];  // 100 active + 200 backup = 300 total  
  paragraphs: string[]; // 100 active + 200 backup = 300 total
}

export interface ReaderLevelContent {
  level: 1 | 2 | 3 | 4;
  subLevels: number;    // 30 total (10 words + 10 sentences + 10 paragraphs)
  content: ContentLevel;
  completedContent: string[]; // Track used content IDs to prevent repetition
}

// Legacy support for backward compatibility with old system
export const STARTER_WORDS: string[] = ["cat", "sun", "determination"];

// Legacy exports for backward compatibility
export const ASSESSMENT_WORDS = ASSESSMENT_ITEMS.filter(item => item.type === "word").map(item => ({
  word: item.content,
  readerLevel: item.readerLevel,
  points: item.points
}));

// Legacy assessment thresholds (for old 3-level system)
export const ASSESSMENT_THRESHOLDS = {
  beginner: { min: 0, max: 10 },
  intermediate: { min: 11, max: 20 },
  advanced: { min: 21, max: 30 },
};

// Legacy function to determine old level system
export function determineLevel(totalScore: number): "beginner" | "intermediate" | "advanced" {
  if (totalScore >= ASSESSMENT_THRESHOLDS.advanced.min) {
    return "advanced";
  } else if (totalScore >= ASSESSMENT_THRESHOLDS.intermediate.min) {
    return "intermediate";
  } else {
    return "beginner";
  }
}

// Assessment configuration
export const ASSESSMENT_CONFIG = {
  totalItems: ASSESSMENT_ITEMS.length,
  maxScore: ASSESSMENT_ITEMS.reduce((sum, item) => sum + item.points, 0),
  passingScore: 50, // Percentage needed to pass each item
};

// Helper function to get assessment progress text
export function getAssessmentProgressText(currentIndex: number, isAssessment: boolean): string {
  if (!isAssessment) return "";
  return `Passage ${currentIndex + 1} of ${ASSESSMENT_CONFIG.totalItems}`;
}