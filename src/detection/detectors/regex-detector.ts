import { SensitiveFinding, SensitiveDataType, Severity } from "../../types/finding";
import { hashValue } from "../../utils/hashing";

export interface PatternDefinition {
  type: SensitiveDataType;
  category: "PERSONAL" | "FINANCIAL" | "AUTHENTICATION" | "HEALTH" | "ORGANIZATION";
  regex: RegExp;
  severity: Severity;
  confidence: number;
  validator?: (match: string) => boolean;
}

// Luhn Algorithm check for credit cards
function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export const REGEX_PATTERNS: PatternDefinition[] = [
  // Secrets & Authentication
  {
    type: "AWS_KEY",
    category: "AUTHENTICATION",
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    severity: "critical",
    confidence: 0.98,
  },
  {
    type: "GITHUB_TOKEN",
    category: "AUTHENTICATION",
    regex: /\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})\b/g,
    severity: "critical",
    confidence: 0.99,
  },
  {
    type: "API_KEY",
    category: "AUTHENTICATION",
    regex: /\b(sk-[a-zA-Z0-9]{32,}|sk-proj-[a-zA-Z0-9_-]{32,}|AIza[0-9A-Za-z\\-_]{35}|sk_live_[0-9a-zA-Z]{24,34}|rk_live_[0-9a-zA-Z]{24,34}|xox[baprs]-[0-9a-zA-Z]{10,48})\b/g,
    severity: "critical",
    confidence: 0.95,
  },
  {
    type: "JWT",
    category: "AUTHENTICATION",
    regex: /\b(eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})\b/g,
    severity: "high",
    confidence: 0.95,
  },
  {
    type: "PRIVATE_KEY",
    category: "AUTHENTICATION",
    regex: /-----BEGIN (?:RSA |EC |PGP |OPENSSH )?PRIVATE KEY-----[\s\S]+?-----END (?:RSA |EC |PGP |OPENSSH )?PRIVATE KEY-----/g,
    severity: "critical",
    confidence: 1.0,
  },
  {
    type: "DB_CREDENTIAL",
    category: "AUTHENTICATION",
    regex: /\b((?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/[^\s:@]+:[^\s:@]+@[^\s/]+(?:\/[^\s]*)?)\b/g,
    severity: "critical",
    confidence: 0.98,
  },

  // Financial
  {
    type: "CREDIT_CARD",
    category: "FINANCIAL",
    regex: /\b(?:4[0-9]{3}(?:[ -]?[0-9]{4}){3}|5[1-5][0-9]{2}(?:[ -]?[0-9]{4}){3}|3[47][0-9]{2}[ -]?[0-9]{6}[ -]?[0-9]{5}|6(?:011|5[0-9]{2})[ -]?[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4})\b/g,
    severity: "critical",
    confidence: 0.95,
    validator: validateLuhn,
  },
  {
    type: "PIN",
    category: "AUTHENTICATION",
    regex: /\b(?:pin|atm pin|passcode|otp|bank pin|card pin|security code)\s*[:=]?\s*([0-9]{3,8})\b/gi,
    severity: "critical",
    confidence: 0.92,
  },
  {
    type: "PAN",
    category: "FINANCIAL",
    regex: /\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b/g,
    severity: "high",
    confidence: 0.92,
  },
  {
    type: "UPI",
    category: "FINANCIAL",
    regex: /\b([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64})\b/g,
    severity: "medium",
    confidence: 0.85,
    validator: (match) => match.includes("@ok") || match.includes("@upi") || match.includes("@ybl") || match.includes("@paytm") || match.includes("@axis"),
  },
  {
    type: "IFSC",
    category: "FINANCIAL",
    regex: /\b([A-Z]{4}0[A-Z0-9]{6})\b/g,
    severity: "medium",
    confidence: 0.90,
  },
  {
    type: "BANK_ACCOUNT",
    category: "FINANCIAL",
    regex: /\b([A-Z]{2}[0-9]{2}[A-Z0-9]{11,30})\b/g, // IBAN
    severity: "high",
    confidence: 0.90,
  },

  // Personal PII
  {
    type: "EMAIL",
    category: "PERSONAL",
    regex: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
    severity: "medium",
    confidence: 0.95,
  },
  {
    type: "PHONE",
    category: "PERSONAL",
    regex: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    severity: "medium",
    confidence: 0.80,
  },
  {
    type: "AADHAAR",
    category: "PERSONAL",
    regex: /\b([2-9]{1}\d{3}[\s-]?\d{4}[\s-]?\d{4})\b/g,
    severity: "high",
    confidence: 0.90,
  },
  {
    type: "TAX_ID",
    category: "PERSONAL",
    regex: /\b([0-9]{3}-[0-9]{2}-[0-9]{4})\b/g, // US SSN
    severity: "critical",
    confidence: 0.95,
  },
  {
    type: "PASSPORT",
    category: "PERSONAL",
    regex: /\b([A-Z]{1}[0-9]{7,8})\b/g,
    severity: "high",
    confidence: 0.75,
  },
  {
    type: "DRIVER_LICENSE",
    category: "PERSONAL",
    regex: /\b([A-Z]{2}[0-9]{2}\s?[0-9]{11})\b/g,
    severity: "medium",
    confidence: 0.85,
  },
  {
    type: "DOB",
    category: "PERSONAL",
    regex: /\b(?:dob|date of birth|born on)\s*[:=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/gi,
    severity: "medium",
    confidence: 0.85,
  },

  // Health
  {
    type: "MEDICAL_RECORD",
    category: "HEALTH",
    regex: /\b(MRN-?[0-9]{6,10}|PID-?[0-9]{5,10})\b/gi,
    severity: "high",
    confidence: 0.90,
  },

  // Organizational
  {
    type: "CONFIDENTIAL_MARKER",
    category: "ORGANIZATION",
    regex: /\b(CONFIDENTIAL|STRICTLY CONFIDENTIAL|INTERNAL ONLY|PROPRIETARY|TRADE SECRET|DO NOT SHARE)\b/gi,
    severity: "high",
    confidence: 0.95,
  },
  {
    type: "INTERNAL_IP",
    category: "ORGANIZATION",
    regex: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g,
    severity: "medium",
    confidence: 0.90,
  },
  {
    type: "ENV_VAR",
    category: "ORGANIZATION",
    regex: /\b([A-Z0-9_]{3,}_(?:SECRET|KEY|PASSWORD|TOKEN|AUTH)=(?:[^\s]+))\b/gi,
    severity: "high",
    confidence: 0.95,
  },
  {
    type: "TICKET_ID",
    category: "ORGANIZATION",
    regex: /\b([A-Z]{2,10}-\d{1,6})\b/g,
    severity: "low",
    confidence: 0.60,
  },
];

export function runRegexDetector(text: string): SensitiveFinding[] {
  const findings: SensitiveFinding[] = [];

  for (const def of REGEX_PATTERNS) {
    def.regex.lastIndex = 0; // Reset regex state
    let match: RegExpExecArray | null;

    while ((match = def.regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const matchedText = match[1] || fullMatch;
      const fullStart = match.index;
      const start = fullStart + fullMatch.lastIndexOf(matchedText);
      const end = start + matchedText.length;

      if (def.validator && !def.validator(matchedText)) {
        continue;
      }

      findings.push({
        id: `regex-${def.type}-${start}-${end}`,
        type: def.type,
        category: def.category,
        matchedText,
        valueHash: hashValue(matchedText),
        start,
        end,
        confidence: def.confidence,
        riskScore: def.severity === "critical" ? 100 : def.severity === "high" ? 80 : def.severity === "medium" ? 40 : 20,
        severity: def.severity,
        detectionMethod: "regex",
        recommendedAction: def.severity === "critical" ? "block" : def.severity === "high" ? "redact" : "warn",
      });
    }
  }

  return findings;
}
