import { describe, it, expect } from "vitest";
import { defaultDetectorEngine } from "../src/detection/detector-engine";
import { runEntropyDetector } from "../src/detection/detectors/entropy-detector";

describe("Sensitive Data Detection Engine", () => {
  it("should detect email addresses accurately", () => {
    const text = "Please contact me at john.doe@example.com for further details.";
    const findings = defaultDetectorEngine.analyzePrompt(text);
    expect(findings.length).toBeGreaterThan(0);
    const emailFinding = findings.find((f) => f.type === "EMAIL");
    expect(emailFinding).toBeDefined();
    expect(emailFinding?.matchedText).toBe("john.doe@example.com");
  });

  it("should detect Indian PAN numbers", () => {
    const text = "My PAN number is ABCDE1234F.";
    const findings = defaultDetectorEngine.analyzePrompt(text);
    const panFinding = findings.find((f) => f.type === "PAN");
    expect(panFinding).toBeDefined();
    expect(panFinding?.matchedText).toBe("ABCDE1234F");
    expect(panFinding?.severity).toBe("high");
  });

  it("should detect AWS Access Keys", () => {
    const text = "Use key AKIAIOSFODNN7EXAMPLE to authenticate.";
    const findings = defaultDetectorEngine.analyzePrompt(text);
    const awsFinding = findings.find((f) => f.type === "AWS_KEY");
    expect(awsFinding).toBeDefined();
    expect(awsFinding?.severity).toBe("critical");
  });

  it("should detect context-based aws creds", () => {
    const text = "aws creds: 2367986798hjgigui";
    const findings = defaultDetectorEngine.analyzePrompt(text);
    const awsFinding = findings.find((f) => f.type === "AWS_KEY" || f.type === "API_KEY");
    expect(awsFinding).toBeDefined();
    expect(awsFinding?.matchedText).toBe("2367986798hjgigui");
    expect(awsFinding?.severity).toBe("critical");
  });

  it("should detect context-based passwords", () => {
    const text = "server_config: Password: MySecretPassword123!";
    const findings = defaultDetectorEngine.analyzePrompt(text);
    const passFinding = findings.find((f) => f.type === "PASSWORD");
    expect(passFinding).toBeDefined();
    expect(passFinding?.matchedText).toBe("MySecretPassword123!");
  });

  it("should calculate high Shannon Entropy for random secret strings", () => {
    const randomSecret = "8f3Kx92LmP7qZ1aB9cW0vU8yT";
    const findings = runEntropyDetector(`token = ${randomSecret}`);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].severity).toBe("critical");
  });

  it("should detect ATM PIN (atm pin: 6863)", () => {
    const text = "gemini ko atm pin: 6863 bhej raha hu";
    const findings = defaultDetectorEngine.analyzePrompt(text);
    expect(findings.length).toBeGreaterThan(0);
    const pinFinding = findings.find((f) => f.type === "PIN");
    expect(pinFinding).toBeDefined();
    expect(pinFinding?.matchedText).toBe("6863");
  });

  it("should match account_no, account no, and account-no seamlessly", () => {
    const text1 = "my account no: 98765432101";
    const text2 = "my account_no = 98765432101";
    const text3 = "my account-no: 98765432101";

    const f1 = defaultDetectorEngine.analyzePrompt(text1);
    const f2 = defaultDetectorEngine.analyzePrompt(text2);
    const f3 = defaultDetectorEngine.analyzePrompt(text3);

    expect(f1.find((f) => f.matchedText === "98765432101")).toBeDefined();
    expect(f2.find((f) => f.matchedText === "98765432101")).toBeDefined();
    expect(f3.find((f) => f.matchedText === "98765432101")).toBeDefined();
  });
});
