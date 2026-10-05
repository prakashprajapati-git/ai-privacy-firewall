import { providerFactory } from "../providers/provider-factory";
import { defaultDetectorEngine } from "../detection/detector-engine";
import { defaultRiskEngine } from "../risk/risk-engine";
import { defaultPolicyEngine } from "../policy/policy-engine";
import { defaultSanitizerEngine } from "../sanitization/sanitizer-engine";
import { createShadowInterceptModal } from "./components/InterceptModal";

class ContentScriptController {
  private activeAdapter = providerFactory.getAdapterForCurrentPage();

  public init() {
    if (!this.activeAdapter) return;
    console.log(`[AI Privacy Firewall] Active provider adapter: ${this.activeAdapter.name}`);

    this.attachInterceptors();
  }

  private attachInterceptors() {
    if (!this.activeAdapter) return;

    this.activeAdapter.interceptSubmit(async (rawPrompt, _event) => {
      return new Promise((resolve) => {
        // 1. Direct Local Analysis (0ms Instant & Independent of Background Worker State)
        const rawFindings = defaultDetectorEngine.analyzePrompt(rawPrompt);
        const { score: riskScore } = defaultRiskEngine.calculateOverallRisk(rawFindings);
        const { evaluatedFindings, masterAction, requiresInterception } = defaultPolicyEngine.evaluate(rawFindings);
        const { safePrompt } = defaultSanitizerEngine.sanitize(rawPrompt, evaluatedFindings);

        // Send audit log asynchronously to background service worker
        if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
          try {
            chrome.runtime.sendMessage({
              type: "ANALYZE_PROMPT",
              payload: {
                prompt: rawPrompt,
                providerId: this.activeAdapter?.name || "AI Provider",
              },
            });
          } catch (e) {
            // Ignore messaging error
          }
        }

        if (!requiresInterception || rawFindings.length === 0) {
          // SAFE prompt -> allow normal submission
          resolve({ allow: true, actionTaken: "allow", sanitizedPrompt: rawPrompt });
          return;
        }

        // Show Shadow DOM Intercept Modal
        const modal = createShadowInterceptModal(
          riskScore,
          masterAction,
          evaluatedFindings,
          rawPrompt,
          safePrompt,
          {
            onProtectAndSend: () => {
              resolve({
                allow: true,
                actionTaken: masterAction === "ANONYMIZE" ? "anonymized" : "redacted",
                sanitizedPrompt: safePrompt,
              });
            },
            onSendAnyway: masterAction !== "BLOCK" ? () => {
              resolve({ allow: true, actionTaken: "allow", sanitizedPrompt: rawPrompt });
            } : undefined,
            onCancel: () => {
              resolve({ allow: false, actionTaken: "blocked" });
            },
          }
        );

        document.body.appendChild(modal);
      });
    });
  }
}

const controller = new ContentScriptController();
controller.init();
