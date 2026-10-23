# FB AdBlocker & Clean Feed (Open Source)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![Privacy](https://img.shields.io/badge/Privacy-Zero%20Telemetry-brightgreen.svg)](README.md)

A privacy-focused, zero-telemetry, fully offline open-source browser extension that blocks Facebook ads, Reels, sponsored posts, suggested content, and feed distractions.

All features are 100% free, unlocked, client-side, and contain no remote servers, tracking, or telemetry.

---

## Features

- **🎬 Remove Reels:** Blocks Facebook Reels from feed streams, top feed trays, and standalone player pages.
- **👥 Allow Friends' Reels:** Optional toggle to permit Reels created by your actual friends while blocking algorithmic Reels.
- **🛡️ Remove Sponsored:** Filters out sponsored ad units from feeds, right rail, and sidebars.
- **🔍 Custom Keyword Blocker:** Collapse or hide any feed post containing your custom keywords (politics, spoilers, specific brands).
- **⚡ Resilient DOM Cleaner:** Real-time mutation observer engine (`injects/cleaner.js`) that purges ads and keywords dynamically even after Facebook DOM updates.
- **💾 Backup & Restore:** Export your custom keywords and toggle configuration to JSON, or restore them across devices.
- **📌 Remove Suggested For You:** Removes algorithmic suggestions, suggested pages, and recommendation cards.
- **👥 Remove Groups You Might Like:** Hides suggested Facebook groups.
- **🤝 Remove People You May Know (PYMK):** Hides horizontal scrollers and grid panels for suggested friends.
- **🛒 Remove Marketplace Ads:** Strips sponsored listings inside Facebook Marketplace.
- **🔎 Remove Search Ads:** Blocks sponsored entries from Facebook search results.
- **📖 Remove Stories:** Removes Facebook Stories tray.
- **🎂 Remove Birthday Reminders:** Hides right-side birthday reminder blocks.
- **🔔 Remove Notifications:** Blocks floating bottom-left toast alerts.
- **✨ Clean Mode:** Hides placeholder notices for a seamless, distraction-free feed.

---

## Installation (Unpacked Extension)

Works on any Chromium-based browser (**Google Chrome**, **Brave**, **Microsoft Edge**, **Opera**, **Vivaldi**, **Arc**):

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   ```
2. Open your browser's extension manager:
   - **Chrome:** `chrome://extensions`
   - **Brave:** `brave://extensions`
   - **Edge:** `edge://extensions`
3. Turn on the **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the repository root folder (the directory containing `manifest.json`).
6. Navigate to [facebook.com](https://www.facebook.com) and click the extension icon in your browser toolbar to customize settings.

---

## Permissions & Privacy

This extension runs completely client-side with zero network requests:

| Permission | Purpose |
| :--- | :--- |
| `storage` | Stores your toggle preferences, counter metrics, and custom keywords locally via `chrome.storage.local`. |
| `scripting` | Injects the cleaner script and Relay store hooks into facebook.com tabs. |
| `declarativeNetRequest` | Relaxes strict CSP headers locally on Facebook pages so hooks can operate without breaking React functionality. |

---

## Technical Architecture

- **Manifest V3:** Background service worker (`service-worker-loader.js`).
- **Main World Injection:** Hooks into `window.__d` and the Relay store (`injects/proxy.js`, `injects/vendors.js`, `injects/index.js`) to prevent ad and reel elements from rendering.
- **Isolated World Cleaner:** Real-time MutationObserver fallback (`injects/cleaner.js`) ensuring resilient DOM suppression and real-time counter tracking.
- **Declarative Net Request:** Uses `rules_1.json` for CSP adjustments.
- **100% Offline:** Zero external tracking, zero analytics, zero remote API calls.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
