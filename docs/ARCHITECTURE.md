# Technical Architecture

This document describes how FB AdBlocker & Clean Feed works under the hood.

---

## 🏗️ Architecture Overview

Facebook is a dynamic single-page application built on **React Comet** and **Relay GraphQL**. Because Facebook obfuscates its class names and constantly updates DOM trees, this extension employs a **two-layer hybrid defense**:

```
                                  Facebook Tab
                                       │
     ┌─────────────────────────────────┴─────────────────────────────────┐
     │                                                                   │
     ▼                                                                   ▼
[Layer 1: Main World Hook]                              [Layer 2: Isolated Content Script]
  • injects/proxy.js                                      • injects/cleaner.js
  • injects/vendors.js                                    • MutationObserver on document
  • injects/index.js                                      • Multi-language aria-label matcher
  • Intercepts React Comet modules (__d)                 • Custom Keyword text analyzer
  • Prevents ad/reels rendering before DOM mount          • Catches dynamic mutations & updates counters
     │                                                                   │
     └─────────────────────────────────┬─────────────────────────────────┘
                                       │
                                       ▼
                       [chrome.storage.local Storage]
                                       ▲
                                       │
                        [Options & Popup Interface]
                          • src/pages/options/
                          • src/pages/popup/
```

---

## 📁 Key Files & Responsibilities

| File Path | Role |
| :--- | :--- |
| `manifest.json` | Manifest V3 configuration defining permissions, content scripts, and CSP modifications. |
| `service-worker-loader.js` | Entry point for the MV3 background service worker. |
| `rules_1.json` | Declarative Net Request rules that relax Facebook CSP headers to allow main-world hooking. |
| `injects/proxy.js` | Main-world script injected at `document_start` to intercept React module registrations. |
| `injects/index.js` | Main-world bridge connecting React Comet hooks to extension settings and statistics. |
| `injects/cleaner.js` | Isolated-world content script running a live `MutationObserver` to clean missed ads/reels and filter custom keywords. |
| `src/pages/options/` | Options page featuring Apple HIG aesthetics, statistics, feature switches, and keyword import/export. |
| `src/pages/popup/` | Quick popup toggle interface for enabling or disabling features on the fly. |

---

## 🛡️ Content Script Boundaries & Safety Rules

1. **Never hide the feed root:** Never set `display: none` on `div[role="feed"]` or parent containers. Always target individual articles (`div[role="article"]` or `div[data-pagelet^="FeedUnit_"]`).
2. **Context Invalidation Handling:** All content scripts must catch `Extension context invalidated` errors when the extension is reloaded or updated to prevent console spam.
3. **Storage Discipline:** All user toggles and custom keywords are stored in `chrome.storage.local`. No external endpoints are called.
