import { SensitiveFinding, RecommendedAction } from "../types/finding";
import { FirewallConfig, CategoryAction } from "../types/policy";
import { DEFAULT_FIREWALL_CONFIG } from "./default-policies";

export class PolicyEngine {
  private config: FirewallConfig;

  constructor(config?: FirewallConfig) {
    this.config = config || DEFAULT_FIREWALL_CONFIG;
  }

  public updateConfig(newConfig: FirewallConfig) {
    this.config = newConfig;
  }

  /**
   * Evaluates findings against the active policy and protection mode.
   * Determines recommended actions per finding and master prompt action (allow, warn, redact, block).
   */
  public evaluate(findings: SensitiveFinding[]): {
    evaluatedFindings: SensitiveFinding[];
    masterAction: CategoryAction;
    requiresInterception: boolean;
  } {
    if (!this.config.enabled || findings.length === 0) {
      return {
        evaluatedFindings: findings,
        masterAction: "ALLOW",
        requiresInterception: false,
      };
    }

    const evaluated = findings.map((finding) => {
      let configuredAction = this.config.categoryPolicies[finding.type] || "REDACT";

      // Override based on protection mode
      if (this.config.protectionMode === "strict") {
        if (finding.severity === "critical" || finding.severity === "high") {
          configuredAction = "BLOCK";
        }
      } else if (this.config.protectionMode === "permissive") {
        if (configuredAction === "BLOCK") {
          configuredAction = "WARN";
        }
      }

      const recAction = this.categoryActionToRecommended(configuredAction);
      return {
        ...finding,
        recommendedAction: recAction,
      };
    });

    let masterAction: CategoryAction = "ALLOW";
    const hasBlock = evaluated.some((f) => f.recommendedAction === "block");
    const hasRedact = evaluated.some((f) => f.recommendedAction === "redact");
    const hasAnonymize = evaluated.some((f) => f.recommendedAction === "anonymize");
    const hasTokenize = evaluated.some((f) => f.recommendedAction === "tokenize");
    const hasWarn = evaluated.some((f) => f.recommendedAction === "warn");

    if (hasBlock) masterAction = "BLOCK";
    else if (hasRedact) masterAction = "REDACT";
    else if (hasAnonymize) masterAction = "ANONYMIZE";
    else if (hasTokenize) masterAction = "TOKENIZE";
    else if (hasWarn) masterAction = "WARN";

    const requiresInterception = masterAction !== "ALLOW";

    return {
      evaluatedFindings: evaluated,
      masterAction,
      requiresInterception,
    };
  }

  private categoryActionToRecommended(action: CategoryAction): RecommendedAction {
    switch (action) {
      case "ALLOW": return "allow";
      case "WARN": return "warn";
      case "REDACT": return "redact";
      case "ANONYMIZE": return "anonymize";
      case "TOKENIZE": return "tokenize";
      case "BLOCK": return "block";
      default: return "redact";
    }
  }
}

export const defaultPolicyEngine = new PolicyEngine();
