import { defaultDetectorEngine } from "../detection/detector-engine";
import { defaultRiskEngine } from "../risk/risk-engine";
import { defaultPolicyEngine } from "../policy/policy-engine";
import { defaultSanitizerEngine } from "../sanitization/sanitizer-engine";
import { storageManager } from "../storage/storage-manager";
import { AuditLogEntry } from "../types/storage";

// Background Service Worker Listener
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    (async () => {
      try {
        switch (message.type) {
          case "ANALYZE_PROMPT": {
            const { prompt, providerId } = message.payload;
            const config = await storageManager.getConfig();
            defaultPolicyEngine.updateConfig(config);

            // 1. Detect
            const rawFindings = defaultDetectorEngine.analyzePrompt(prompt);

            // 2. Risk Score
            const { score: overallRiskScore, highestSeverity } = defaultRiskEngine.calculateOverallRisk(rawFindings);

            // 3. Policy Evaluation
            const { evaluatedFindings, masterAction, requiresInterception } = defaultPolicyEngine.evaluate(rawFindings);

            // 4. Sanitize
            const { safePrompt, tokensGenerated } = defaultSanitizerEngine.sanitize(prompt, evaluatedFindings);

            // 5. Audit Log & Stats update
            const categories = Array.from(new Set(evaluatedFindings.map((f) => f.category)));
            const types = Array.from(new Set(evaluatedFindings.map((f) => f.type)));

            if (config.auditLoggingEnabled && evaluatedFindings.length > 0) {
              const logEntry: AuditLogEntry = {
                id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                timestamp: new Date().toISOString(),
                provider: providerId || "Unknown AI Provider",
                riskScore: overallRiskScore,
                detectedCategories: categories,
                detectedTypes: types,
                actionTaken: masterAction === "BLOCK" ? "BLOCKED" : masterAction === "REDACT" ? "REDACTED" : masterAction === "ANONYMIZE" ? "ANONYMIZED" : masterAction === "TOKENIZE" ? "TOKENIZED" : masterAction === "WARN" ? "WARNED" : "ALLOWED",
                findingsCount: evaluatedFindings.length,
              };
              await storageManager.addAuditLog(logEntry);
            }

            // Update stats
            await storageManager.updateStats({
              scanned: true,
              findingsCount: evaluatedFindings.length,
              action: masterAction === "BLOCK" ? "blocked" : masterAction === "REDACT" ? "redacted" : masterAction === "ANONYMIZE" ? "anonymized" : masterAction === "TOKENIZE" ? "tokenized" : undefined,
              categories,
            });

            sendResponse({
              success: true,
              result: {
                rawPrompt: prompt,
                safePrompt,
                overallRiskScore,
                highestSeverity,
                masterAction,
                findings: evaluatedFindings,
                requiresInterception,
                tokensGenerated,
              },
            });
            break;
          }

          case "GET_CONFIG": {
            const config = await storageManager.getConfig();
            sendResponse({ success: true, config });
            break;
          }

          case "SAVE_CONFIG": {
            await storageManager.saveConfig(message.payload.config);
            sendResponse({ success: true });
            break;
          }

          case "GET_STATS": {
            const stats = await storageManager.getStats();
            sendResponse({ success: true, stats });
            break;
          }

          case "GET_LOGS": {
            const logs = await storageManager.getAuditLogs();
            sendResponse({ success: true, logs });
            break;
          }

          case "CLEAR_LOGS": {
            await storageManager.clearAuditLogs();
            sendResponse({ success: true });
            break;
          }

          default:
            sendResponse({ success: false, error: "Unknown message type" });
        }
      } catch (err: any) {
        sendResponse({ success: false, error: err?.message || "Internal error" });
      }
    })();

    return true; // Keep channel open for async response
  });
}
