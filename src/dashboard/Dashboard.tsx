import React, { useEffect, useState } from "react";
import {
  Compass,
  Music,
  Gamepad2,
  GraduationCap,
  Globe,
  Play,
  Users,
  Search,
  Mic,
  Headphones,
  Share2,
  CreditCard,
  Bell,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Lock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Sparkles,
  Sliders,
  Database,
  Terminal,
} from "lucide-react";
import { FirewallConfig, CategoryAction } from "../types/policy";
import { AuditLogEntry, AnalyticsStats } from "../types/storage";
import { SensitiveDataType } from "../types/finding";
import { storageManager } from "../storage/storage-manager";
import { DEFAULT_FIREWALL_CONFIG } from "../policy/default-policies";
import {
  VrArtwork,
  GamePlayArtwork,
  ArtBustArtwork,
  NftSpheresArtwork,
  SpirographHalo,
  FloatingBadgeAvatar,
} from "./art-assets";
import "./dashboard.css";

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "explore" | "logs" | "policies" | "providers" | "settings" | "simulator"
  >("explore");

  const [activeOrb, setActiveOrb] = useState<number>(3); // 3 is Compass / active
  const [config, setConfig] = useState<FirewallConfig>(DEFAULT_FIREWALL_CONFIG);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    promptsScanned: 1248,
    sensitiveFindings: 312,
    blockedPrompts: 48,
    redactedPrompts: 215,
    anonymizedPrompts: 49,
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
  const [micActive, setMicActive] = useState(true);
  const [showLiveFeed, setShowLiveFeed] = useState(false);

  // Live prompt simulator states
  const [testPrompt, setTestPrompt] = useState(
    "Please analyze this user: John Doe (SSN: 123-45-6789), api_key='sk-ant-live9874523' and credit card 4532-0123-4567-8910"
  );
  const [simResult, setSimResult] = useState<{
    sanitized: string;
    risk: number;
    detected: string[];
    action: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedConfig = await storageManager.getConfig();
    setConfig(loadedConfig);

    const loadedLogs = await storageManager.getAuditLogs();
    if (loadedLogs && loadedLogs.length > 0) {
      setLogs(loadedLogs);
    } else {
      // Provide default initial audit logs so the table looks rich
      setLogs([
        {
          id: "log-1",
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          provider: "ChatGPT",
          riskScore: 92,
          detectedCategories: ["AUTHENTICATION"],
          detectedTypes: ["AWS_KEY", "API_KEY"],
          actionTaken: "BLOCKED",
          findingsCount: 2,
        },
        {
          id: "log-2",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          provider: "Claude",
          riskScore: 78,
          detectedCategories: ["PERSONAL", "FINANCIAL"],
          detectedTypes: ["PHONE", "CREDIT_CARD"],
          actionTaken: "REDACTED",
          findingsCount: 2,
        },
        {
          id: "log-3",
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          provider: "Google Gemini",
          riskScore: 65,
          detectedCategories: ["PERSONAL"],
          detectedTypes: ["EMAIL", "PERSON"],
          actionTaken: "ANONYMIZED",
          findingsCount: 2,
        },
        {
          id: "log-4",
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          provider: "Copilot",
          riskScore: 88,
          detectedCategories: ["AUTHENTICATION"],
          detectedTypes: ["JWT", "ENTROPY_SECRET"],
          actionTaken: "BLOCKED",
          findingsCount: 2,
        },
      ]);
    }

    const loadedStats = await storageManager.getStats();
    if (loadedStats.promptsScanned > 0) {
      setStats(loadedStats);
    }
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

  const runSimulation = () => {
    // Quick demo simulation of detection engine
    const detected: string[] = [];
    let sanitized = testPrompt;
    let risk = 10;

    if (testPrompt.includes("SSN") || testPrompt.includes("123-45-6789")) {
      detected.push("SSN");
      sanitized = sanitized.replace(/123-45-6789/g, "[REDACTED_SSN]");
      risk += 35;
    }
    if (testPrompt.includes("sk-ant") || testPrompt.includes("api_key")) {
      detected.push("API_KEY");
      sanitized = sanitized.replace(/sk-ant-live9874523/g, "[BLOCKED_SECRET_KEY]");
      risk += 45;
    }
    if (testPrompt.includes("credit card") || testPrompt.includes("4532")) {
      detected.push("CREDIT_CARD");
      sanitized = sanitized.replace(/4532-0123-4567-8910/g, "[MASKED_CARD_XXXX]");
      risk += 30;
    }
    if (testPrompt.includes("John Doe")) {
      detected.push("PERSON");
      sanitized = sanitized.replace(/John Doe/g, "Candidate_Alpha");
      risk += 15;
    }

    const action = risk >= 80 ? "BLOCKED" : risk >= 40 ? "REDACTED" : "ALLOW";
    setSimResult({
      sanitized: action === "BLOCKED" ? "⛔ SUBMISSION BLOCKED (Critical secret keys detected)" : sanitized,
      risk: Math.min(risk, 99),
      detected,
      action,
    });
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actionTaken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.detectedTypes.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="desktop-app-wrapper">
      {/* Reference Header Label: "• Desktop UI Design App" */}
      <div className="desktop-title-badge">
        <div className="desktop-title-dot"></div>
        <div className="desktop-title-text">Desktop UI Design App</div>
      </div>

      {/* Main Window */}
      <div className="desktop-window">
        {/* =========================================================
            COLUMN 1: FAR-LEFT ACTIVITY DOCK / RAIL
            ========================================================= */}
        <aside className="activity-rail">
          {/* macOS Traffic Lights */}
          <div className="window-controls-dots">
            <span className="window-dot close" title="Close"></span>
            <span className="window-dot minimize" title="Minimize"></span>
            <span className="window-dot maximize" title="Maximize"></span>
          </div>

          {/* Brand Logo: DEMD */}
          <div
            className="rail-logo-badge"
            onClick={() => setActiveTab("explore")}
            title="DEMD — AI Privacy Firewall"
          >
            DEMD
          </div>

          {/* Vertical Icon Stack */}
          <div className="rail-icon-stack">
            {/* Orb 0: 3D Holographic Crystal */}
            <button
              onClick={() => { setActiveOrb(0); setActiveTab("explore"); }}
              className={`rail-orb-btn ${activeOrb === 0 ? "active-notch" : ""}`}
              title="Global Shield Orbit"
            >
              <div className="rail-orb-inner" style={{ background: "radial-gradient(circle at 35% 35%, #00f0ff 0%, #1f183a 100%)" }}>
                <Shield size={20} color="#ffffff" />
              </div>
            </button>

            {/* Orb 1: Dark Cosmic Orb */}
            <button
              onClick={() => { setActiveOrb(1); setActiveTab("logs"); }}
              className={`rail-orb-btn ${activeOrb === 1 ? "active-notch" : ""}`}
              title="Audit Logs"
            >
              <div className="rail-orb-inner" style={{ background: "radial-gradient(circle at 35% 35%, #ec4899 0%, #2e1065 100%)" }}>
                <Activity size={18} color="#ffffff" />
              </div>
            </button>

            {/* Orb 2: Prism Gemstone */}
            <button
              onClick={() => { setActiveOrb(2); setActiveTab("policies"); }}
              className={`rail-orb-btn ${activeOrb === 2 ? "active-notch" : ""}`}
              title="Category Policies"
            >
              <div className="rail-orb-inner" style={{ background: "radial-gradient(circle at 35% 35%, #f59e0b 0%, #31111d 100%)" }}>
                <Sliders size={18} color="#ffffff" />
              </div>
            </button>

            {/* Orb 3: Active Orb with Signature Cutout Notch */}
            <button
              onClick={() => { setActiveOrb(3); setActiveTab("explore"); }}
              className={`rail-orb-btn ${activeOrb === 3 ? "active-notch" : ""}`}
              title="Explore Command Center"
            >
              <div className="rail-orb-inner">
                <Compass size={22} color="#00f0ff" />
              </div>
            </button>

            {/* Orb 4: Add / Quick Actions */}
            <button
              onClick={() => setActiveTab("simulator")}
              className="rail-plus-btn"
              title="Open Live Threat Simulator"
            >
              <Plus size={18} />
            </button>
          </div>
        </aside>

        {/* =========================================================
            COLUMN 2: LEFT NAVIGATION SIDEBAR (EXPLORE MENU)
            ========================================================= */}
        <aside className="explore-sidebar">
          <div>
            <div className="explore-header-title">Explore</div>
            <nav className="explore-nav-list">
              <button
                onClick={() => { setActiveTab("explore"); setActiveOrb(3); }}
                className={`explore-nav-item ${activeTab === "explore" ? "active" : ""}`}
              >
                <div className="explore-nav-icon"><Compass size={17} /></div>
                <span>Home</span>
              </button>

              <button
                onClick={() => { setActiveTab("logs"); setActiveOrb(1); }}
                className={`explore-nav-item ${activeTab === "logs" ? "active" : ""}`}
              >
                <div className="explore-nav-icon"><Music size={17} /></div>
                <span>Music</span>
              </button>

              <button
                onClick={() => { setActiveTab("policies"); setActiveOrb(2); }}
                className={`explore-nav-item ${activeTab === "policies" ? "active" : ""}`}
              >
                <div className="explore-nav-icon"><Gamepad2 size={17} /></div>
                <span>Gaming</span>
              </button>

              <button
                onClick={() => setActiveTab("providers")}
                className={`explore-nav-item ${activeTab === "providers" ? "active" : ""}`}
              >
                <div className="explore-nav-icon"><GraduationCap size={17} /></div>
                <span>Education</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`explore-nav-item ${activeTab === "settings" ? "active" : ""}`}
              >
                <div className="explore-nav-icon"><Globe size={17} /></div>
                <span>Science & Tech</span>
              </button>

              <button
                onClick={() => setActiveTab("simulator")}
                className={`explore-nav-item ${activeTab === "simulator" ? "active" : ""}`}
              >
                <div className="explore-nav-icon"><Play size={17} /></div>
                <span>Entertainment</span>
              </button>

              <button
                onClick={() => { setActiveTab("explore"); setShowLiveFeed(!showLiveFeed); }}
                className={`explore-nav-item ${showLiveFeed ? "active" : ""}`}
              >
                <div className="explore-nav-icon"><Users size={17} /></div>
                <span>Student Hubs</span>
              </button>
            </nav>
          </div>

          {/* Bottom Sidebar: Animated Soundwave & User Strip */}
          <div className="sidebar-bottom-zone">
            {/* Glowing Neon Soundwave Visualizer */}
            <div className="soundwave-visualizer" title="Real-time Prompt Packet Interception Frequency">
              <div className="soundwave-bars">
                {[40, 65, 85, 30, 95, 70, 45, 100, 60, 80, 50, 90, 35, 75, 55, 88, 42, 68, 92, 38].map((h, i) => (
                  <div
                    key={i}
                    className="soundwave-bar"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${(i * 0.08).toFixed(2)}s`,
                      animationDuration: `${1.2 + (i % 4) * 0.2}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* User Mini Control Bar */}
            <div className="user-mini-bar">
              <div className="user-mini-left" onClick={() => setActiveTab("settings")}>
                <div className="user-mini-avatar-wrap">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="avatar"
                    className="user-mini-avatar"
                  />
                  <div className="user-mini-status"></div>
                </div>
                <div className="user-mini-name">sunset186</div>
              </div>

              <div className="user-mini-actions">
                <button
                  onClick={() => setMicActive(!micActive)}
                  className="mic-pill-btn"
                  title={micActive ? "Mic Guard Active" : "Mic Muted"}
                  style={{
                    background: micActive
                      ? "radial-gradient(circle at 30% 30%, #00e1ff 0%, #0077b6 100%)"
                      : "rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <Mic size={14} />
                </button>
                <button className="icon-subtle-btn" title="Headphone Stream">
                  <Headphones size={15} />
                </button>
                <button className="icon-subtle-btn" title="Live Broadcast">
                  <Share2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================================
            COLUMN 3: CENTER MAIN WORKSPACE
            ========================================================= */}
        <main className="main-workspace">
          {/* Top Centered Search Bar */}
          <div className="top-search-container">
            <div className="top-search-pill">
              <Search size={15} className="top-search-icon" />
              <input
                type="text"
                placeholder="Explore"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="top-search-input"
              />
            </div>
          </div>

          {/* TAB 1: EXPLORE / HOME (EXACT MATCH TO REFERENCE IMAGE) */}
          {activeTab === "explore" && (
            <div>
              {/* Cosmic Aurora Hero Banner */}
              <div className="hero-banner-demd">
                <div className="hero-waves-bg"></div>
                <div className="hero-content">
                  <h1 className="hero-title-main">Find Your Community on Demd</h1>
                  <div className="hero-badge-pill">
                    <ShieldCheck size={13} color="#00f0ff" />
                    <span>AI Privacy Firewall Active • 100% Local DOM Interception</span>
                  </div>
                </div>
              </div>

              {/* Section 1: Featured Community */}
              <div className="section-header-row">
                <h2 className="section-heading-title">Featured Community</h2>
                <button
                  onClick={() => setActiveTab("policies")}
                  className="section-see-all-link"
                >
                  See all
                </button>
              </div>

              <div className="featured-grid-2">
                {/* Card 1: Virtual Reality */}
                <div
                  className="featured-card"
                  onClick={() => setActiveTab("policies")}
                >
                  <div className="featured-art-cover">
                    <VrArtwork />
                  </div>
                  <div className="floating-circle-badge">
                    <FloatingBadgeAvatar type="avatar" />
                  </div>
                  <div className="featured-card-body">
                    <div>
                      <h3 className="card-title-lg">Virtual Reality</h3>
                      <p className="card-desc-sm">
                        A community for VR and novices alike, regular and friendly chat.
                      </p>
                    </div>
                    <div className="card-stats-footer">
                      <div className="card-stat-pill">
                        <span className="green-status-dot"></span>
                        <span>4,372 Online</span>
                      </div>
                      <div className="card-stat-pill">
                        <span>👥 405,186 Members</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Game Play */}
                <div
                  className="featured-card"
                  onClick={() => setActiveTab("simulator")}
                >
                  <div className="featured-art-cover">
                    <GamePlayArtwork />
                  </div>
                  <div className="floating-circle-badge purple-glow">
                    <FloatingBadgeAvatar type="controller" />
                  </div>
                  <div className="featured-card-body">
                    <div>
                      <h3 className="card-title-lg">Game Play</h3>
                      <p className="card-desc-sm">
                        Always a new challenge. Great place to make new friends.
                      </p>
                    </div>
                    <div className="card-stats-footer">
                      <div className="card-stat-pill">
                        <span className="green-status-dot"></span>
                        <span>15,372 Online</span>
                      </div>
                      <div className="card-stat-pill">
                        <span>👥 515,186 Members</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Popular Right Now */}
              <div className="section-header-row">
                <h2 className="section-heading-title">Popular Right Now</h2>
                <button
                  onClick={() => setActiveTab("providers")}
                  className="section-see-all-link"
                >
                  See all
                </button>
              </div>

              <div className="popular-grid-2">
                {/* Popular Card 1: 3D Art */}
                <div
                  className="popular-card"
                  onClick={() => setActiveTab("providers")}
                >
                  <div className="popular-art-left">
                    <ArtBustArtwork />
                  </div>
                  <div className="floating-split-badge">
                    <FloatingBadgeAvatar type="statue" />
                  </div>
                  <div className="popular-card-right">
                    <div>
                      <h3 className="card-title-lg">3D Art</h3>
                      <p className="card-desc-sm">A great place to discuss art.</p>
                    </div>
                    <div className="card-stats-footer">
                      <div className="card-stat-pill">
                        <span>👥 715,186 Members</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Popular Card 2: NFT */}
                <div
                  className="popular-card"
                  onClick={() => setActiveTab("providers")}
                >
                  <div className="popular-art-left">
                    <NftSpheresArtwork />
                  </div>
                  <div className="floating-split-badge" style={{ borderColor: "#c084fc" }}>
                    <FloatingBadgeAvatar type="nft" />
                  </div>
                  <div className="popular-card-right">
                    <div>
                      <h3 className="card-title-lg">NFT</h3>
                      <p className="card-desc-sm">
                        An NFT community so that everyone can share their NFTs.
                      </p>
                    </div>
                    <div className="card-stats-footer">
                      <div className="card-stat-pill">
                        <span>👥 435,189 Members</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Recent Add */}
              <div className="section-header-row">
                <h2 className="section-heading-title">Recent Add</h2>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="section-see-all-link"
                >
                  See all
                </button>
              </div>

              <div className="recent-add-grid">
                <div
                  className="recent-add-card"
                  onClick={() => setActiveTab("settings")}
                  style={{
                    background: "radial-gradient(circle at 50% 50%, #701a75 0%, #1f113a 100%)",
                  }}
                >
                  <div className="recent-add-overlay">
                    <span className="recent-add-label">Projector Tech</span>
                  </div>
                </div>

                <div
                  className="recent-add-card"
                  onClick={() => setActiveTab("settings")}
                  style={{
                    background: "radial-gradient(circle at 50% 50%, #0369a1 0%, #0e1b38 100%)",
                  }}
                >
                  <div className="recent-add-overlay">
                    <span className="recent-add-label">Neural Brain</span>
                  </div>
                </div>

                <div
                  className="recent-add-card"
                  onClick={() => setActiveTab("settings")}
                  style={{
                    background: "radial-gradient(circle at 50% 50%, #9333ea 0%, #2e0854 100%)",
                  }}
                >
                  <div className="recent-add-overlay">
                    <span className="recent-add-label">Cosmic Nebulae</span>
                  </div>
                </div>

                <div
                  className="recent-add-card"
                  onClick={() => setActiveTab("settings")}
                  style={{
                    background: "radial-gradient(circle at 50% 50%, #059669 0%, #092e20 100%)",
                  }}
                >
                  <div className="recent-add-overlay">
                    <span className="recent-add-label">Quantum Grid</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT LOGS (MUSIC TAB) */}
          {activeTab === "logs" && (
            <div className="tab-content-container">
              <div className="section-header-row">
                <div>
                  <h2 className="tab-page-title">Security Audit Logs</h2>
                  <p className="tab-page-desc">
                    Real-time local event ledger. Prompts are sanitized on-device without cloud exfiltration.
                  </p>
                </div>
                <button
                  onClick={clearLogs}
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#f87171",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    padding: "8px 14px",
                    borderRadius: 10,
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

              {/* Metrics */}
              <div className="cyber-metrics-grid">
                <div className="cyber-metric-card">
                  <div className="cyber-metric-lbl">Prompts Intercepted</div>
                  <div className="cyber-metric-val">{stats.promptsScanned}</div>
                  <span className="cyber-metric-tag" style={{ color: "#34d399" }}>100% On-Device</span>
                </div>
                <div className="cyber-metric-card">
                  <div className="cyber-metric-lbl">Protected Submissions</div>
                  <div className="cyber-metric-val" style={{ color: "#38bdf8" }}>
                    {stats.redactedPrompts + stats.anonymizedPrompts}
                  </div>
                  <span className="cyber-metric-tag" style={{ color: "#38bdf8" }}>Sanitized</span>
                </div>
                <div className="cyber-metric-card">
                  <div className="cyber-metric-lbl">Blocked Secrets</div>
                  <div className="cyber-metric-val" style={{ color: "#f87171" }}>
                    {stats.blockedPrompts}
                  </div>
                  <span className="cyber-metric-tag" style={{ color: "#f87171" }}>Critical stopped</span>
                </div>
                <div className="cyber-metric-card">
                  <div className="cyber-metric-lbl">Sensitive Findings</div>
                  <div className="cyber-metric-val" style={{ color: "#fbbf24" }}>
                    {stats.sensitiveFindings}
                  </div>
                  <span className="cyber-metric-tag" style={{ color: "#fbbf24" }}>All Categories</span>
                </div>
              </div>

              {/* Logs Table */}
              <div className="dark-glass-table-wrap">
                <table className="dark-glass-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>AI Platform</th>
                      <th>Risk Score</th>
                      <th>Detected Findings</th>
                      <th>Action Taken</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#6b668d" }}>
                          No audit logs matching "{searchTerm}".
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontFamily: "monospace", color: "#94a3b8" }}>
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td style={{ fontWeight: 700, color: "#ffffff" }}>{log.provider}</td>
                          <td>
                            <span
                              style={{
                                fontWeight: 800,
                                padding: "3px 8px",
                                borderRadius: 6,
                                background:
                                  log.riskScore >= 80
                                    ? "rgba(239, 68, 68, 0.2)"
                                    : log.riskScore >= 40
                                    ? "rgba(245, 158, 11, 0.2)"
                                    : "rgba(16, 185, 129, 0.2)",
                                color:
                                  log.riskScore >= 80
                                    ? "#f87171"
                                    : log.riskScore >= 40
                                    ? "#fbbf24"
                                    : "#34d399",
                                border: `1px solid ${
                                  log.riskScore >= 80
                                    ? "rgba(239, 68, 68, 0.4)"
                                    : log.riskScore >= 40
                                    ? "rgba(245, 158, 11, 0.4)"
                                    : "rgba(16, 185, 129, 0.4)"
                                }`,
                              }}
                            >
                              {log.riskScore} / 100
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {log.detectedTypes.map((t) => (
                                <span
                                  key={t}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.08)",
                                    color: "#e2e8f0",
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    fontFamily: "monospace",
                                    fontSize: 10,
                                  }}
                                >
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
                                background:
                                  log.actionTaken === "BLOCKED"
                                    ? "linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)"
                                    : log.actionTaken === "REDACTED"
                                    ? "linear-gradient(90deg, #0284c7 0%, #0369a1 100%)"
                                    : "linear-gradient(90deg, #10b981 0%, #047857 100%)",
                                color: "#ffffff",
                                boxShadow:
                                  log.actionTaken === "BLOCKED"
                                    ? "0 0 10px rgba(239, 68, 68, 0.4)"
                                    : "0 0 10px rgba(2, 132, 199, 0.4)",
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

          {/* TAB 3: CATEGORY POLICIES (GAMING TAB) */}
          {activeTab === "policies" && (
            <div className="tab-content-container">
              <div className="tab-page-header">
                <h2 className="tab-page-title">Category Policies Configurator</h2>
                <p className="tab-page-desc">
                  Set automated action protocols (ALLOW, WARN, REDACT, ANONYMIZE, TOKENIZE, BLOCK) per data type.
                </p>
              </div>

              <div>
                {Object.entries(config.categoryPolicies).map(([type, action]) => (
                  <div key={type} className="policy-glass-row">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#ffffff" }}>{type}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Autonomous interceptor response
                      </div>
                    </div>
                    <select
                      value={action}
                      onChange={(e) =>
                        handlePolicyChange(type as SensitiveDataType, e.target.value as CategoryAction)
                      }
                      className="policy-glass-select"
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

          {/* TAB 4: AI PROVIDERS (EDUCATION TAB) */}
          {activeTab === "providers" && (
            <div className="tab-content-container">
              <div className="tab-page-header">
                <h2 className="tab-page-title">Protected AI Providers</h2>
                <p className="tab-page-desc">
                  Toggle before-send DOM interception and heuristic analysis per AI engine.
                </p>
              </div>

              <div className="provider-glass-grid">
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
                    <div key={provider.id} className="provider-glass-card">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#ffffff" }}>
                          {provider.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
                          {provider.domain}
                        </div>
                      </div>
                      <button
                        onClick={() => handleProviderToggle(provider.id)}
                        className={`neon-toggle-btn ${isEnabled ? "on" : ""}`}
                        title={isEnabled ? "Protected" : "Disabled"}
                      >
                        <div className="neon-toggle-knob"></div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY & ENGINE SETTINGS (SCIENCE & TECH) */}
          {activeTab === "settings" && (
            <div className="tab-content-container">
              <div className="tab-page-header">
                <h2 className="tab-page-title">Multi-Layer Local Detection Engine</h2>
                <p className="tab-page-desc">
                  All prompt analysis runs 100% locally on your machine with zero server roundtrips.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  {
                    title: "Layer 1: Deterministic Pattern Regex",
                    desc: "Recognizes Email, Phone, PAN, Aadhaar, Credit Cards, API Keys, JWT, SSH/RSA Keys.",
                    status: "ACTIVE",
                    color: "#34d399",
                  },
                  {
                    title: "Layer 2: Context-Aware Key Analysis",
                    desc: "Detects confidential key-value signatures: password=, secret=, bearer token, etc.",
                    status: "ACTIVE",
                    color: "#34d399",
                  },
                  {
                    title: "Layer 3: Local Named Entity Recognition",
                    desc: "Rule-based local NER for Person, Organization, Location entities.",
                    status: "ACTIVE",
                    color: "#34d399",
                  },
                  {
                    title: "Layer 4: Shannon Entropy Secret Analyzer",
                    desc: "Identifies high-randomness secret hashes (> 4.2 bits/character).",
                    status: "ACTIVE",
                    color: "#38bdf8",
                  },
                ].map((layer) => (
                  <div key={layer.title} className="policy-glass-row" style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <CheckCircle2 size={18} color="#00f0ff" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#ffffff" }}>{layer.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 2 }}>{layer.desc}</div>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 99,
                        background: "rgba(0, 240, 255, 0.15)",
                        border: "1px solid rgba(0, 240, 255, 0.4)",
                        color: "#00f0ff",
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {layer.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REAL-TIME SIMULATOR LAB (ENTERTAINMENT) */}
          {activeTab === "simulator" && (
            <div className="tab-content-container">
              <div className="tab-page-header">
                <h2 className="tab-page-title">Live Prompt Interception Simulator</h2>
                <p className="tab-page-desc">
                  Test prompt scrubbing, entropy scoring, and autonomous redaction in real time.
                </p>
              </div>

              <div style={{ background: "var(--bg-card)", padding: 20, borderRadius: 16, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--neon-cyan)", display: "block", marginBottom: 8 }}>
                  Raw User Prompt Input:
                </label>
                <textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(18, 15, 34, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: 12,
                    padding: 12,
                    color: "#ffffff",
                    fontSize: 13,
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                />

                <button
                  onClick={runSimulation}
                  style={{
                    marginTop: 12,
                    background: "linear-gradient(90deg, #00f0ff 0%, #8b5cf6 100%)",
                    border: "none",
                    color: "#ffffff",
                    padding: "9px 20px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 0 16px rgba(0, 240, 255, 0.4)",
                  }}
                >
                  <Terminal size={15} /> Execute Interception Analysis
                </button>

                {simResult && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <div style={{ display: "flex", gap: 16, marginBottom: 12, alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Risk Assessment: </span>
                        <strong style={{ color: simResult.risk >= 80 ? "#f87171" : "#38bdf8" }}>
                          {simResult.risk} / 100
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Action Protocol: </span>
                        <strong style={{ color: simResult.action === "BLOCKED" ? "#f87171" : "#34d399" }}>
                          {simResult.action}
                        </strong>
                      </div>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Detected Findings: </span>
                      {simResult.detected.map((t) => (
                        <span
                          key={t}
                          style={{
                            background: "rgba(236, 72, 153, 0.2)",
                            color: "#f472b6",
                            padding: "2px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            marginRight: 6,
                            fontFamily: "monospace",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                      Outbound Scrubbed Prompt:
                    </label>
                    <div
                      style={{
                        background: "rgba(10, 8, 20, 0.95)",
                        padding: 12,
                        borderRadius: 10,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#a7f3d0",
                        fontSize: 12,
                        fontFamily: "monospace",
                      }}
                    >
                      {simResult.sanitized}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* =========================================================
            COLUMN 4: RIGHT SIDEBAR (PROFILE, NEW MEMBERS, RECENT ACTIVITY)
            ========================================================= */}
        <aside className="right-sidebar">
          {/* Top Utility Action Icons */}
          <div className="right-top-icons">
            <button className="top-action-btn" title="Display Split Cards" onClick={() => setActiveTab("explore")}>
              <CreditCard size={18} />
            </button>
            <button className="top-action-btn" title="Security Alerts" onClick={() => setActiveTab("logs")}>
              <Bell size={18} />
              <div className="action-badge-dot"></div>
            </button>
            <button className="top-action-btn" title="Community Chats" onClick={() => setActiveTab("simulator")}>
              <MessageSquare size={18} />
            </button>
            <button className="top-action-btn" title="Settings" onClick={() => setActiveTab("settings")}>
              <Settings size={18} />
            </button>
          </div>

          {/* Profile Showcase with Spirograph Rainbow Orbit Halo */}
          <div className="profile-showcase-box">
            <div className="spirograph-avatar-wrap">
              <div className="spirograph-halo">
                <SpirographHalo />
              </div>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
                alt="Faye Marc Profile"
                className="profile-avatar-core"
              />
            </div>
            <div className="profile-name-lg">Faye Marc</div>
            <div className="profile-handle-sub">@sunset186</div>
          </div>

          {/* New Members Section */}
          <div className="right-sidebar-section">
            <div className="right-section-header">
              <span className="right-section-title">New Members</span>
              <button className="right-see-all-btn" onClick={() => setActiveTab("providers")}>
                See all
              </button>
            </div>

            <div className="member-list">
              {[
                { name: "Stella John", time: "5 min ago", ring: "purple-ring", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80" },
                { name: "Jason Chris", time: "5 min ago", ring: "blue-ring", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" },
                { name: "Jessa Hart", time: "5 min ago", ring: "gold-ring", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80" },
                { name: "Miley Chris", time: "5 min ago", ring: "pink-ring", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" },
              ].map((m) => (
                <div key={m.name} className="member-row" onClick={() => setActiveTab("explore")}>
                  <div className={`member-avatar-wrap ${m.ring}`}>
                    <img src={m.img} alt={m.name} className="member-avatar-img" />
                  </div>
                  <div className="member-info">
                    <span className="member-name">{m.name}</span>
                    <span className="member-time">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="right-sidebar-section">
            <div className="right-section-header">
              <span className="right-section-title">Recent Activity</span>
              <button className="right-see-all-btn" onClick={() => setActiveTab("logs")}>
                See all
              </button>
            </div>

            <div className="activity-list">
              {[
                {
                  author: "Maria Laval",
                  action: "invited you to a chanel",
                  time: "2 min ago",
                  img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
                },
                {
                  author: "Mark Morain",
                  action: "invited you to a chat",
                  time: "5 min ago",
                  img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
                },
                {
                  author: "Hola Spine",
                  action: "started following you",
                  time: "5 min ago",
                  img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=80&q=80",
                },
              ].map((act, i) => (
                <div key={i} className="activity-row" onClick={() => setActiveTab("logs")}>
                  <img src={act.img} alt={act.author} className="activity-avatar" />
                  <div className="activity-text-wrap">
                    <span className="activity-author">{act.author} </span>
                    <span>{act.action}</span>
                    <div className="activity-time">{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
