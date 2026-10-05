import { SensitiveFinding, SensitiveDataType, Severity } from "../../types/finding";
import { hashValue } from "../../utils/hashing";

interface ContextPattern {
  keywords: string[];
  type: SensitiveDataType;
  category: "PERSONAL" | "FINANCIAL" | "AUTHENTICATION" | "HEALTH" | "ORGANIZATION";
  severity: Severity;
}

const CONTEXT_PATTERNS: ContextPattern[] = [
  {
    keywords: [
      "password", "passwd", "passphrase", "pwd", "secret_pass", "master_password",
      "db_password", "admin_pass", "root_pass", "login_pass", "user_password", "user_pass"
    ],
    type: "PASSWORD",
    category: "AUTHENTICATION",
    severity: "critical",
  },
  {
    keywords: [
      "pin", "atm_pin", "atm pin", "passcode", "otp", "secret_code", "verification_code",
      "2fa", "mfa", "bank_pin", "card_pin", "security_code", "txn_pin", "transaction_pin"
    ],
    type: "PIN",
    category: "AUTHENTICATION",
    severity: "critical",
  },
  {
    keywords: [
      "api_key", "apikey", "access_token", "auth_token", "secret_key", "bearer",
      "secret", "creds", "cred", "credential", "credentials", "aws", "aws_key",
      "aws_secret", "gcp_key", "azure_key", "stripe_key", "sendgrid_key", "slack_token",
      "discord_token", "private_key", "ssh_key", "token", "secret_token", "client_secret"
    ],
    type: "AWS_KEY",
    category: "AUTHENTICATION",
    severity: "critical",
  },
  {
    keywords: [
      "credit_card", "card_number", "card_num", "cvv", "cvv2", "cvc", "cc_num",
      "card_pin", "card_exp", "expiry", "expiration_date", "exp_date"
    ],
    type: "CREDIT_CARD",
    category: "FINANCIAL",
    severity: "critical",
  },
  {
    keywords: [
      "bank_account", "account_number", "acc_num", "account_no", "iban", "swift",
      "routing_number", "routing_no", "account_id", "upi_id", "vpa", "ifsc"
    ],
    type: "BANK_ACCOUNT",
    category: "FINANCIAL",
    severity: "high",
  },
  {
    keywords: [
      "ssn", "social_security", "social_sec", "tax_id", "pan", "pan_number",
      "aadhaar", "aadhaar_no", "aadhaar_number", "passport", "passport_no",
      "driving_license", "dl_number", "voter_id", "dob", "date_of_birth",
      "birth_date", "mother_maiden_name", "employee_id", "emp_id"
    ],
    type: "TAX_ID",
    category: "PERSONAL",
    severity: "high",
  },
  {
    keywords: [
      "medical_record", "patient_id", "diagnosis", "prescription", "mrn",
      "health_insurance", "medicare"
    ],
    type: "MEDICAL_RECORD",
    category: "HEALTH",
    severity: "high",
  },
  {
    keywords: [
      "confidential", "internal_only", "proprietary", "trade_secret",
      "strictly_confidential", "classified", "do_not_share", "privileged",
      "db_uri", "connection_string", "database_url", "env_file", "env_var"
    ],
    type: "CONFIDENTIAL_MARKER",
    category: "ORGANIZATION",
    severity: "high",
  },
];

export function runContextDetector(text: string): SensitiveFinding[] {
  const findings: SensitiveFinding[] = [];

  for (const cp of CONTEXT_PATTERNS) {
    // Collect unique flexible keyword patterns per ContextPattern
    const processedPatterns = new Set<string>();

    for (const kw of cp.keywords) {
      // Normalize keyword so space, underscore, or hyphen can be optional or interchangeable
      const flexibleKw = kw.replace(/[\s_-]+/g, "[\\s_-]*");
      if (processedPatterns.has(flexibleKw)) continue;
      processedPatterns.add(flexibleKw);

      // Matches flexibleKw followed by optional spaces, : or =, and capturing the secret value (2-100 chars)
      const regex = new RegExp(`\\b(${flexibleKw})\\s*[:=]\\s*(["']?)([^\\s"',;]{2,100})\\2`, "gi");
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        const value = match[3];
        const fullMatch = match[0];
        const matchStart = match.index;
        const valueStart = matchStart + fullMatch.lastIndexOf(value);
        const valueEnd = valueStart + value.length;

        findings.push({
          id: `context-${cp.type}-${valueStart}-${valueEnd}`,
          type: cp.type,
          category: cp.category,
          matchedText: value,
          valueHash: hashValue(value),
          start: valueStart,
          end: valueEnd,
          confidence: 0.92,
          riskScore: cp.severity === "critical" ? 95 : 80,
          severity: cp.severity,
          detectionMethod: "context",
          recommendedAction: cp.severity === "critical" ? "block" : "redact",
        });
      }
    }
  }

  return findings;
}
