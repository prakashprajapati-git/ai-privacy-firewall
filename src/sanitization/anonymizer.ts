import { SensitiveFinding } from "../types/finding";

export function anonymizeText(text: string, findings: SensitiveFinding[]): string {
  if (!findings || findings.length === 0) return text;

  const toAnonymize = findings.filter((f) => f.recommendedAction === "anonymize");
  if (toAnonymize.length === 0) return text;

  const entityMaps: Record<string, string> = {};
  const entityCounters: Record<string, number> = {
    PERSON: 0,
    ORGANIZATION: 0,
    LOCATION: 0,
  };

  // Build prompt-scoped consistent map
  for (const finding of toAnonymize) {
    const rawVal = finding.matchedText;
    const type = finding.type === "ORGANIZATION" ? "Organization" : "Person";
    const counterKey = type.toUpperCase();

    if (!entityMaps[rawVal]) {
      entityCounters[counterKey] = (entityCounters[counterKey] || 0) + 1;
      const numStr = String(entityCounters[counterKey]).padStart(3, "0");
      entityMaps[rawVal] = `${type}_${numStr}`;
    }
  }

  // Sort by start index descending
  const sorted = [...toAnonymize].sort((a, b) => b.start - a.start);
  let result = text;

  for (const finding of sorted) {
    const alias = entityMaps[finding.matchedText] || `${finding.type}_001`;
    const prefix = result.slice(0, finding.start);
    const suffix = result.slice(finding.end);
    result = `${prefix}${alias}${suffix}`;
  }

  return result;
}
