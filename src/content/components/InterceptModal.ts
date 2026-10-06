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
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 8px; transition: transform 0.2s ease, border-color 0.2s ease;">
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
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scaleUp {
        from {
          opacity: 0;
          transform: scale(0.92) translateY(14px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.72);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .modal {
        position: relative;
        width: 100%;
        max-width: 550px;
        background: #ffffff;
        border: 1px solid rgba(186, 230, 253, 0.8);
        border-radius: 22px;
        box-shadow: 0 25px 60px -12px rgba(2, 132, 199, 0.25), 0 0 0 1px rgba(2, 132, 199, 0.08), 0 30px 60px rgba(0, 0, 0, 0.16);
        padding: 28px;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #0f172a;
        box-sizing: border-box;
        animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
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
        transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .findings-container {
        max-height: 160px;
        overflow-y: auto;
        margin: 14px 0 16px 0;
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

      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }

      .preview-title {
        font-size: 11px;
        font-weight: 800;
        color: #0284c7;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .btn-copy {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #ffffff;
        border: 1px solid #bae6fd;
        color: #0284c7;
        padding: 4px 10px;
        border-radius: 7px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .btn-copy:hover {
        background: #e0f2fe;
        border-color: #7dd3fc;
        color: #0369a1;
        transform: translateY(-1px);
      }

      .btn-copy:active {
        transform: scale(0.96);
      }

      .btn-copy.copied {
        background: #ecfdf5;
        border-color: #a7f3d0;
        color: #059669;
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
        margin-bottom: 20px;
        white-space: pre-wrap;
        line-height: 1.5;
      }

      .footer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .keyboard-hints {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .kbd-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: #64748b;
        font-weight: 600;
      }

      .kbd-badge kbd {
        display: inline-block;
        padding: 2px 6px;
        font-size: 10px;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        line-height: 1.1;
        color: #334155;
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-bottom-width: 2px;
        border-radius: 4px;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
      }

      .actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .btn {
        padding: 10px 18px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: inherit;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .btn:active {
        transform: scale(0.97);
      }

      .btn-primary {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
      }

      .btn-primary:hover {
        background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(2, 132, 199, 0.45);
      }

      .btn-secondary {
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
      }

      .btn-secondary:hover {
        background: #e2e8f0;
        color: #1e293b;
      }

      .btn-danger {
        background: #fef2f2;
        color: #ef4444;
        border: 1px solid #fecaca;
      }

      .btn-danger:hover {
        background: #fee2e2;
        color: #dc2626;
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

      <div class="preview-header">
        <span class="preview-title">Sanitized Safe Prompt Preview</span>
        <button id="btn-copy-safe" class="btn-copy" type="button" title="Copy Sanitized Prompt">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span id="copy-btn-text">Copy Safe Prompt</span>
        </button>
      </div>
      <div class="preview-box">${safePrompt}</div>

      <div class="footer-row">
        <div class="keyboard-hints">
          <span class="kbd-badge"><kbd>Esc</kbd> Cancel</span>
          <span class="kbd-badge"><kbd>↵ Enter</kbd> Protect</span>
        </div>
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
    </div>
  `;

  // Attach event handlers inside Shadow DOM
  const btnProtect = shadow.getElementById("btn-protect");
  const btnCancel = shadow.getElementById("btn-cancel");
  const btnSendAnyway = shadow.getElementById("btn-send-anyway");
  const btnCopySafe = shadow.getElementById("btn-copy-safe");
  const copyBtnText = shadow.getElementById("copy-btn-text");

  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyDown);
    host.remove();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      cleanup();
      options.onCancel();
    } else if (e.key === "Enter" && !e.shiftKey) {
      cleanup();
      options.onProtectAndSend();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  btnProtect?.addEventListener("click", () => {
    cleanup();
    options.onProtectAndSend();
  });

  btnCancel?.addEventListener("click", () => {
    cleanup();
    options.onCancel();
  });

  btnSendAnyway?.addEventListener("click", () => {
    cleanup();
    if (options.onSendAnyway) options.onSendAnyway();
  });

  btnCopySafe?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(safePrompt);
      if (copyBtnText) copyBtnText.textContent = "Copied!";
      btnCopySafe.classList.add("copied");
      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = "Copy Safe Prompt";
        btnCopySafe.classList.remove("copied");
      }, 2000);
    } catch {
      // Fallback
    }
  });

  return host;
}
