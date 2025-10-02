// src/services/scoring.ts

// 🔹 Levenshtein distance algorithm
const levenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

// 🔹 Normalize text before scoring
// 🔹 Normalize text before scoring
const normalize = (text?: string): string => {
  if (!text) return ""; // handle undefined or null
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};


// 🔹 Calculate similarity score (0–100)
export const calculateScore = (spoken?: string, target?: string): number => {
  const cleanSpoken = normalize(spoken);
  const cleanTarget = normalize(target);

  if (!cleanSpoken || !cleanTarget) return 0;

  const dist = levenshtein(cleanSpoken, cleanTarget);
  const maxLen = Math.max(cleanSpoken.length, cleanTarget.length);

  if (maxLen === 0) return 0;

  const similarity = 1 - dist / maxLen;
  return Math.round(Math.max(0, similarity * 100));
};
