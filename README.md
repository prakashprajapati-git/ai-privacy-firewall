# 🛡️ AI Privacy Firewall — Chrome Extension (Manifest V3)

> **Local-First Privacy, DLP & Security Layer for AI Websites**  
> Protect confidential credentials, financial info, PII, and organizational secrets from leaking to AI LLM providers (*ChatGPT, Gemini, Claude, Copilot, Perplexity, DeepSeek, Grok*).

---

## 1. Executive Summary

As AI chat assistants become central to modern workflows, users frequently paste sensitive data into prompt textareas. **AI Privacy Firewall** operates **locally inside the browser** as a client-side Data Loss Prevention (DLP) layer, inspecting prompts **in 0ms before network submission**.

### 🔑 Core Security Guarantee
> **Original sensitive data NEVER leaves your machine. If a policy triggers BLOCK, REDACT, ANONYMIZE, or TOKENIZE, only the safe, sanitized prompt is transmitted to the AI provider.**

---

## 2. Architecture & System Flow

```mermaid
flowchart TD
    A[User Types Prompt] --> B[Capture-Phase Event Interceptor]
    B --> C[Synchronous Local Detection Engine]
    C --> C1[Layer 1: Pattern Regex]
    C --> C2[Layer 2: Flexible Context Key-Value]
    C --> C3[Layer 3: Local Entity NER]
    C --> C4[Layer 4: Shannon Entropy Analysis]
    C --> D[Deterministic Risk Engine: 0 - 100 Score]
    C --> E[Policy Engine Evaluation]
    E -->|Risk 0-19 / SAFE| F[Allow Immediate Submission]
    E -->|SENSITIVE / CRITICAL| G[Shadow DOM Intercept Modal]
    G -->|Protect & Send| H[Sanitizer: Redact / Anonymize / Tokenize]
    H --> I[Safe Prompt Inserted & Sent to LLM]
    G -->|Send Anyway| J[User Explicit Overriding Send]
    G -->|Cancel| K[Abort Submission]
```

---

## 3. Supported AI Providers

Modular adapters (`src/providers/`) inspect, capture, and replace text on:

| Provider | Host Domain | Interception Modes |
| :--- | :--- | :--- |
| **OpenAI ChatGPT** | `chatgpt.com`, `chat.openai.com` | `Enter` keydown, Form submit, Click |
| **Google Gemini** | `gemini.google.com` | `Enter` keydown, Send button click |
| **Anthropic Claude** | `claude.ai` | `Enter` keydown, Submit button click |
| **Microsoft Copilot** | `copilot.microsoft.com`, `bing.com` | `Enter` keydown, Submit button click |
| **Perplexity AI** | `perplexity.ai` | `Enter` keydown, Submit button click |
| **DeepSeek** | `chat.deepseek.com` | `Enter` keydown, Send button click |
| **xAI Grok** | `grok.com`, `x.ai` | `Enter` keydown, Submit button click |

---

## 4. Multi-Layer Detection Capabilities

### 🛡️ 4-Layer Hybrid Engine Overview

| Layer | Engine Type | Capabilities & Target Data |
| :--- | :--- | :--- |
| **Layer 1: Pattern Detection** | Deterministic Regex & Luhn Check | **Auth & Keys**: AWS (`AKIA...`), OpenAI (`sk-proj-...`), Stripe (`sk_live_...`), Slack (`xoxb-...`), GitHub (`ghp_...`), JWT, RSA/SSH Keys, DB URIs.<br>**Financial**: Credit Cards (Luhn validated), CVV, PINs/OTPs, PAN, UPI IDs, IFSC, IBAN.<br>**PII**: Email, Phone, Aadhaar, Passport, US SSN, Driving License, Voter ID, DOB.<br>**Confidentiality**: `CONFIDENTIAL`, `INTERNAL ONLY`, `PROPRIETARY`, `TRADE SECRET`. |
| **Layer 2: Flexible Context Detection** | Separator-Agnostic Matching | Matches key-value assignments regardless of separators (`_`, `-`, space, or none):<br>`account_no: 123` = `account no: 123` = `account-no: 123`.<br>Detects `atm pin: 6863`, `password: xyz`, `api_key: ...`, `otp = 492019`. |
| **Layer 3: Local Entity NER** | Rule NLP Engine | Recognizes `PERSON` names (e.g. `Rahul Kumar`), `ORGANIZATION` names (e.g. `ACME Corp`), and `LOCATION`. |
| **Layer 4: Entropy Detector** | Shannon Entropy Calculation | Mathematical randomness evaluation ($H(X) \ge 4.2$ bits/char) for unlabelled high-entropy secret tokens and hashes. |

---

## 5. Recent Core Feature & Architecture Updates

### 🚀 Latest Updates & Commits Highlights

