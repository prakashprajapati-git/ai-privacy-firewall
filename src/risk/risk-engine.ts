import { SensitiveFinding, Severity } from "../types/finding";

export const DEFAULT_TYPE_RISK_WEIGHTS: Record<string, number> = {
  PERSON: 20,
  EMAIL: 30,
  PHONE: 35,
  ADDRESS: 40,
  PAN: 70,
  AADHAAR: 80,
  CREDIT_CARD: 90,
  PASSWORD: 95,
  API_KEY: 100,
  AWS_KEY: 100,
  GITHUB_TOKEN: 100,
  PRIVATE_KEY: 100,
  DB_CREDENTIAL: 100,
  MEDICAL_RECORD: 90,
  ORGANIZATION: 30,
  INTERNAL_IP: 60,
  ENV_VAR: 85,
};

export class RiskEngine {
  /**
   * Calculates overall deterministic risk score (0-100) for a prompt given its findings.
   */
  public calculateOverallRisk(findings: SensitiveFinding[]): {
    score: number;
    highestSeverity: Severity;
  } {
    if (!findings || findings.length === 0) {
      return { score: 0, highestSeverity: "low" };
    }

    let maxSingleScore = 0;
    let cumulativeAdditive = 0;
    let highestSeverity: Severity = "low";

    const severityHierarchy: Record<Severity, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    for (const finding of findings) {
      const baseWeight = DEFAULT_TYPE_RISK_WEIGHTS[finding.type] || 30;
      if (baseWeight > maxSingleScore) {
        maxSingleScore = baseWeight;
      }

      // Add diminishing weight for additional findings
      cumulativeAdditive += baseWeight * 0.25;

      if (severityHierarchy[finding.severity] > severityHierarchy[highestSeverity]) {
        highestSeverity = finding.severity;
      }
    }

    const overallScore = Math.min(100, Math.round(maxSingleScore + cumulativeAdditive));
    return { score: overallScore, highestSeverity };
  }
}

export const defaultRiskEngine = new RiskEngine();
