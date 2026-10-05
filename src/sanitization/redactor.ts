import { SensitiveFinding } from "../types/finding";

export function redactText(text: string, findings: SensitiveFinding[]): string {
  if (!findings || findings.length === 0) return text;

  // Filter findings that require redaction or blocking fallback
  const toRedact = findings.filter(
    (f) => f.recommendedAction === "redact" || f.recommendedAction === "block" || f.recommendedAction === "warn"
  );

  if (toRedact.length === 0) return text;

  // Sort findings in reverse order of start index to perform clean string replacement
  const sorted = [...toRedact].sort((a, b) => b.start - a.start);

  let result = text;
  for (const finding of sorted) {
    let label = `${finding.type}_REDACTED`;
    if (finding.type === "API_KEY" || finding.type === "AWS_KEY" || finding.type === "PASSWORD" || finding.type === "PRIVATE_KEY" || finding.type === "DB_CREDENTIAL") {
      label = "CREDENTIAL_REDACTED";
    }

    const prefix = result.slice(0, finding.start);
    const suffix = result.slice(finding.end);
    result = `${prefix}[${label}]${suffix}`;
  }

  return result;
}
