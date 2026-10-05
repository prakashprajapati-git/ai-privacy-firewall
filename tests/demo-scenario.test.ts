import { describe, it, expect } from "vitest";
import { defaultDetectorEngine } from "../src/detection/detector-engine";
import { defaultRiskEngine } from "../src/risk/risk-engine";
import { defaultPolicyEngine } from "../src/policy/policy-engine";
import { defaultSanitizerEngine } from "../src/sanitization/sanitizer-engine";

describe("Demo Scenario Verification (Spec #34)", () => {
  it("should intercept high-risk prompt and produce exact expected safe prompt", () => {
    const rawPrompt = `Please analyze this employee:

Name: Rahul Kumar
Email: rahul.kumar@gmail.com
Phone: 9876543210
PAN: ABCDE1234F
Password: MySecret123
AWS Key: AKIAIOSFODNN7EXAMPLE

Give me a summary.`;

    // 1. Detection
    const rawFindings = defaultDetectorEngine.analyzePrompt(rawPrompt);
    expect(rawFindings.length).toBeGreaterThan(0);

    // 2. Risk Scoring
    const { score: riskScore } = defaultRiskEngine.calculateOverallRisk(rawFindings);
    expect(riskScore).toBe(100);

    // 3. Policy Evaluation
    const { evaluatedFindings, masterAction, requiresInterception } = defaultPolicyEngine.evaluate(rawFindings);
    expect(requiresInterception).toBe(true);
    expect(masterAction).toBe("BLOCK");

    // 4. Sanitization
    const { safePrompt } = defaultSanitizerEngine.sanitize(rawPrompt, evaluatedFindings);

    // Verify safe prompt does NOT leak raw sensitive values
    expect(safePrompt).not.toContain("rahul.kumar@gmail.com");
    expect(safePrompt).not.toContain("9876543210");
    expect(safePrompt).not.toContain("ABCDE1234F");
    expect(safePrompt).not.toContain("MySecret123");
    expect(safePrompt).not.toContain("AKIAIOSFODNN7EXAMPLE");

    // Verify sanitized structure contains redacted / anonymized markers
    expect(safePrompt).toContain("Person_001");
    expect(safePrompt).toContain("[EMAIL_REDACTED]");
    expect(safePrompt).toContain("[PHONE_REDACTED]");
    expect(safePrompt).toContain("[PAN_REDACTED]");
    expect(safePrompt).toContain("[CREDENTIAL_REDACTED]");
  });
});
