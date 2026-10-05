import { describe, it, expect } from "vitest";
import { defaultDetectorEngine } from "../src/detection/detector-engine";
import { defaultPolicyEngine } from "../src/policy/policy-engine";
import { defaultSanitizerEngine } from "../src/sanitization/sanitizer-engine";

describe("Sanitization Engine (Redact, Anonymize, Tokenize)", () => {
  it("should redact sensitive emails and phone numbers correctly", () => {
    const raw = "My email is rahul@gmail.com and my phone is 9876543210.";
    const findings = defaultDetectorEngine.analyzePrompt(raw);
    const { evaluatedFindings } = defaultPolicyEngine.evaluate(findings);
    const { safePrompt } = defaultSanitizerEngine.sanitize(raw, evaluatedFindings);

    expect(safePrompt).not.toContain("rahul@gmail.com");
    expect(safePrompt).not.toContain("9876543210");
    expect(safePrompt).toContain("[EMAIL_REDACTED]");
  });

  it("should anonymize repeated person names consistently across prompt", () => {
    const raw = "Rahul Kumar works at ABC Corp. Rahul Kumar reported an issue.";
    const findings = defaultDetectorEngine.analyzePrompt(raw);
    const { evaluatedFindings } = defaultPolicyEngine.evaluate(findings);
    const { safePrompt } = defaultSanitizerEngine.sanitize(raw, evaluatedFindings);

    expect(safePrompt).toContain("Person_001");
    expect(safePrompt).not.toContain("Rahul Kumar");
  });
});
