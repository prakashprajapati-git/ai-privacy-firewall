# 🛡️ AI Privacy Firewall — Architecture & Implementation Blueprint

## 1. Overview
**AI Privacy Firewall** is a production-grade, local-first Chrome Manifest V3 browser extension designed to prevent sensitive, confidential, PII, and security credentials from reaching AI websites (ChatGPT, Gemini, Claude, Copilot, Perplexity, DeepSeek, Grok).

```text
User Types Prompt
       ↓
Content Script Intercepts (Before-Send)
       ↓
Local Multi-Layer Detection Engine (Regex + Context + NER + Entropy)
       ↓
Risk Engine (0 - 100 Score) & Policy Evaluation
       ↓
┌──────────────┬───────────────┬──────────────┐
│ SAFE (0-19)  │ SENSITIVE     │ CRITICAL     │
│              │               │              │
│ Allow        │ Redact/Review │ Block        │
└──────────────┴───────────────┴──────────────┘
                       ↓
               Safe Sanitized Prompt
                       ↓
                  LLM Provider
```

---

## 2. Core Architecture Modules

### A. Provider Adapter Layer (`src/providers/`)
Standardized interface `AIProviderAdapter` for observing DOM changes, locating prompt textareas, intercepting submission events (Enter key / Send button), and replacing text safely.
- **ChatGPT Adapter**: `#prompt-textarea`, `button[data-testid="send-button"]`
- **Gemini Adapter**: `rich-textarea`, `.send-button-container`
- **Claude Adapter**: `div[contenteditable="true"]`, `button[aria-label*="Send"]`
- **Copilot Adapter**: `textarea`, `button[aria-label*="Submit"]`
- **Perplexity Adapter**: `textarea[placeholder*="Ask"]`, `button[aria-label*="Submit"]`
- **DeepSeek Adapter**: `#chat-input`, `.send-button`
- **Grok Adapter**: `textarea`, `button`

### B. Multi-Layer Detection Engine (`src/detection/`)
1. **Layer 1 (Pattern/Regex)**: Email, Phone, PAN, Aadhaar, Credit/Debit Cards, Passports, SSN, API Keys (OpenAI, AWS, GitHub, GitLab, GCP, Azure), Passwords, JWT, Connection Strings (MongoDB, PostgreSQL, MySQL, Redis), Private SSH/RSA Keys.
2. **Layer 2 (Context Detection)**: Detects keys/variable names near secret strings (`password:`, `secret=`, `api_key =`, `token:`).
3. **Layer 3 (Local Entity/NER)**: Local rule-based NLP for `PERSON`, `ORGANIZATION`, `LOCATION`.
4. **Layer 4 (Shannon Entropy Analysis)**: Calculates string entropy (>4.5 bits/char) to flag high-randomness secret hashes.

### C. Risk & Policy Engine (`src/risk/`, `src/policy/`)
- **Risk Score**: 0 to 100 based on severity and count.
- **Actions**: `ALLOW`, `WARN`, `REDACT`, `ANONYMIZE`, `TOKENIZE`, `BLOCK`.
- **Modes**: `STRICT`, `BALANCED` (Default), `PERMISSIVE`.

### D. Sanitization Engine (`src/sanitization/`)
- **Redaction**: Replaces with `[EMAIL_REDACTED]`, `[PAN_REDACTED]`, `[CREDENTIAL_REDACTED]`.
- **Anonymization**: Consistent prompt-scoped aliases (`Person_001`, `Organization_001`).
- **Tokenization**: Reversible local mapping (`TOKEN_EMAIL_001`).

### E. Security & Interception UI (`src/content/`)
- Intercepts submit events before the prompt reaches the AI server.
- Shadow DOM Warning/Block Modal prevents host page style leaking.
- Provides "Protect & Send", "Review", "Send Anyway" (if allowed), and "Cancel".

### F. Modern Extension UI (`src/popup/`, `src/dashboard/`)
- **Popup**: Firewall Status, Current Risk, Scanned/Blocked Stats, Quick Mode Toggle.
- **Dashboard**: Security Analytics, Audit Logs, Category Policy Configurator, Provider Toggles, Token Vault, Local-Only Settings.

---

## 3. Demo Test Scenario Verification
Validates exact scenario (#34):
- **Input**: Rahul Kumar, rahul.kumar@gmail.com, 9876543210, PAN: ABCDE1234F, Password: MySecret123, AWS Key: AKIAIOSFODNN7EXAMPLE.
- **Result**: Intercepted -> High Risk (100/100) -> Redacted/Anonymized to safe prompt before sending to LLM.
