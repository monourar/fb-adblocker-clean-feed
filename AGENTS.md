# AGENTS.md — Instructions for AI Coding Assistants

This repository contains **FB AdBlocker & Clean Feed**, an open-source, privacy-first Chromium extension (Manifest V3) for Facebook.

When modifying or analyzing this codebase, AI agents MUST follow the operational boundaries, architecture rules, and validation steps below.

---

## 🎯 Architecture Summary

- **Type:** Chrome Manifest V3 Browser Extension.
- **Target Domain:** `https://*.facebook.com/*`, `https://facebook.com/*`.
- **Hybrid Interception Architecture:**
  1. **Main World Layer (`injects/proxy.js`, `injects/vendors.js`, `injects/index.js`):** Intercepts Facebook React Comet modules via `window.__d` and Relay store to remove elements prior to rendering.
  2. **Isolated World Layer (`injects/cleaner.js`):** Fallback `MutationObserver` catching dynamic DOM changes, ad units, Reels shelves, and filtering user custom keywords. Synchronizes blocked counts to `chrome.storage.local`.
  3. **UI Surfaces (`src/pages/options/`, `src/pages/popup/`):** Settings and quick-toggle popups styled with Apple Human Interface Guidelines (macOS Sequoia aesthetic).
  4. **Network / CSP (`rules_1.json`):** `declarativeNetRequest` rule adjusting CSP headers on Facebook main frame requests.

---

## ⛔ Strict Guardrails for AI

1. **Never Hide Feed Root:** Do NOT apply `display: none` or removal logic to `div[role="feed"]` or any parent container holding multiple posts. Doing so collapses the entire user feed. Always restrict selection to individual post units (`div[role="article"]` or `div[data-pagelet^="FeedUnit_"]`).
2. **Zero Telemetry / No External Calls:** Do NOT add analytics, remote logging, error reporting endpoints, or external network requests. All state and settings must reside in `chrome.storage.local`.
3. **Handle Context Invalidation:** Any content script registering event listeners or callbacks must gracefully handle extension context invalidation (`chrome.runtime.id` becoming undefined when the extension updates/reloads).
4. **Preserve Open-Source Free Model:** Do NOT reintroduce any paywalls, licensing keys, pro tiers, or affiliate links.

---

## 📁 Key File Map

```
├── manifest.json              # Extension manifest (MV3)
├── service-worker-loader.js   # Background service worker entry
├── rules_1.json               # DNR rules modifying CSP for script injection
├── injects/
│   ├── cleaner.js             # Isolated world live DOM observer & keyword blocker
│   ├── index.js               # Main world React component replacement & counter bridge
│   ├── proxy.js               # Main world React module hooks
│   └── vendors.js             # Main world bundle dependencies
├── src/
│   ├── assets/logo/           # App icons (16, 19, 32, 38, 48, 128px)
│   └── pages/
│       ├── options/           # Full settings page (keywords, backup/restore)
│       └── popup/             # Quick toggle popup
├── _locales/                  # Multi-language message manifests
└── docs/                      # User guide, architecture docs, and FAQ
```

---

## 🧪 Verification Commands

Always run syntax and schema verification before concluding an edit:

```bash
# Verify JavaScript syntax:
node -c injects/cleaner.js src/pages/options/settings_ext.js src/pages/popup/popup_ext.js

# Verify JSON schema validity:
node -e "JSON.parse(require('fs').readFileSync('manifest.json')); JSON.parse(require('fs').readFileSync('rules_1.json')); console.log('Valid JSON')"
```
