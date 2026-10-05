import { SensitiveFinding } from "../../types/finding";
import { hashValue } from "../../utils/hashing";

const EXCLUDED_NAME_WORDS = new Set([
  "Sanitization Engine",
  "Detector Engine",
  "Risk Engine",
  "Policy Engine",
  "Audit Logs",
  "Security Overview",
  "Chrome Extension",
  "AWS Key",
  "Credit Card",
  "Bank Account",
  "Medical Record",
  "Privacy Firewall",
  "GitHub Token",
  "OpenAI Key",
  "Google Cloud",
  "Azure Key",
]);

export function runNERDetector(text: string): SensitiveFinding[] {
  const findings: SensitiveFinding[] = [];

  // 1. Context-prefixed PERSON Entity Detection (e.g., Name: Rahul Kumar, Employee: Jane Doe, Mr. John Smith)
  const personContextRegex = /\b(?:Name|Employee|Patient|User|Person|Mr\.|Ms\.|Mrs\.|Dr\.)\s*[:=]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/g;

  let match: RegExpExecArray | null;
  while ((match = personContextRegex.exec(text)) !== null) {
    const matchedName = match[1];
    const nameStart = match.index + match[0].indexOf(matchedName);
    const nameEnd = nameStart + matchedName.length;

    if (!EXCLUDED_NAME_WORDS.has(matchedName)) {
      findings.push({
        id: `ner-person-${nameStart}-${nameEnd}`,
        type: "PERSON",
        category: "PERSONAL",
        matchedText: matchedName,
        valueHash: hashValue(matchedName),
        start: nameStart,
        end: nameEnd,
        confidence: 0.95,
        riskScore: 35,
        severity: "low",
        detectionMethod: "ner",
        recommendedAction: "anonymize",
      });
    }
  }

  // 2. Standalone Full Name Detection (e.g., Rahul Kumar, Jane Doe, John Smith)
  const standaloneNameRegex = /\b([A-Z][a-z]{2,15}\s+[A-Z][a-z]{2,15})\b/g;
  while ((match = standaloneNameRegex.exec(text)) !== null) {
    const matchedName = match[1];
    const start = match.index;
    const end = start + matchedName.length;

    // Ensure not already matched by context regex or excluded words
    const isAlreadyMatched = findings.some((f) => f.start <= start && f.end >= end);
    if (!isAlreadyMatched && !EXCLUDED_NAME_WORDS.has(matchedName)) {
      // Basic check: avoid common title cases like "The Project"
      const firstWord = matchedName.split(" ")[0];
      if (!["The", "This", "That", "Your", "Some", "Each", "Every", "High", "Low", "Medium", "Critical", "Safe"].includes(firstWord)) {
        findings.push({
          id: `ner-standalone-person-${start}-${end}`,
          type: "PERSON",
          category: "PERSONAL",
          matchedText: matchedName,
          valueHash: hashValue(matchedName),
          start,
          end,
          confidence: 0.85,
          riskScore: 35,
          severity: "low",
          detectionMethod: "ner",
          recommendedAction: "anonymize",
        });
      }
    }
  }

  // 3. ORGANIZATION Entity Detection (e.g., Company: ACME Corp, works at Google Inc., ABC Corp, ABC Technologies)
  const orgContextRegex = /\b(?:Company|Organization|Employer|Works at|at)\s*[:=]?\s*([A-Z0-9][a-zA-Z0-9\s]{1,30}?(?:Inc|Corp|LLC|Ltd|Technologies|Solutions|Systems|Group|Labs|Software))\b/gi;

  while ((match = orgContextRegex.exec(text)) !== null) {
    const orgName = match[1].trim();
    const orgStart = match.index + match[0].indexOf(orgName);
    const orgEnd = orgStart + orgName.length;

    findings.push({
      id: `ner-org-${orgStart}-${orgEnd}`,
      type: "ORGANIZATION",
      category: "ORGANIZATION",
      matchedText: orgName,
      valueHash: hashValue(orgName),
      start: orgStart,
      end: orgEnd,
      confidence: 0.85,
      riskScore: 30,
      severity: "low",
      detectionMethod: "ner",
      recommendedAction: "anonymize",
    });
  }

  return findings;
}
