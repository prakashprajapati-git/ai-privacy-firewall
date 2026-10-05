import { CategoryAction } from "./policy";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  provider: string;
  riskScore: number;
  detectedCategories: string[];
  detectedTypes: string[];
  actionTaken: "ALLOWED" | "WARNED" | "REDACTED" | "ANONYMIZED" | "TOKENIZED" | "BLOCKED";
  findingsCount: number;
}

export interface AnalyticsStats {
  promptsScanned: number;
  sensitiveFindings: number;
  blockedPrompts: number;
  redactedPrompts: number;
  anonymizedPrompts: number;
  tokenizedPrompts: number;
  lastUpdated: string;
  categoryBreakdown: Record<string, number>;
}

export interface TokenMapping {
  token: string;
  type: string;
  originalHash: string; // Hash of raw value for security
  createdAt: string;
}
