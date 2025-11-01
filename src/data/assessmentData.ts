// Assessment Data Configuration
// This file contains all the assessment passages and configuration
// You can easily modify passages, difficulties, and point values here

export interface AssessmentItem {
  id: string;
  type: "word" | "passage";
  content: string;
  title?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  points: number;
  keyWords?: string[]; // For passage assessment, key words to focus on
}

// Assessment passage for determining pronunciation level
export const ASSESSMENT_ITEMS: AssessmentItem[] = [
  // Single comprehensive passage for assessment
  { 
    id: "passage_1",
    type: "passage",
    content: "Have you ever wondered why the sky is blue? The answer involves light, air, and an event called scattering. Sunlight appears white, but it's a blend of all rainbow colors. When this light enters Earth's atmosphere, it hits tiny gas molecules, mostly nitrogen and oxygen. These molecules are much better at scattering shorter, high-energy wavelengths of light, like blue and violet. This phenomenon is called Rayleigh scattering. Because the blue light is scattered most effectively in all directions, that's the color we see when we look up. The sky isn't violet because the sun produces less violet light, and our eyes are less sensitive to violet than they are to blue. The blue sky you see is an elegant result of physics—an interaction between solar radiation and the invisible gases surrounding Earth.",
    title: "Why is the Sky Blue?",
    difficulty: "intermediate", 
    points: 10,
    keyWords: [
      "wondered", "atmosphere", "molecules", "nitrogen", "oxygen", 
      "scattering", "wavelengths", "phenomenon", "Rayleigh", "effectively", 
      "violet", "sensitive", "elegant", "physics", "interaction", 
      "radiation", "invisible", "surrounding"
    ]
  },
];

// Legacy support - convert to word-only array for backward compatibility
export const ASSESSMENT_WORDS = ASSESSMENT_ITEMS.filter(item => item.type === "word").map(item => ({
  word: item.content,
  difficulty: item.difficulty,
  points: item.points
}));

// Starter words for practice mode when no room data is available
export const STARTER_WORDS: string[] = ["cat", "sun", "determination"];

// Assessment scoring thresholds
// These determine what level a student is assigned based on their total score
export const ASSESSMENT_THRESHOLDS = {
  // Maximum possible score: 10 points (1 passage × 10 points)
  beginner: { min: 0, max: 3 },     // 0-3 points (0-30%)
  intermediate: { min: 4, max: 7 }, // 4-7 points (40-70%)
  advanced: { min: 8, max: 10 },    // 8-10 points (80-100%)
};

// Assessment configuration
export const ASSESSMENT_CONFIG = {
  totalItems: ASSESSMENT_ITEMS.length,
  totalWords: ASSESSMENT_WORDS.length, // Legacy support
  maxScore: ASSESSMENT_ITEMS.reduce((sum, item) => sum + item.points, 0),
  passingScore: 50, // Percentage needed to pass each item
};

// Helper function to determine level based on total score
export function determineLevel(totalScore: number): "beginner" | "intermediate" | "advanced" {
  if (totalScore >= ASSESSMENT_THRESHOLDS.advanced.min) {
    return "advanced";
  } else if (totalScore >= ASSESSMENT_THRESHOLDS.intermediate.min) {
    return "intermediate";
  } else {
    return "beginner";
  }
}

// Helper function to get items by difficulty level
export function getItemsByDifficulty(difficulty: "beginner" | "intermediate" | "advanced"): AssessmentItem[] {
  return ASSESSMENT_ITEMS.filter(item => item.difficulty === difficulty);
}

// Helper function to get words by difficulty level (legacy support)
export function getWordsByDifficulty(difficulty: "beginner" | "intermediate" | "advanced"): typeof ASSESSMENT_WORDS {
  return ASSESSMENT_WORDS.filter(word => word.difficulty === difficulty);
}

// Helper function to get assessment progress text
export function getAssessmentProgressText(currentIndex: number, isAssessment: boolean): string {
  if (!isAssessment) return "";
  return `Item ${currentIndex + 1} of ${ASSESSMENT_CONFIG.totalItems}`;
}