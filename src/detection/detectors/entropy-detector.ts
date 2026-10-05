import { SensitiveFinding } from "../../types/finding";
import { calculateShannonEntropy } from "../../utils/entropy";
import { hashValue } from "../../utils/hashing";

export function runEntropyDetector(text: string): SensitiveFinding[] {
  const findings: SensitiveFinding[] = [];

  // Tokenize string by whitespace and common punctuation
  const tokenRegex = /\b([a-zA-Z0-9_/+=-]{16,128})\b/g;

  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(text)) !== null) {
    const token = match[1];
    const start = match.index;
    const end = start + token.length;

    // Must contain mix of character classes (not just repetitive 'aaaaa' or '11111')
    const hasLower = /[a-z]/.test(token);
    const hasUpper = /[A-Z]/.test(token);
    const hasNum = /[0-9]/.test(token);

    if ((hasLower && hasUpper && hasNum) || token.length >= 24) {
      const entropy = calculateShannonEntropy(token);

      // Entropy > 4.2 indicates high randomness
      if (entropy >= 4.2) {
        findings.push({
          id: `entropy-secret-${start}-${end}`,
          type: "ACCESS_TOKEN",
          category: "AUTHENTICATION",
          matchedText: token,
          valueHash: hashValue(token),
          start,
          end,
          confidence: Math.min(0.95, 0.6 + (entropy - 4.0) * 0.2),
          riskScore: 90,
          severity: "critical",
          detectionMethod: "entropy",
          recommendedAction: "block",
        });
      }
    }
  }

  return findings;
}
