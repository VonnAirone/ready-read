// Scoring utilities for pronunciation assessment

// Levenshtein distance calculation
const levenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
};

// Calculate pronunciation score based on similarity
export const calculateScore = (spoken: string, target: string): number => {
  if (!spoken || !target) return 0;
  
  const spokenNormalized = spoken.toLowerCase().trim();
  const targetNormalized = target.toLowerCase().trim();
  
  // Exact match gets perfect score
  if (spokenNormalized === targetNormalized) return 100;
  
  // Calculate similarity using Levenshtein distance
  const distance = levenshtein(spokenNormalized, targetNormalized);
  const maxLength = Math.max(spoken.length, target.length);
  const similarity = 1 - distance / maxLength;
  
  // Convert to percentage and ensure minimum threshold
  const score = Math.round(similarity * 100);
  return similarity < 0.5 ? 0 : Math.max(0, Math.min(100, score));
};

// Calculate average score from an array of scores
export const calculateAverageScore = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / scores.length);
};

// Determine performance level based on score
export const getPerformanceLevel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  if (score >= 60) return 'Needs Practice';
  return 'Keep Trying';
};

// Get color for score display
export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

// Get reading scale label based on average score (thresholds TBD per research)
export const getReadingScaleLabel = (avgScore: number): string => {
  if (avgScore >= 90) return 'Independent';
  if (avgScore >= 75) return 'Instructional';
  if (avgScore >= 60) return 'Frustration';
  return 'Non-Reader';
};