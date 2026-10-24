/**
 * FB AdBlocker & Clean Feed - Popup Enhancements
 * Apple Design & Fluid Touch (macOS Sequoia HIG)
 */

(function () {
    const lucideSettings = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:7px;"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>';

    function refineUI() {
        // 1. Purge legacy promo links, "what's new" anchors, and old version labels
        const garbage = document.querySelectorAll(
            'a[href*="buymeacoffee"], .promo-exts, [class*="promo"], a[href*="what"], span[style*="color: #999"], span[style*="color: rgb(153, 153, 153)"]'
        );
        garbage.forEach(el => el.closest('.ant-space-item')?.remove() || el.remove());

        // 2. Clear all inner texts from switches
        const switchInners = document.querySelectorAll('.ant-switch-inner, .ant-switch-inner-checked, .ant-switch-inner-unchecked');
        switchInners.forEach(el => el.remove());

        // 3. Inject Apple status pill under title in header
        const headerContainer = document.querySelector('.header .ant-space');
        if (headerContainer && !document.getElementById('ext-apple-status')) {
            const titleBlock = headerContainer.querySelector('div, span');
            if (titleBlock && !titleBlock.querySelector('.ext-status-pill')) {
                const statusPill = document.createElement('div');
                statusPill.id = 'ext-apple-status';
                statusPill.className = 'ext-status-pill';
                statusPill.innerHTML = '<span class="ext-status-dot"></span><span>Active Protection</span>';
                titleBlock.appendChild(statusPill);
            }
        }

        // 4. Mount sleek macOS glass options button
        if (!document.getElementById('ext-open-options-btn')) {
            const footer = document.createElement('div');
            footer.id = 'ext-open-options-btn';
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

    // Execute immediately and after React microtask settles
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            refineUI();
            setTimeout(refineUI, 100);
            setTimeout(refineUI, 300);
        });
    } else {
        refineUI();
        setTimeout(refineUI, 100);
        setTimeout(refineUI, 300);
    }
})();
