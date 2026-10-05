import { CategoryPolicyMap, FirewallConfig } from "../types/policy";

export const DEFAULT_CATEGORY_POLICIES: CategoryPolicyMap = {
  // Personal
  PERSON: "ANONYMIZE",
  EMAIL: "REDACT",
  PHONE: "REDACT",
  ADDRESS: "REDACT",
  DOB: "REDACT",
  PAN: "BLOCK",
  AADHAAR: "BLOCK",
  PASSPORT: "BLOCK",
  DRIVER_LICENSE: "BLOCK",
  EMPLOYEE_ID: "REDACT",

  // Financial
  CREDIT_CARD: "BLOCK",
  BANK_ACCOUNT: "BLOCK",
  IFSC: "REDACT",
  UPI: "REDACT",
  TAX_ID: "BLOCK",

  // Authentication & Secrets
  PASSWORD: "BLOCK",
  PIN: "BLOCK",
  API_KEY: "BLOCK",
  ACCESS_TOKEN: "BLOCK",
  JWT: "BLOCK",
  AWS_KEY: "BLOCK",
  GITHUB_TOKEN: "BLOCK",
  GCP_KEY: "BLOCK",
  AZURE_KEY: "BLOCK",
  PRIVATE_KEY: "BLOCK",
  DB_CREDENTIAL: "BLOCK",

  // Health
  MEDICAL_RECORD: "BLOCK",
  PATIENT_ID: "BLOCK",
  DIAGNOSIS: "BLOCK",
  PRESCRIPTION: "BLOCK",

  // Organizational
  INTERNAL_IP: "WARN",
  INTERNAL_URL: "WARN",
  ORGANIZATION: "ANONYMIZE",
  ENV_VAR: "BLOCK",
  TICKET_ID: "ALLOW",
  CONFIDENTIAL_MARKER: "BLOCK",
};

export const DEFAULT_FIREWALL_CONFIG: FirewallConfig = {
  enabled: true,
  protectionMode: "balanced",
  liveDetection: true,
  beforeSendInterception: true,
  localOnlyMode: true,
  auditLoggingEnabled: true,
  retentionDays: 30,
  categoryPolicies: DEFAULT_CATEGORY_POLICIES,
  providerToggles: {
    chatgpt: true,
    gemini: true,
    claude: true,
    copilot: true,
    perplexity: true,
    deepseek: true,
    grok: true,
  },
};
