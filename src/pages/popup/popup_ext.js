/**
 * FB AdBlocker & Clean Feed - Popup enhancements with Apple Design styling
 */

(function () {
    const lucideSettings = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:6px;"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>';

    function cleanPopup() {
        // Hide cross promo elements or dead store links if present
        const promoLinks = document.querySelectorAll('a[href*="buymeacoffee"], .promo-exts, [class*="promo"]');
        promoLinks.forEach(el => el.closest('.ant-space-item')?.remove() || el.remove());

        // Add direct link to options page with Apple Vibrant button styling
        if (!document.getElementById('ext-open-options-btn')) {
            const footer = document.createElement('div');
            footer.id = 'ext-open-options-btn';
            footer.style.textAlign = 'center';
            footer.innerHTML = `
                <a href="#" class="ext-options-action-btn">
                    ${lucideSettings}
                    <span>Keywords & Advanced Settings</span>
                </a>
            `;
            footer.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                if (chrome.runtime.openOptionsPage) {
                    chrome.runtime.openOptionsPage();
                } else {
                    window.open(chrome.runtime.getURL('src/pages/options/index.html'));
                }
            });
            document.body.appendChild(footer);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(cleanPopup, 150));
    } else {
        setTimeout(cleanPopup, 150);
    }
})();
