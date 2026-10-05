import { SensitiveFinding } from "../types/finding";
import { runRegexDetector } from "./detectors/regex-detector";
import { runContextDetector } from "./detectors/context-detector";
import { runNERDetector } from "./detectors/ner-detector";
import { runEntropyDetector } from "./detectors/entropy-detector";

export class DetectorEngine {
  /**
   * Run multi-layer detection across raw prompt text
   */
  public analyzePrompt(text: string): SensitiveFinding[] {
    if (!text || text.trim().length === 0) return [];

    // Run all 4 detector layers
    const regexFindings = runRegexDetector(text);
    const contextFindings = runContextDetector(text);
    const nerFindings = runNERDetector(text);
    const entropyFindings = runEntropyDetector(text);

    const allFindings = [
      ...regexFindings,
      ...contextFindings,
      ...nerFindings,
      ...entropyFindings,
    ];

    return this.deduplicateAndMergeFindings(allFindings);
  }

  /**
   * Deduplicates overlapping findings by prioritizing highest confidence & severity
   */
  private deduplicateAndMergeFindings(findings: SensitiveFinding[]): SensitiveFinding[] {
    if (findings.length === 0) return [];

    // Sort by start position, then by length descending, then by confidence descending
    const sorted = [...findings].sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      const lenA = a.end - a.start;
      const lenB = b.end - b.start;
      if (lenA !== lenB) return lenB - lenA; // Longer matches first
      return b.confidence - a.confidence;
    });

    const merged: SensitiveFinding[] = [];

    for (const current of sorted) {
      const isOverlapping = merged.some((existing) => {
        return (
          (current.start >= existing.start && current.start < existing.end) ||
          (current.end > existing.start && current.end <= existing.end) ||
          (current.start <= existing.start && current.end >= existing.end)
        );
      });

      if (!isOverlapping) {
        merged.push(current);
      }
    }

    return merged;
  }
}

export const defaultDetectorEngine = new DetectorEngine();
