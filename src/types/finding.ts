export type SensitiveCategory =
  | "PERSONAL"
  | "FINANCIAL"
  | "AUTHENTICATION"
  | "HEALTH"
  | "ORGANIZATION";

export type SensitiveDataType =
  // Personal
  | "PERSON"
  | "EMAIL"
  | "PHONE"
  | "ADDRESS"
  | "DOB"
  | "PAN"
  | "AADHAAR"
  | "PASSPORT"
  | "DRIVER_LICENSE"
  | "EMPLOYEE_ID"
  // Financial
  | "CREDIT_CARD"
  | "BANK_ACCOUNT"
  | "IFSC"
  | "UPI"
  | "TAX_ID"
  // Authentication / Secrets
  | "PASSWORD"
  | "PIN"
  | "API_KEY"
  | "ACCESS_TOKEN"
  | "JWT"
  | "AWS_KEY"
  | "GITHUB_TOKEN"
  | "GCP_KEY"
  | "AZURE_KEY"
  | "PRIVATE_KEY"
  | "DB_CREDENTIAL"
  // Health
  | "MEDICAL_RECORD"
  | "PATIENT_ID"
  | "DIAGNOSIS"
  | "PRESCRIPTION"
  // Organizational
  | "INTERNAL_IP"
  | "INTERNAL_URL"
  | "ORGANIZATION"
  | "ENV_VAR"
  | "TICKET_ID"
  | "CONFIDENTIAL_MARKER";

export type Severity = "low" | "medium" | "high" | "critical";

export type DetectionMethod =
  | "regex"
  | "context"
  | "ner"
  | "entropy"
  | "combined";

export type RecommendedAction =
  | "allow"
  | "warn"
  | "redact"
  | "anonymize"
  | "tokenize"
  | "block";

export interface SensitiveFinding {
  id: string;
  type: SensitiveDataType;
  category: SensitiveCategory;
  valueHash?: string;
  matchedText: string;
  start: number;
  end: number;
  confidence: number;
  riskScore: number;
  severity: Severity;
  detectionMethod: DetectionMethod;
  recommendedAction: RecommendedAction;
}

export interface PromptScanResult {
  rawPrompt: string;
  safePrompt: string;
  overallRiskScore: number;
  highestSeverity: Severity;
  recommendedAction: RecommendedAction;
  findings: SensitiveFinding[];
  isBlocked: boolean;
  timestamp: string;
  providerId: string;
}
