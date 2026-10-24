/**
 * FB AdBlocker & Clean Feed - Keyword Filtering & Backup/Restore UI
 * Apple Design System Integration (macOS Sequoia HIG)
 */

(function () {
    const lucideIcons = {
        filter: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-3px;margin-right:8px;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
        database: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-3px;margin-right:8px;"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>',
        plus: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:6px;"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>',
        download: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
        upload: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
        close: '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
        github: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>',
        star: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        bug: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:6px;"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>'
    };

    function init() {
        if (document.getElementById('ext-settings-card-root')) return;

        const card = document.createElement('div');
        card.id = 'ext-settings-card-root';
        card.className = 'ext-settings-card ant-card ant-card-bordered';
        card.innerHTML = `
            <div class="ant-card-head" style="border-bottom: 0.5px solid var(--separator); padding: 14px 20px;">
                <div class="ant-card-head-title" style="font-size: 15px; font-weight: 600; display: flex; align-items: center; letter-spacing: -0.018em;">
                    ${lucideIcons.filter}
                    <span>Custom Keyword Blocker</span>
                </div>
            </div>
            <div class="ant-card-body" style="padding: 18px 20px;">
                <p style="margin-top:0; color: var(--label-secondary); font-size: 13.5px; line-height: 1.45;">Automatically collapse any Facebook feed post containing these words or phrases (case-insensitive):</p>
                
                <div class="ext-keyword-input-row">
                    <input type="text" id="ext-kw-input" placeholder="e.g. spoilers, politics, crypto..." />
                    <button class="ext-btn ext-btn-primary" id="ext-kw-add-btn">${lucideIcons.plus}Add Keyword</button>
                </div>

                <div class="ext-tags-container" id="ext-tags-box"></div>

                <div style="border-top: 0.5px solid var(--separator); margin: 20px 0 16px 0; padding-top: 18px;">
                    <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600; display: flex; align-items: center; color: var(--label-primary); letter-spacing: -0.018em;">
                        ${lucideIcons.database}
                        <span>Backup & Restore Settings</span>
                    </h4>
                    <p style="color: var(--label-secondary); font-size: 13px; margin-bottom: 14px; line-height: 1.4;">Export your toggles and custom keywords to a JSON file or restore a previous configuration:</p>
                    
                    <div class="ext-actions-row">
                        <button class="ext-btn ext-btn-secondary" id="ext-export-btn">${lucideIcons.download}Export Settings</button>
                        <button class="ext-btn ext-btn-secondary" id="ext-import-btn">${lucideIcons.upload}Import Settings</button>
                        <input type="file" id="ext-import-file" accept=".json" style="display:none;" />
                        <span id="ext-status-msg" style="display:none;"></span>
                    </div>
                </div>
            </div>
        `;

        // Append GitHub Community Card below settings
        const githubCard = document.createElement('div');
        githubCard.id = 'ext-github-card-root';
        githubCard.className = 'ext-settings-card ant-card ant-card-bordered ext-github-card';
        githubCard.innerHTML = `
            <div class="ant-card-body" style="padding: 22px 24px;">
                <div class="ext-github-card-inner">
                    <div class="ext-github-info">
                        <div class="ext-github-icon-badge">
                            ${lucideIcons.github}
                        </div>
                        <div>
                            <h4 class="ext-github-title">
                                Open Source & Community
                            </h4>
                            <p class="ext-github-desc">
                                FB AdBlocker & Clean Feed is 100% free, offline, and open-source. If you enjoy a clean Facebook, please star the project on GitHub to support ongoing development!
                            </p>
                        </div>
                    </div>
                    <div class="ext-github-actions">
                        <a href="https://github.com/monourar/fb-adblocker-clean-feed" target="_blank" rel="noopener noreferrer" class="ext-btn ext-btn-primary ext-star-btn">
                            ${lucideIcons.star}
                            <span>Star on GitHub</span>
                        </a>
                        <a href="https://github.com/monourar/fb-adblocker-clean-feed/issues" target="_blank" rel="noopener noreferrer" class="ext-btn ext-btn-secondary">
                            ${lucideIcons.bug}
                            <span>Report an Issue</span>
                        </a>
                    </div>
                </div>
            </div>
        `;

        function mountCards() {
            const existing = document.getElementById('ext-settings-card-root');
            if (existing && document.contains(existing)) return true;

            const slot = document.getElementById('ext-settings-slot')
                || document.querySelector('div[style*="1024px"]')
                || document.querySelector('div[style*="max-width: 1024"]')
                || document.querySelector('.ant-space-vertical');

            if (slot) {
                slot.appendChild(card);
                slot.appendChild(githubCard);
                return true;
            }

            const footer = document.querySelector('.footer');
            if (footer && footer.parentElement) {
                footer.parentElement.insertBefore(card, footer);
                footer.parentElement.insertBefore(githubCard, footer);
                return true;
            }

            return false;
        }

        const input = card.querySelector('#ext-kw-input');
        const addBtn = card.querySelector('#ext-kw-add-btn');
        const tagsBox = card.querySelector('#ext-tags-box');
        const exportBtn = card.querySelector('#ext-export-btn');
        const importBtn = card.querySelector('#ext-import-btn');
        const importFile = card.querySelector('#ext-import-file');
        const statusMsg = card.querySelector('#ext-status-msg');

        let keywords = [];

        function showStatus(text) {
            statusMsg.textContent = text;
            statusMsg.style.display = 'block';
            setTimeout(() => {
                statusMsg.style.display = 'none';
                statusMsg.textContent = '';
            }, 3000);
        }

        function renderTags() {
            tagsBox.innerHTML = '';
            if (keywords.length === 0) {
                tagsBox.innerHTML = '<span style="color: var(--label-tertiary); font-size: 13px; font-style: italic;">No custom keywords added yet. Add keywords above to block posts containing them.</span>';
                return;
            }
            keywords.forEach((kw, index) => {
                const tag = document.createElement('span');
                tag.className = 'ext-tag';
                tag.innerHTML = `<span>${escapeHtml(kw)}</span><span class="ext-tag-remove" data-index="${index}" title="Remove keyword">${lucideIcons.close}</span>`;
                tagsBox.appendChild(tag);
            });
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function saveKeywords() {
            chrome.storage.local.set({ customKeywords: keywords }, () => {
                renderTags();
                showStatus('Keywords saved');
            });
        }

        function addKeyword() {
            const val = input.value.trim();
            if (val && !keywords.includes(val)) {
                keywords.push(val);
                input.value = '';
                saveKeywords();
            }
        }

        addBtn.addEventListener('click', addKeyword);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addKeyword();
            }
        });

        tagsBox.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.ext-tag-remove');
            if (removeBtn) {
                const index = parseInt(removeBtn.getAttribute('data-index'), 10);
                if (!isNaN(index)) {
                    keywords.splice(index, 1);
                    saveKeywords();
                }
            }
        });

        // Load saved keywords
        chrome.storage.local.get(['customKeywords'], (res) => {
            if (Array.isArray(res.customKeywords)) {
                keywords = res.customKeywords;
            }
            renderTags();
        });

        // Export settings
        exportBtn.addEventListener('click', () => {
            chrome.storage.local.get(null, (allData) => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute('href', dataStr);
                downloadAnchor.setAttribute('download', 'fb-adblocker-settings.json');
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
                showStatus('Settings exported (JSON)');
            });
        });

        // Import settings
        importBtn.addEventListener('click', () => {
            importFile.click();
        });

        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                        throw new Error('Root configuration must be a valid JSON object.');
                    }

                    // Only allow whitelist of expected keys: features, customKeywords, global
                    const sanitized = {};
                    if (parsed.customKeywords && Array.isArray(parsed.customKeywords)) {
                        sanitized.customKeywords = parsed.customKeywords
                            .filter(k => typeof k === 'string')
                            .map(k => k.trim())
                            .filter(Boolean);
                    }
                    if (parsed.features && typeof parsed.features === 'object' && !Array.isArray(parsed.features)) {
                        sanitized.features = parsed.features;
                    }
                    if (parsed.global && typeof parsed.global === 'object' && !Array.isArray(parsed.global)) {
                        sanitized.global = parsed.global;
                    }

                    if (Object.keys(sanitized).length === 0) {
                        throw new Error('No recognized configuration settings found in the file.');
                    }

                    chrome.storage.local.set(sanitized, () => {
                        if (Array.isArray(sanitized.customKeywords)) {
                            keywords = sanitized.customKeywords;
                            renderTags();
                        }
                        showStatus('Settings imported successfully! Reloading...');
                        setTimeout(() => location.reload(), 1200);
                    });
                } catch (err) {
                    alert('Invalid settings file: ' + err.message);
                }
            };
            reader.readAsText(file);
        });

        // Trigger initial mount attempt
        mountCards();

        // Polling loop to catch React async render completion
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (mountCards() || attempts > 120) {
                clearInterval(interval);
            }
        }, 40);

        // Persistent observer to guarantee cards remain mounted if React re-renders
        const observer = new MutationObserver(() => {
            const existing = document.getElementById('ext-settings-card-root');
            if (!existing || !document.contains(existing)) {
                if (mountCards()) {
                    clearInterval(interval);
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
