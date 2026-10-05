import { SensitiveFinding } from "../types/finding";
import { TokenMapping } from "../types/storage";

export function tokenizeText(
  text: string,
  findings: SensitiveFinding[]
): { sanitizedText: string; tokensGenerated: TokenMapping[] } {
  if (!findings || findings.length === 0) {
    return { sanitizedText: text, tokensGenerated: [] };
  }

  const toTokenize = findings.filter((f) => f.recommendedAction === "tokenize");
  if (toTokenize.length === 0) {
    return { sanitizedText: text, tokensGenerated: [] };
  }

  const tokensGenerated: TokenMapping[] = [];
  const tokenMap: Record<string, string> = {};
  const counters: Record<string, number> = {};

  for (const finding of toTokenize) {
    const rawVal = finding.matchedText;
    const typeLabel = finding.type;

    if (!tokenMap[rawVal]) {
      counters[typeLabel] = (counters[typeLabel] || 0) + 1;
      const numStr = String(counters[typeLabel]).padStart(3, "0");
      const token = `TOKEN_${typeLabel}_${numStr}`;
      tokenMap[rawVal] = token;

      tokensGenerated.push({
        token,
        type: typeLabel,
        originalHash: finding.valueHash || "",
        createdAt: new Date().toISOString(),
      });
    }
  }

  const sorted = [...toTokenize].sort((a, b) => b.start - a.start);
  let result = text;

  for (const finding of sorted) {
    const token = tokenMap[finding.matchedText] || `TOKEN_${finding.type}_001`;
    const prefix = result.slice(0, finding.start);
    const suffix = result.slice(finding.end);
    result = `${prefix}${token}${suffix}`;
  }

  return { sanitizedText: result, tokensGenerated };
}
