# FB AdBlocker & Clean Feed (Open Source)

A privacy-focused, zero-telemetry, fully offline open-source browser extension that blocks Facebook ads, Reels, sponsored posts, suggested content, and feed distractions.

Forked and rewritten from an abandoned extension: all dead remote servers, telemetry tracking, and paywall restrictions have been stripped out. All features are 100% free, unlocked, and operate completely client-side.

---

## Features (All Unlocked)

- **🙈 Remove Reels:** Blocks Facebook Reels from feed streams, top feed trays, and standalone player pages.
- **😽 Allow Friend's Reels:** Optional toggle to permit Reels created by your actual friends while blocking recommended algorithmic Reels.
- **🏥 Remove Sponsored:** Filters out sponsored ad units from feeds, right rail, and sidebars.
- **🔍 Custom Keyword Blocker (New):** Collapse or hide any feed post containing your custom keywords (politics, spoilers, specific brands).
- **🛡️ Resilient DOM Fallback (New):** Hybrid engine pairing React/Relay component interception with a live DOM observer and CSS guard to survive Facebook UI updates.
- **💾 Backup & Restore (New):** Export your custom keywords and toggle configuration to JSON, or restore on any machine.
- **🤰 Remove Suggested For You:** Removes algorithmic suggestions, suggested pages, and recommendation cards.
- **😷 Remove Groups You Might Like:** Hides suggested Facebook groups.
- **🔞 Remove PYMK:** Hides "People You May Know" horizontal scrollers and grid panels.
- **🚫 Remove Marketplace Ads:** Strips sponsored listings inside Facebook Marketplace.
- **🔎 Remove Search Ads:** Blocks sponsored entries from Facebook search results.
- **😵 Remove Stories:** Removes Facebook Stories tray.
- **📆 Remove Birthday Reminders:** Hides right-side birthday reminder blocks.
- **🔔 Remove Notifications:** Blocks floating bottom-left toast alerts.
- **👍🏼 Clean Mode:** Hides replacement notices for a clean feed appearance.

---

## Installation (Unpacked Extension)

Works on any Chromium-based browser (**Google Chrome**, **Brave**, **Microsoft Edge**, **Opera**, **Vivaldi**, **Arc**):

1. Open your browser's extension manager:
   - **Chrome:** `chrome://extensions`
   - **Brave:** `brave://extensions`
   - **Edge:** `edge://extensions`
2. Enable **Developer mode** toggle in the top-right corner.
3. Click the **Load unpacked** button.
4. Select this folder:
   ```
   c:\Users\Mohamed Nour\Documents\antigravity\lucid-maxwell
   ```
5. Navigate to [facebook.com](https://www.facebook.com) and click the extension icon to configure your blocking preferences.

---

## Technical Architecture

- **Manifest V3:** Modern MV3 background service worker (`service-worker-loader.js`).
- **Main World Injection:** Injects `injects/proxy.js` into Facebook's React Comet frontend, hooking into `window.__d` and the Relay store for native client-side element removal before rendering.
- **Declarative Net Request:** Uses `rules_1.json` to safely relax strict CSP headers so component overrides can hook the DOM without breaking page functionality.
- **Resilient Fallback Engine:** `injects/fallback.js` and `injects/fallback.css` observe feed mutations to catch any ad units that evade React-level hooks.
- **100% Offline & Local:** Uses `chrome.storage.local`. No external APIs, no tracking servers, no telemetry, no subscription verification.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
