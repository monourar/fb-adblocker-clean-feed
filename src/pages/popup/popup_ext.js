/**
 * FB AdBlocker & Clean Feed - Popup enhancements
 */

(function () {
    function cleanPopup() {
        // Hide cross promo elements or dead store links if present
        const promoLinks = document.querySelectorAll('a[href*="buymeacoffee"]');
        promoLinks.forEach(el => el.closest('.ant-space-item')?.remove() || el.remove());

        // Add direct link to options page if not already present
        if (!document.getElementById('ext-open-options-btn')) {
            const footer = document.createElement('div');
            footer.id = 'ext-open-options-btn';
            footer.style.textAlign = 'center';
            footer.style.padding = '8px 0';
            footer.style.borderTop = '1px solid rgba(0,0,0,0.06)';
            footer.style.marginTop = '8px';
            footer.innerHTML = `
                <a href="#" style="font-size:12px;color:#1877f2;text-decoration:none;font-weight:500;">
                    ⚙️ Keywords & Backup Settings
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
        document.addEventListener('DOMContentLoaded', () => setTimeout(cleanPopup, 300));
    } else {
        setTimeout(cleanPopup, 300);
    }
})();
