# Contributing to FB AdBlocker & Clean Feed

Thank you for your interest in helping improve FB AdBlocker & Clean Feed! We welcome all contributions, whether you are fixing a bug, adding translations, improving CSS styling, or updating Facebook ad selectors.

---

## 🧭 Core Principles

1. **Privacy First:** Never add telemetry, analytics, tracking pings, or external network requests. Everything must remain 100% offline and client-side.
2. **Zero Paywalls:** All features must remain free, unlocked, and open source forever.
3. **Resilience:** Facebook frequently changes its DOM structure. Any new blocking logic should be robust and fail gracefully without breaking the user's feed.

---

## 🛠️ Local Development Workflow

1. **Fork & Clone:**
   ```bash
   git clone https://github.com/<your-username>/fb-adblocker-clean-feed.git
   cd fb-adblocker-clean-feed
   ```
2. **Load in Browser:**
   - Go to `chrome://extensions`.
   - Enable **Developer mode**.
   - Click **Load unpacked** and select the repository root directory.
3. **Make Changes:**
   - Edit files in `injects/`, `src/pages/`, or `_locales/`.
4. **Test Live:**
   - Click the reload icon on the extension card in `chrome://extensions`.
   - Refresh [facebook.com](https://www.facebook.com) to test your changes.
5. **Verify Syntax:**
   - Before committing, verify JS and JSON syntax with Node:
     ```bash
     node -c injects/cleaner.js src/pages/options/settings_ext.js src/pages/popup/popup_ext.js
     node -e "JSON.parse(require('fs').readFileSync('manifest.json'))"
     ```

---

## 🌐 Adding New Languages / Translations

Facebook uses localized words for "Sponsored" (e.g., *Gesponsert*, *Patrocinado*, *Sponsorisé*, *مُموَّل*).
To add or improve keywords for your language:
1. Open [`injects/cleaner.js`](injects/cleaner.js).
2. Find the regex pattern in `isSponsored(post)`.
3. Add your language's sponsor label to the pattern.
4. Test on Facebook with that language active.

---

## 📬 Pull Request Guidelines

1. Create a feature branch: `git checkout -b feature/my-new-filter`.
2. Keep changes focused and atomic.
3. Write clear commit messages.
4. Submit your pull request to the `main` branch with a short description and test results.
