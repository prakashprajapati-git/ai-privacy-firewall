import { SensitiveDataType } from "./finding";

export type ProtectionMode = "strict" | "balanced" | "permissive";

export type CategoryAction =
  | "ALLOW"
  | "WARN"
  | "REDACT"
  | "ANONYMIZE"
  | "TOKENIZE"
  | "BLOCK";

export type CategoryPolicyMap = Record<SensitiveDataType, CategoryAction>;

export interface FirewallConfig {
  enabled: boolean;
  protectionMode: ProtectionMode;
  liveDetection: boolean;
  beforeSendInterception: boolean;
  localOnlyMode: boolean;
  auditLoggingEnabled: boolean;
  retentionDays: number;
  categoryPolicies: CategoryPolicyMap;
  providerToggles: Record<string, boolean>;
}
