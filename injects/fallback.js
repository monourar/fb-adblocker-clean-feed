/**
 * FB AdBlocker & Clean Feed - Resilient DOM & Keyword Filtering Fallback
 * Works alongside the React/Relay proxy to catch feed units that bypass React hooks.
 */

(function () {
    'use strict';

    let settings = {
        removeSponsored: true,
        removeReels: true,
        removeSuggestedForYou: false,
        useCleanMode: true,
        customKeywords: []
    };

    // Load active settings from storage
    function loadSettings() {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['features', 'customKeywords'], (result) => {
                if (result.features) {
                    if (result.features.removeSponsored !== undefined) settings.removeSponsored = result.features.removeSponsored.enable;
                    if (result.features.removeReels !== undefined) settings.removeReels = result.features.removeReels.enable;
                    if (result.features.removeSuggestedForYou !== undefined) settings.removeSuggestedForYou = result.features.removeSuggestedForYou.enable;
                    if (result.features.useCleanMode !== undefined) settings.useCleanMode = result.features.useCleanMode.enable;
                }
                if (Array.isArray(result.customKeywords)) {
                    settings.customKeywords = result.customKeywords.map(k => k.trim().toLowerCase()).filter(Boolean);
                }
                processExistingPosts();
            });
        }
    }

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local') {
                loadSettings();
            }
        });
    }

    // Helper to find the top-level feed post container
    function getPostContainer(node) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;
        return node.closest('div[role="feed"] > div') ||
               node.closest('div[data-pagelet^="FeedUnit"]') ||
               node.closest('div[data-virtualized="false"]');
    }

    function hideElement(el, reason) {
        if (!el || el.classList.contains('fbadblocker-processed')) return;
        el.classList.add('fbadblocker-processed');

        if (settings.useCleanMode) {
            el.classList.add('fbadblocker-hidden');
        } else {
            const originalDisplay = el.style.display;
            el.style.display = 'none';
            const notice = document.createElement('div');
            notice.className = 'fbadblocker-collapsed-notice';
            notice.innerHTML = `<span>Blocked: <strong>${reason}</strong></span><button style="cursor:pointer;background:none;border:none;color:inherit;text-decoration:underline;">Show</button>`;
            notice.querySelector('button').addEventListener('click', () => {
                notice.remove();
                el.style.display = originalDisplay;
            });
            el.parentNode && el.parentNode.insertBefore(notice, el);
        }
    }

    // Check if post text matches any user keyword
    function checkKeywords(postEl) {
        if (!settings.customKeywords.length) return false;
        const text = postEl.innerText || '';
        if (!text) return false;
        const lower = text.toLowerCase();
        for (const kw of settings.customKeywords) {
            if (lower.includes(kw)) {
                return kw;
            }
        }
        return false;
    }

    // Check for sponsored post signatures
    function isSponsored(postEl) {
        // Link to ad preference or about ads
        if (postEl.querySelector('a[href*="/ads/about"], a[href*="/ad_preferences"], a[href*="/about/ads"]')) {
            return true;
        }
        // Obfuscated / aria-labeled "Sponsored"
        const ariaLabels = postEl.querySelectorAll('[aria-label]');
        for (let i = 0; i < ariaLabels.length; i++) {
            const label = ariaLabels[i].getAttribute('aria-label') || '';
            if (/^sponsored$/i.test(label) || /^sponsrad$/i.test(label)) {
                return true;
            }
        }
        return false;
    }

    // Check for reels signatures
    function isReels(postEl) {
        if (postEl.querySelector('a[href*="/reel/"]')) return true;
        if (postEl.getAttribute('data-pagelet') && postEl.getAttribute('data-pagelet').includes('Reels')) return true;
        return false;
    }

    function inspectPost(postEl) {
        if (!postEl || postEl.classList.contains('fbadblocker-processed')) return;

        // 1. Keyword check
        const matchedKw = checkKeywords(postEl);
        if (matchedKw) {
            hideElement(postEl, `Keyword: "${matchedKw}"`);
            return;
        }

        // 2. Sponsored check
        if (settings.removeSponsored && isSponsored(postEl)) {
            hideElement(postEl, 'Sponsored Post');
            return;
        }

        // 3. Reels check
        if (settings.removeReels && isReels(postEl)) {
            hideElement(postEl, 'Facebook Reel');
            return;
        }
    }

    function processExistingPosts() {
        const posts = document.querySelectorAll('div[role="feed"] > div, div[data-pagelet^="FeedUnit"]');
        posts.forEach(inspectPost);
    }

    // Continuous DOM observer for dynamically loaded feed units
    const observer = new MutationObserver((mutations) => {
        for (let i = 0; i < mutations.length; i++) {
            const added = mutations[i].addedNodes;
            for (let j = 0; j < added.length; j++) {
                const node = added[j];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const post = getPostContainer(node);
                    if (post) {
                        inspectPost(post);
                    } else if (node.querySelectorAll) {
                        const subPosts = node.querySelectorAll('div[role="feed"] > div, div[data-pagelet^="FeedUnit"]');
                        subPosts.forEach(inspectPost);
                    }
                }
            }
        }
    });

    function init() {
        loadSettings();
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