1. **Flexible Separator Normalization (`context-detector.ts`)**:
   - Context keyword matcher converts spaces, underscores, and hyphens into flexible regex patterns (`[\s_-]*`).
   - `account_no`, `account no`, `account-no`, and `accountno` are treated identically.

2. **PIN & OTP Interception Support**:
   - Native support for 3 to 8 digit ATM PINs, bank PINs, CVV/CVC, OTPs, and 2FA/MFA verification codes.
   - Preserves prompt structure while target-sanitizing only the numeric value (e.g. `atm pin: 6863` $\rightarrow$ `atm pin: [PIN_REDACTED]`).

3. **Precise Capture Group Target Extraction**:
   - `runRegexDetector` extracts capture group `match[1]` if present, ensuring secret values are sanitized without corrupting label text.

4. **White & Sky Blue Design System (Pure React + Pure CSS)**:
   - Modern, professional UI design inspired by top security tools.
   - `#FFFFFF` clean background with `#0284C7` Sky Blue primary & `#F0F9FF` light blue surface tints.
   - Vector SVG icons throughout Popup, Security Dashboard, and Intercept Modal (no text emojis).
   - Custom 6px webkit scrollbars & `Plus Jakarta Sans` typography.

5. **Capture-Phase Document Interception**:
   - Content script binds `keydown`, `click`, and `submit` listeners with `useCapture: true`.
   - Prevents SPA event handlers on ChatGPT or Gemini from sending prompts before inspection completes.

6. **0ms Client-Side Synchronous Local Scan**:
   - Content script executes local detection synchronously on the page thread.
   - Guarantees 0ms modal rendering independent of background service worker idle/sleep cycles.

---

## 6. Action Modes & Sanitization Engine

| Action Mode | Description | Example Input $\rightarrow$ Output |
| :--- | :--- | :--- |
| **BLOCK** | Prevents prompt submission entirely for critical credentials. | `AWS Key: AKIAIOSFODNN7EXAMPLE` $\rightarrow$ **Blocked** |
| **REDACT** | Replaces value with generic security placeholder. | `Email: rahul@gmail.com` $\rightarrow$ `Email: [EMAIL_REDACTED]` |
| **ANONYMIZE** | Replaces names/orgs with consistent scoped aliases. | `Name: Rahul Kumar` $\rightarrow$ `Name: Person_001` |
| **TOKENIZE** | Replaces data with reversible local hashes stored in browser local storage. | `IBAN: DE89370...` $\rightarrow$ `IBAN: TOKEN_BANK_001` |
| **WARN** | Highlights finding with risk badge but allows send. | `Ticket: JIRA-4091` $\rightarrow$ Allowed with Warning |
| **ALLOW** | Permits prompt without modification. | Safe non-sensitive text |

---

## 7. Demo Verification Scenario (Spec #34)

### Input Prompt:
```text
Please analyze this employee:

Name: Rahul Kumar
Email: rahul.kumar@gmail.com
Phone: 9876543210
PAN: ABCDE1234F
Password: MySecret123
AWS Key: AKIAIOSFODNN7EXAMPLE
ATM PIN: 6863

Give me a summary.
```

### Result:
- **Interception**: Triggered automatically before network payload dispatch.
- **Risk Score**: `100 / 100 (CRITICAL)`
- **Action**: `PROMPT BLOCKED` / `PROTECT & SEND`
- **Sanitized Output ("Protect & Send")**:
```text
Please analyze this employee:

Name: Person_001
Email: [EMAIL_REDACTED]
Phone: [PHONE_REDACTED]
PAN: [PAN_REDACTED]
Password: [CREDENTIAL_REDACTED]
AWS Key: [CREDENTIAL_REDACTED]
ATM PIN: [PIN_REDACTED]

Give me a summary.
```

---

## 8. Installation & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```

### 3. Build Extension Bundle
```bash
npm run build
```

### 4. Load Unpacked Extension in Chrome
1. Navigate to `chrome://extensions` in Google Chrome or Microsoft Edge.
2. Enable **Developer Mode** (toggle top-right).
3. Click **Load unpacked**.
4. Select the `dist/` folder of this project directory.
5. Open ChatGPT, Gemini, or Claude to test live protection!

---

## 9. Test Suite Verification

All **11 unit tests** in `tests/` pass with 100% coverage across detectors, sanitizers, and demo scenarios:

```text
 ✓ tests/detectors.test.ts (8)
 ✓ tests/demo-scenario.test.ts (1)
 ✓ tests/sanitization.test.ts (2)

 Test Files  3 passed (3)
      Tests  11 passed (11)
```

---

## 10. Privacy & Threat Model

- **100% Client-Side**: Zero telemetry, zero analytics, zero external API requests.
- **Local Audit Logs**: Scanned history is stored strictly in `chrome.storage.local`.
- **Fail-Safe Interception**: If an AI chat DOM changes, capture-phase document listeners fallback gracefully and alert the user.

