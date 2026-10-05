import { FirewallConfig } from "../types/policy";
import { AuditLogEntry, AnalyticsStats, TokenMapping } from "../types/storage";
import { DEFAULT_FIREWALL_CONFIG } from "../policy/default-policies";

const STORAGE_KEYS = {
  CONFIG: "aipf_config",
  AUDIT_LOGS: "aipf_audit_logs",
  STATS: "aipf_analytics_stats",
  TOKENS: "aipf_token_mappings",
};

export class StorageManager {
  private isChromeStorageAvailable(): boolean {
    return typeof chrome !== "undefined" && !!chrome.storage && !!chrome.storage.local;
  }

  public async getConfig(): Promise<FirewallConfig> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.CONFIG], (res) => {
          resolve(res[STORAGE_KEYS.CONFIG] || DEFAULT_FIREWALL_CONFIG);
        });
      });
    } else {
      const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return raw ? JSON.parse(raw) : DEFAULT_FIREWALL_CONFIG;
    }
  }

  public async saveConfig(config: FirewallConfig): Promise<void> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEYS.CONFIG]: config }, () => resolve());
      });
    } else {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    }
  }

  public async getAuditLogs(): Promise<AuditLogEntry[]> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.AUDIT_LOGS], (res) => {
          resolve(res[STORAGE_KEYS.AUDIT_LOGS] || []);
        });
      });
    } else {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return raw ? JSON.parse(raw) : [];
    }
  }

  public async addAuditLog(entry: AuditLogEntry): Promise<void> {
    const logs = await this.getAuditLogs();
    logs.unshift(entry); // Add newest first
    // Limit to max 500 entries
    const trimmed = logs.slice(0, 500);

    if (this.isChromeStorageAvailable()) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEYS.AUDIT_LOGS]: trimmed }, () => resolve());
      });
    } else {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(trimmed));
    }
  }

  public async clearAuditLogs(): Promise<void> {
    if (this.isChromeStorageAvailable()) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEYS.AUDIT_LOGS]: [] }, () => resolve());
      });
    } else {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    }
  }

  public async getStats(): Promise<AnalyticsStats> {
    const defaultStats: AnalyticsStats = {
      promptsScanned: 0,
      sensitiveFindings: 0,
      blockedPrompts: 0,
      redactedPrompts: 0,
      anonymizedPrompts: 0,
      tokenizedPrompts: 0,
      lastUpdated: new Date().toISOString(),
      categoryBreakdown: {},
    };

    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.STATS], (res) => {
          resolve(res[STORAGE_KEYS.STATS] || defaultStats);
        });
      });
    } else {
      const raw = localStorage.getItem(STORAGE_KEYS.STATS);
      return raw ? JSON.parse(raw) : defaultStats;
    }
  }

  public async updateStats(delta: {
    scanned?: boolean;
    findingsCount?: number;
    action?: "blocked" | "redacted" | "anonymized" | "tokenized";
    categories?: string[];
  }): Promise<void> {
    const stats = await this.getStats();

    if (delta.scanned) stats.promptsScanned += 1;
    if (delta.findingsCount) stats.sensitiveFindings += delta.findingsCount;
    if (delta.action === "blocked") stats.blockedPrompts += 1;
    if (delta.action === "redacted") stats.redactedPrompts += 1;
    if (delta.action === "anonymized") stats.anonymizedPrompts += 1;
    if (delta.action === "tokenized") stats.tokenizedPrompts += 1;

    if (delta.categories) {
      for (const cat of delta.categories) {
        stats.categoryBreakdown[cat] = (stats.categoryBreakdown[cat] || 0) + 1;
      }
    }

    stats.lastUpdated = new Date().toISOString();

    if (this.isChromeStorageAvailable()) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEYS.STATS]: stats }, () => resolve());
      });
    } else {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    }
  }
}

export const storageManager = new StorageManager();
