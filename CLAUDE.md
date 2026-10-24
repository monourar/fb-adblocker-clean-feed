# CLAUDE.md

Context guide for Claude Code and AI assistants working on FB AdBlocker & Clean Feed.

## Build & Test Commands
- **Syntax Check:** `node -c injects/cleaner.js src/pages/options/settings_ext.js src/pages/popup/popup_ext.js`
- **JSON Validation:** `node -e "JSON.parse(require('fs').readFileSync('manifest.json'))"`
- **Live Test:** Reload extension at `chrome://extensions` and refresh Facebook.

## Architecture Guidelines
- **Dual-Layer Engine:**
  - `injects/proxy.js` & `injects/index.js` hook React Comet (`window.__d`) in the Main World.
  - `injects/cleaner.js` monitors DOM mutations in the Isolated Content Script world.
- **Feed Container Safety:**
  - NEVER select or hide `div[role="feed"]`. Target ONLY individual `div[role="article"]` or `div[data-pagelet^="FeedUnit_"]`.
- **Privacy & Storage:**
  - All state belongs in `chrome.storage.local`.
  - Zero telemetry, zero analytics, zero external network requests.
- **UI Styling:**
  - Follow Apple Human Interface Guidelines (macOS Sequoia style, subtle borders, backdrop blurs, Lucide icons).
