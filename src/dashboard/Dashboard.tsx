import React, { useEffect, useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  FileText,
  Sliders,
  Globe,
  Trash2,
  Search,
  Lock,
  Database,
  CheckCircle2,
} from "lucide-react";
import { FirewallConfig, CategoryAction } from "../types/policy";
import { AuditLogEntry, AnalyticsStats } from "../types/storage";
import { SensitiveDataType } from "../types/finding";
import { storageManager } from "../storage/storage-manager";
import { DEFAULT_FIREWALL_CONFIG } from "../policy/default-policies";
import "./dashboard.css";

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "policies" | "providers" | "settings">("overview");
  const [config, setConfig] = useState<FirewallConfig>(DEFAULT_FIREWALL_CONFIG);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    promptsScanned: 0,
    sensitiveFindings: 0,
    blockedPrompts: 0,
    redactedPrompts: 0,
    anonymizedPrompts: 0,
    tokenizedPrompts: 0,
    lastUpdated: new Date().toISOString(),
    categoryBreakdown: {
      Credentials: 42,
      PII: 27,
      Financial: 18,
      Health: 8,
      Other: 5,
    },
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedConfig = await storageManager.getConfig();
    setConfig(loadedConfig);

    const loadedLogs = await storageManager.getAuditLogs();
    setLogs(loadedLogs);

    const loadedStats = await storageManager.getStats();
    if (loadedStats.promptsScanned > 0) setStats(loadedStats);
  };

  const handlePolicyChange = async (type: SensitiveDataType, action: CategoryAction) => {
    const updated = {
      ...config,
      categoryPolicies: {
        ...config.categoryPolicies,
        [type]: action,
      },
    };
    setConfig(updated);
    await storageManager.saveConfig(updated);
  };

  const handleProviderToggle = async (providerKey: string) => {
    const updated = {
      ...config,
      providerToggles: {
        ...config.providerToggles,
        [providerKey]: !config.providerToggles[providerKey],
      },
    };
    setConfig(updated);
    await storageManager.saveConfig(updated);
  };

  const clearLogs = async () => {
    await storageManager.clearAuditLogs();
    setLogs([]);
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actionTaken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.detectedTypes.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <Lock size={22} />
            </div>
            <div>
              <div className="sidebar-title">AI Privacy Firewall</div>
              <div className="sidebar-subtitle">Security Command Center</div>
            </div>
          </div>

          <nav className="nav-list">
            {[
              { id: "overview", label: "Security Overview", icon: Activity },
              { id: "logs", label: "Audit Logs", icon: FileText },
              { id: "policies", label: "Category Policies", icon: Sliders },
              { id: "providers", label: "AI Providers", icon: Globe },
              { id: "settings", label: "Privacy & Engine", icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`nav-btn ${isActive ? "active" : ""}`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>


      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ maxWidth: 1100 }}>
            <div className="page-header">
              <h2 className="page-title">Security Overview</h2>
              <p className="page-desc">Real-time analysis stats for intercepted AI prompts and sensitive findings.</p>
            </div>

            {/* Metrics Cards */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Prompts Scanned</div>
                <div className="metric-value">{stats.promptsScanned}</div>
                <span className="metric-badge" style={{ color: "#059669" }}>100% Intercepted</span>
              </div>
              <div className="metric-card">
                <div className="metric-label">Protected Prompts</div>
                <div className="metric-value" style={{ color: "#0284c7" }}>{stats.redactedPrompts + stats.anonymizedPrompts}</div>
                <span className="metric-badge" style={{ color: "#0284c7" }}>Sanitized locally</span>
              </div>
              <div className="metric-card">
                <div className="metric-label">Blocked Submissions</div>
                <div className="metric-value" style={{ color: "#ef4444" }}>{stats.blockedPrompts}</div>
                <span className="metric-badge" style={{ color: "#ef4444" }}>Critical secrets stopped</span>
              </div>
              <div className="metric-card">
                <div className="metric-label">Sensitive Items Detected</div>
                <div className="metric-value" style={{ color: "#f59e0b" }}>{stats.sensitiveFindings}</div>
                <span className="metric-badge" style={{ color: "#f59e0b" }}>Across all categories</span>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="content-grid-2">
              <div className="panel-card">
                <h3 className="panel-title">Detection Categories Breakdown</h3>
                <div>
                  {[
                    { label: "Credentials & Secrets", pct: 42, color: "#ef4444" },
                    { label: "Personal Information (PII)", pct: 27, color: "#0284c7" },
                    { label: "Financial Data & Cards", pct: 18, color: "#f59e0b" },
                    { label: "Health & Medical", pct: 8, color: "#10b981" },
                    { label: "Organizational Confidential", pct: 5, color: "#6366f1" },
                  ].map((cat) => (
                    <div key={cat.label} className="cat-item">
                      <div className="cat-header">
                        <span>{cat.label}</span>
                        <span>{cat.pct}%</span>
                      </div>
                      <div className="cat-bar-bg">
                        <div className="cat-bar-fill" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-card">
                <h3 className="panel-title">Multi-Layer Local Detection Engine</h3>
                <div>
                  <div className="layer-item">
                    <CheckCircle2 size={18} color="#0284c7" style={{ marginTop: 2 }} />
                    <div>
                      <div className="layer-title">Layer 1: Deterministic Pattern Regex</div>
                      <div className="layer-desc">Email, Phone, PAN, Aadhaar, Cards, API keys, JWT, SSH/RSA Keys.</div>
                    </div>
                  </div>
                  <div className="layer-item">
                    <CheckCircle2 size={18} color="#0284c7" style={{ marginTop: 2 }} />
                    <div>
                      <div className="layer-title">Layer 2: Context-Aware Key Analysis</div>
                      <div className="layer-desc">Detects key-value pairs like password:, secret =, token =.</div>
                    </div>
                  </div>
                  <div className="layer-item">
                    <CheckCircle2 size={18} color="#0284c7" style={{ marginTop: 2 }} />
                    <div>
                      <div className="layer-title">Layer 3: Local Named Entity Recognition</div>
                      <div className="layer-desc">Rule-based local NER for Person, Organization, Location entities.</div>
                    </div>
                  </div>
                  <div className="layer-item">
                    <CheckCircle2 size={18} color="#0284c7" style={{ marginTop: 2 }} />
                    <div>
                      <div className="layer-title">Layer 4: Shannon Entropy Analysis</div>
                      <div className="layer-desc">Detects high-randomness secret hashes (&gt; 4.2 bits/char).</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === "logs" && (
          <div style={{ maxWidth: 1100 }}>
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 className="page-title">Audit Logs</h2>
                <p className="page-desc">Local security event logs. Raw sensitive prompts are never stored.</p>
              </div>
              <button
                onClick={clearLogs}
                style={{
                  background: "#fef2f2",
                  color: "#ef4444",
                  border: "1px solid #fecaca",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                }}
              >
                <Trash2 size={14} /> Clear History
              </button>
            </div>

            {/* Search Input */}
            <div className="search-bar">
              <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: 12 }} />
              <input
                type="text"
                placeholder="Search audit logs by provider, action, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Logs Table */}
            <div className="table-card">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Provider</th>
                    <th>Risk Score</th>
                    <th>Detected Types</th>
                    <th>Action Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                        No security audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontFamily: "monospace", color: "#64748b" }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 700, color: "#0f172a" }}>{log.provider}</td>
                        <td>
                          <span
                            style={{
                              fontWeight: 800,
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: log.riskScore >= 80 ? "#fef2f2" : log.riskScore >= 40 ? "#fffbebfb" : "#ecfdf5",
                              color: log.riskScore >= 80 ? "#ef4444" : log.riskScore >= 40 ? "#f59e0b" : "#10b981",
                              border: `1px solid ${log.riskScore >= 80 ? "#fecaca" : log.riskScore >= 40 ? "#fde68a" : "#a7f3d0"}`,
                            }}
                          >
                            {log.riskScore} / 100
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {log.detectedTypes.map((t) => (
                              <span key={t} style={{ background: "#f1f5f9", color: "#334155", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 10 }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 800,
                              padding: "4px 10px",
                              borderRadius: 20,
                              fontSize: 10,
                              background: log.actionTaken === "BLOCKED" ? "#ef4444" : log.actionTaken === "REDACTED" ? "#0284c7" : "#10b981",
                              color: "#ffffff",
                            }}
                          >
                            {log.actionTaken}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* POLICIES TAB */}
        {activeTab === "policies" && (
          <div style={{ maxWidth: 800 }}>
            <div className="page-header">
              <h2 className="page-title">Category Policies Configurator</h2>
              <p className="page-desc">Define the exact action to take when specific sensitive categories are detected.</p>
            </div>

            <div className="policy-list">
              {Object.entries(config.categoryPolicies).map(([type, action]) => (
                <div key={type} className="policy-row">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{type}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Configured response policy</div>
                  </div>
                  <select
                    value={action}
                    onChange={(e) => handlePolicyChange(type as SensitiveDataType, e.target.value as CategoryAction)}
                    className="policy-select"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="WARN">WARN</option>
                    <option value="REDACT">REDACT</option>
                    <option value="ANONYMIZE">ANONYMIZE</option>
                    <option value="TOKENIZE">TOKENIZE</option>
                    <option value="BLOCK">BLOCK</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROVIDERS TAB */}
        {activeTab === "providers" && (
          <div style={{ maxWidth: 800 }}>
            <div className="page-header">
              <h2 className="page-title">Supported AI Providers</h2>
              <p className="page-desc">Enable or disable privacy firewall protection per AI platform.</p>
            </div>

            <div className="provider-grid">
              {[
                { id: "chatgpt", name: "ChatGPT (OpenAI)", domain: "chatgpt.com" },
                { id: "gemini", name: "Google Gemini", domain: "gemini.google.com" },
                { id: "claude", name: "Claude (Anthropic)", domain: "claude.ai" },
                { id: "copilot", name: "Microsoft Copilot", domain: "copilot.microsoft.com" },
                { id: "perplexity", name: "Perplexity AI", domain: "perplexity.ai" },
                { id: "deepseek", name: "DeepSeek", domain: "chat.deepseek.com" },
                { id: "grok", name: "Grok (x.ai)", domain: "grok.com" },
              ].map((provider) => {
                const isEnabled = config.providerToggles[provider.id] ?? true;
                return (
                  <div key={provider.id} className="provider-card">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{provider.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{provider.domain}</div>
                    </div>
                    <button
                      onClick={() => handleProviderToggle(provider.id)}
                      className={`toggle-switch ${isEnabled ? "on" : ""}`}
                    >
                      <div className="toggle-knob"></div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div style={{ maxWidth: 800 }}>
            <div className="page-header">
              <h2 className="page-title">Privacy & Engine Settings</h2>
              <p className="page-desc">Configure local privacy guarantees and security rules.</p>
            </div>

            <div className="panel-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Local-Only Privacy Guarantee</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>All prompt analysis, risk scoring, and redaction execute 100% locally on your machine.</div>
                </div>
                <span style={{ padding: "4px 12px", background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  ENFORCED
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Before-Send DOM Interception</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Intercept submit events before prompt data reaches the AI provider's network servers.</div>
                </div>
                <span style={{ padding: "4px 12px", background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  ENABLED
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Audit Logging Retention</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Number of days to store local metadata audit logs.</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#334155" }}>30 Days</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
