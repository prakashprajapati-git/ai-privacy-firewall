/**
 * Calculates Shannon Entropy of a string in bits per character.
 * High entropy (> 4.5) indicates high randomness (e.g., secret tokens, API keys, passwords).
 */
export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;

  const charFrequencies: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    charFrequencies[char] = (charFrequencies[char] || 0) + 1;
  }

  let entropy = 0;
  const len = str.length;
  for (const char in charFrequencies) {
    const p = charFrequencies[char] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}