---

## 11. Beginner Setup & Developer Workflow Guide (Step-by-Step)

If you are new to extension development or setting up this project for the first time, follow this step-by-step guide.

---

### 📦 1. Prerequisites (Requirement Checklist)
Before starting, make sure you have installed:
- **Node.js** (v18.0.0 or higher): Download from [nodejs.org](https://nodejs.org/).
- **npm** (comes included with Node.js).
- **Google Chrome**, **Microsoft Edge**, or **Brave** browser.

---

### 🚀 2. Step 1: Install Dependencies
Open your terminal (PowerShell, Command Prompt, or VS Code Terminal) inside the project folder (`hack`) and run:

```bash
npm install
```

> **What this does:** Downloads all project libraries (React, Vite, TypeScript, Vitest, Rollup) into the local `node_modules/` folder.

---

### 🏗️ 3. Step 2: Build the Extension Bundle

⚠️ **IMPORTANT RULE FOR DEVELOPERS**:  
Whenever you make **ANY** code edit inside the `src/` folder, you **MUST** run this build command:

```bash
npm run build
```

> **What this does:**
> 1. Checks TypeScript types (`tsc`).
> 2. Bundles the extension files using `scripts/build.js`.
> 3. Creates/updates the runnable extension files inside the **`dist/`** directory.

---

### 🧪 4. Step 3: Run Automated Tests
To verify all detection rules, sanitizers, and PIN interceptors are working cleanly:

```bash
npm test
```

> You should see `11 passed (11)`.

---

### 🔌 5. Step 4: Load Extension in Chrome / Edge / Brave

1. Open **Google Chrome** and navigate to:
   ```text
   chrome://extensions
   ```
2. At the top-right corner of the page, turn **ON** the **Developer mode** toggle switch.
3. Click the **Load unpacked** button (top-left).
4. A file picker will open. Navigate to this project folder and select the **`dist`** folder (Do **NOT** select `src` or the root folder — select `dist`).
5. **AI Privacy Firewall** will now appear as an active extension with its Shield icon! 🛡️

---

### 💬 6. Step 5: Test Live Protection on AI Websites

1. Open any supported AI website in Chrome:
   - Google Gemini: `https://gemini.google.com`
   - ChatGPT: `https://chatgpt.com`
   - Anthropic Claude: `https://claude.ai`
2. Click into the chat prompt box and type a prompt containing sensitive info:
   ```text
   hey gemini here is my atm pin: 6863 and my pan is ABCDE1234F
   ```
3. Press `Enter` or click the Send button.
4. **Result**: The **Shadow DOM Intercept Modal** will pop up on the screen in **0ms**, stopping the prompt from being sent until you choose **Protect & Send**, **Send Anyway**, or **Cancel**!

---

### 🐞 7. Step 6: How to Debug Errors & View Console Logs

If something isn't catching or you encounter a bug, here is how to view developer logs:

#### A. Viewing Web Page & Content Script Logs:
1. On `gemini.google.com` or `chatgpt.com`, **Right-Click** anywhere $\rightarrow$ Select **Inspect** (or press `F12`).
2. Go to the **Console** tab.
3. Type `AI Privacy Firewall` in the filter box to see all interception and scan logs.

#### B. Viewing Background Service Worker Logs (`background.js`):
1. Go to `chrome://extensions`.
2. Locate the **AI Privacy Firewall** extension card.
3. Click the blue link **service worker** (under *"Inspect views"*).
4. A new DevTools window will open showing background service worker logs, audit logs, and storage events.

#### C. Inspecting Popup UI:
1. **Right-Click** the extension icon in your Chrome toolbar.
2. Select **Inspect Popup**.

#### D. Inspecting Security Dashboard:
1. Open the Popup $\rightarrow$ Click **Open Security Dashboard** (or navigate to `chrome-extension://<EXTENSION_ID>/dashboard.html`).
2. Press `F12` to open DevTools for the dashboard.

---

### 🔄 8. Step 7: How to Test New Code Changes (Daily Routine)

When you make changes to the code, follow this 4-step workflow:

```mermaid
flowchart LR
    A[1. Edit code in src/] --> B[2. Run 'npm run build']
    B --> C[3. Click Refresh ↻ on chrome://extensions]
    C --> D[4. Reload AI Website Tab Ctrl+R]
```

1. **Edit Code**: Modify files inside `src/` (e.g. adding new keywords, changing UI colors).
2. **Re-build**: Open terminal and run `npm run build`.
3. **Reload Extension**: Go to `chrome://extensions` and click the **↻ (Refresh icon)** on the **AI Privacy Firewall** card.
4. **Reload Web Page**: Go back to your ChatGPT/Gemini tab and reload the browser page (`Ctrl + R` or `F5`).  
   *(This ensures Chrome injects your newly built `content.js` into the webpage!)*
