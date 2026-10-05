import { SensitiveFinding } from "../../types/finding";

export interface ModalActionOptions {
  onProtectAndSend: () => void;
  onSendAnyway?: () => void;
  onCancel: () => void;
}

export function createShadowInterceptModal(
  riskScore: number,
  masterAction: string,
  findings: SensitiveFinding[],
  rawPrompt: string,
  safePrompt: string,
  options: ModalActionOptions
): HTMLElement {
  // Create container host
  const host = document.createElement("div");
  host.id = "ai-privacy-firewall-overlay-host";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  host.style.width = "100vw";
  host.style.height = "100vh";
  host.style.zIndex = "999999";
  host.style.display = "flex";
  host.style.alignItems = "center";
  host.style.justifyContent = "center";
  host.style.pointerEvents = "auto";

  const shadow = host.attachShadow({ mode: "open" });

  const isBlocked = masterAction === "BLOCK";
  const badgeColor = isBlocked ? "#ef4444" : riskScore >= 60 ? "#f59e0b" : "#0284c7";
  const badgeBg = isBlocked ? "#fef2f2" : riskScore >= 60 ? "#fffbebfb" : "#f0f9ff";
  const badgeBorder = isBlocked ? "#fecaca" : riskScore >= 60 ? "#fde68a" : "#bae6fd";
  
  const titleText = isBlocked ? "PROMPT BLOCKED" : "SENSITIVE DATA DETECTED";

  // Clean SVG Icons for Header & Findings
  const headerIconSvg = isBlocked
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

  const itemDotSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444" stroke="none"><circle cx="12" cy="12" r="10"/></svg>`;

  const findingsListHtml = findings
    .map(
      (f) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 8px;">
        <span style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #0f172a; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;">
          ${itemDotSvg} ${f.type} (${f.category})
        </span>
        <span style="font-size: 11px; font-weight: 800; background: ${f.severity === 'critical' ? '#fef2f2' : '#fffbebfb'}; color: ${f.severity === 'critical' ? '#ef4444' : '#f59e0b'}; border: 1px solid ${f.severity === 'critical' ? '#fecaca' : '#fde68a'}; padding: 3px 10px; border-radius: 20px;">${f.severity.toUpperCase()}</span>
      </div>
    `
    )
    .join("");

  shadow.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');

      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(8px);
      }
      .modal {
        position: relative;
        width: 100%;
        max-width: 540px;
        background: #ffffff;
        border: 1px solid #bae6fd;
        border-radius: 20px;
        box-shadow: 0 25px 50px -12px rgba(2, 132, 199, 0.25);
        padding: 28px;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #0f172a;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .title-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .badge {
        font-size: 12px;
        font-weight: 800;
        padding: 5px 14px;
        border-radius: 20px;
        background: ${badgeBg};
        color: ${badgeColor};
        border: 1px solid ${badgeBorder};
      }
      .title {
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .risk-bar-bg {
        height: 6px;
        background: #f1f5f9;
        border-radius: 3px;
        overflow: hidden;
        margin: 14px 0 16px 0;
      }
      .risk-bar-fill {
        height: 100%;
        width: ${riskScore}%;
        background: ${badgeColor};
        transition: width 0.3s ease;
      }
      .findings-container {
        max-height: 160px;
        overflow-y: auto;
        margin: 14px 0 18px 0;
        padding-right: 4px;
      }

      /* Custom Modern Webkit Scrollbar */
      .findings-container::-webkit-scrollbar,
      .preview-box::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      .findings-container::-webkit-scrollbar-track,
      .preview-box::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
      }
      .findings-container::-webkit-scrollbar-thumb,
      .preview-box::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      .findings-container::-webkit-scrollbar-thumb:hover,
      .preview-box::-webkit-scrollbar-thumb:hover {
        background: #0284c7;
      }

      .preview-title {
        font-size: 11px;
        font-weight: 800;
        color: #0284c7;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .preview-box {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 12px;
        padding: 12px 16px;
        font-size: 12px;
        font-family: 'JetBrains Mono', monospace;
        color: #0369a1;
        max-height: 95px;
        overflow-y: auto;
        margin-bottom: 24px;
        white-space: pre-wrap;
      }
      .actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      .btn {
        padding: 11px 20px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
        font-family: inherit;
      }
      .btn-primary {
        background: #0284c7;
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
      }
      .btn-primary:hover {
        background: #0369a1;
      }
      .btn-secondary {
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
      }
      .btn-secondary:hover {
        background: #e2e8f0;
      }
      .btn-danger {
        background: #fef2f2;
        color: #ef4444;
        border: 1px solid #fecaca;
      }
      .btn-danger:hover {
        background: #fee2e2;
      }
    </style>

    <div class="backdrop"></div>
    <div class="modal">
      <div class="header">
        <div class="title-group">
          ${headerIconSvg}
          <h2 class="title">${titleText}</h2>
        </div>
        <span class="badge">Risk: ${riskScore} / 100</span>
      </div>

      <div class="risk-bar-bg">
        <div class="risk-bar-fill"></div>
      </div>

      <p style="font-size: 13px; color: #64748b; margin: 4px 0 14px 0; line-height: 1.4;">
        ${
          isBlocked
            ? "Prompt blocked because it contains high-risk credentials/sensitive data."
            : "Sensitive values will be redacted before sending to the AI provider."
        }
      </p>

      <div class="findings-container">
        ${findingsListHtml}
      </div>

      <div class="preview-title">Sanitized Safe Prompt Preview</div>
      <div class="preview-box">${safePrompt}</div>

      <div class="actions">
        <button id="btn-cancel" class="btn btn-secondary">Cancel</button>
        ${
          !isBlocked && options.onSendAnyway
            ? `<button id="btn-send-anyway" class="btn btn-danger">Send Anyway</button>`
            : ""
        }
        <button id="btn-protect" class="btn btn-primary">Protect & Send</button>
      </div>
    </div>
  `;

  // Attach event handlers inside Shadow DOM
  const btnProtect = shadow.getElementById("btn-protect");
  const btnCancel = shadow.getElementById("btn-cancel");
  const btnSendAnyway = shadow.getElementById("btn-send-anyway");

  btnProtect?.addEventListener("click", () => {
    host.remove();
    options.onProtectAndSend();
  });

  btnCancel?.addEventListener("click", () => {
    host.remove();
    options.onCancel();
  });

  btnSendAnyway?.addEventListener("click", () => {
    host.remove();
    if (options.onSendAnyway) options.onSendAnyway();
  });

  return host;
}
