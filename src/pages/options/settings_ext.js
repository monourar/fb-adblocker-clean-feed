/**
 * FB AdBlocker & Clean Feed - Keyword Filtering & Backup/Restore UI
 */

(function () {
    function init() {
        const card = document.createElement('div');
        card.className = 'ext-settings-card';
        card.innerHTML = `
            <h3>🔍 Custom Keyword Blocker</h3>
            <p>Automatically collapse any Facebook feed post containing these words or phrases (case-insensitive):</p>
            
            <div class="ext-keyword-input-row">
                <input type="text" id="ext-kw-input" placeholder="e.g. spoilers, politics, crypto..." />
                <button class="ext-btn ext-btn-primary" id="ext-kw-add-btn">Add Keyword</button>
            </div>

            <div class="ext-tags-container" id="ext-tags-box"></div>

            <h3>💾 Backup & Restore Settings</h3>
            <p>Export your toggles and keywords to a JSON file or restore a previous backup:</p>
            
            <div class="ext-actions-row">
                <button class="ext-btn ext-btn-secondary" id="ext-export-btn">📥 Export Settings (JSON)</button>
                <button class="ext-btn ext-btn-secondary" id="ext-import-btn">📤 Import Settings</button>
                <input type="file" id="ext-import-file" accept=".json" style="display:none;" />
                <span id="ext-status-msg" style="align-self:center;font-size:13px;color:#31a24c;margin-left:auto;"></span>
            </div>
        `;

        document.body.appendChild(card);

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
            setTimeout(() => { statusMsg.textContent = ''; }, 3000);
        }

        function renderTags() {
            tagsBox.innerHTML = '';
            if (keywords.length === 0) {
                tagsBox.innerHTML = '<span style="color:#8a8d91;font-size:13px;font-style:italic;">No custom keywords added yet.</span>';
                return;
            }
            keywords.forEach((kw, index) => {
                const tag = document.createElement('span');
                tag.className = 'ext-tag';
                tag.innerHTML = `<span>${escapeHtml(kw)}</span><span class="ext-tag-remove" data-index="${index}">&times;</span>`;
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
            if (e.target.classList.contains('ext-tag-remove')) {
                const index = parseInt(e.target.getAttribute('data-index'), 10);
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
                showStatus('Exported settings');
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
                    chrome.storage.local.set(parsed, () => {
                        if (Array.isArray(parsed.customKeywords)) {
                            keywords = parsed.customKeywords;
                            renderTags();
                        }
                        showStatus('Settings imported successfully! Reloading...');
                        setTimeout(() => location.reload(), 1500);
                    });
                } catch (err) {
                    alert('Invalid JSON settings file: ' + err.message);
                }
            };
            reader.readAsText(file);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }
})();
