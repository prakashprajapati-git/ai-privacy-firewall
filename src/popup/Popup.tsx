import React, { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, Settings, ExternalLink, Activity, Lock } from "lucide-react";
import { FirewallConfig, ProtectionMode } from "../types/policy";
import { AnalyticsStats } from "../types/storage";
import { storageManager } from "../storage/storage-manager";
import { DEFAULT_FIREWALL_CONFIG } from "../policy/default-policies";

export const Popup: React.FC = () => {
  const [config, setConfig] = useState<FirewallConfig>(DEFAULT_FIREWALL_CONFIG);
  const [stats, setStats] = useState<AnalyticsStats>({
    promptsScanned: 0,
    sensitiveFindings: 0,
    blockedPrompts: 0,
    redactedPrompts: 0,
    anonymizedPrompts: 0,
    tokenizedPrompts: 0,
    lastUpdated: new Date().toISOString(),
    categoryBreakdown: {},
  });

  useEffect(() => {
    storageManager.getConfig().then(setConfig);
    storageManager.getStats().then((s) => {
      setStats(s);
    });
  }, []);

  const toggleFirewall = async () => {
    const updated = { ...config, enabled: !config.enabled };
    setConfig(updated);
    await storageManager.saveConfig(updated);
  };

  const setProtectionMode = async (mode: ProtectionMode) => {
    const updated = { ...config, protectionMode: mode };
    setConfig(updated);
    await storageManager.saveConfig(updated);
  };

  const openDashboard = () => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open("dashboard.html", "_blank");
    }
  };

  return (
    <div className="popup-card">
      <div>
        {/* Topbar */}
        <div className="popup-topbar">
          <div className="popup-brand">
            <div className="popup-logo-icon">
              <Lock size={20} />
            </div>
            <div>
              <div className="popup-brand-name">AI Privacy Firewall</div>
              <div className="popup-brand-tag">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }}></span>
                Local Security Active
              </div>
            </div>
          </div>

          <button
            onClick={toggleFirewall}
            className={`popup-status-pill ${config.enabled ? "active" : "inactive"}`}
          >
            {config.enabled ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            {config.enabled ? "Active" : "Disabled"}
          </button>
        </div>

        {/* Hero Status Banner */}
        <div className="hero-banner">
          <div className="hero-banner-top">
            <span className="hero-title">Protection Status</span>
            <span className="hero-tag">Before-Send Interceptor</span>
          </div>
          <div className="hero-status-val">
            <ShieldCheck size={16} color="#059669" />
            <span>SAFE (Low Risk 0-19)</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="popup-stats-section">
          <div className="popup-section-label">
            <Activity size={14} color="#0284c7" /> Protection Analytics
          </div>
          <div className="popup-grid">
            <div className="popup-grid-card">
              <div className="popup-card-lbl">Prompts Scanned</div>
              <div className="popup-card-num">{stats.promptsScanned}</div>
            </div>
            <div className="popup-grid-card">
              <div className="popup-card-lbl">Sensitive Findings</div>
              <div className="popup-card-num" style={{ color: "#f59e0b" }}>{stats.sensitiveFindings}</div>
            </div>
            <div className="popup-grid-card">
              <div className="popup-card-lbl">Blocked Prompts</div>
              <div className="popup-card-num" style={{ color: "#ef4444" }}>{stats.blockedPrompts}</div>
            </div>
            <div className="popup-grid-card">
              <div className="popup-card-lbl">Redacted Prompts</div>
              <div className="popup-card-num" style={{ color: "#0284c7" }}>{stats.redactedPrompts}</div>
            </div>
          </div>
        </div>

        {/* Segmented Protection Mode Bar */}
        <div className="popup-segmented-mode">
          <label className="segmented-label">Protection Policy Mode</label>
          <div className="segmented-bar">
            {(["strict", "balanced", "permissive"] as ProtectionMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setProtectionMode(mode)}
                className={`segmented-btn ${config.protectionMode === mode ? "active" : ""}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="popup-actions">
        <button onClick={openDashboard} className="btn-main-sky">
          <ExternalLink size={14} /> Open Command Center
        </button>
        <button onClick={openDashboard} className="btn-sub-slate">
          <Settings size={14} /> Settings
        </button>
      </div>
    </div>
  );
};
