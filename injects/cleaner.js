/**
 * FB AdBlocker & Clean Feed - Content Cleaner & Live Counter Engine
 * Runs in isolated world on Facebook to detect and remove ads, reels, suggested posts,
 * and custom keywords, ensuring counters always stay accurate.
 */

(function () {
    'use strict';

    let settings = {
        removeReels: true,
        removeSponsored: true,
        removeSuggestedForYou: false,
        useCleanMode: true,
        customKeywords: []
    };

    let pendingCounts = { reels: 0, suggested: 0, sponsored: 0 };
    let flushTimer = null;
    let observer = null;
    let isInvalidated = false;

    // Permanently disconnect and clean up when extension reloads/invalidates
    function terminate() {
        isInvalidated = true;
        if (observer) {
            try { observer.disconnect(); } catch (e) {}
            observer = null;
        }
        if (flushTimer) {
            clearTimeout(flushTimer);
            flushTimer = null;
        }
        pendingCounts = { reels: 0, suggested: 0, sponsored: 0 };
    }

    // Safely check if extension context is still active without throwing
    function isContextValid() {
        if (isInvalidated) return false;
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && Boolean(chrome.runtime.id)) {
                return true;
            }
        } catch (e) {}
        terminate();
        return false;
    }

    // Suppress benign context invalidation errors when extension updates or reloads
    window.addEventListener('error', (event) => {
        const msg = String(event?.message || event?.error?.message || '');
        if (msg.includes('Extension context invalidated')) {
            event.preventDefault();
            terminate();
        }
    });

    window.addEventListener('unhandledrejection', (event) => {
        const msg = String(event?.reason?.message || event?.reason || '');
        if (msg.includes('Extension context invalidated')) {
            event.preventDefault();
            terminate();
        }
    });

    // Load active settings from storage using Promises to avoid legacy callback dispatcher crashes
    function loadSettings() {
        if (!isContextValid()) return;
        try {
            chrome.storage.local.get(['features', 'customKeywords'])
                .then((res) => {
                    if (!isContextValid() || !res) return;
                    if (res.features) {
                        if (res.features.removeReels !== undefined) settings.removeReels = res.features.removeReels.enable;
                        if (res.features.removeSponsored !== undefined) settings.removeSponsored = res.features.removeSponsored.enable;
                        if (res.features.removeSuggestedForYou !== undefined) settings.removeSuggestedForYou = res.features.removeSuggestedForYou.enable;
                        if (res.features.useCleanMode !== undefined) settings.useCleanMode = res.features.useCleanMode.enable;
                    }
                    if (Array.isArray(res.customKeywords)) {
                        settings.customKeywords = res.customKeywords.map(k => k.trim().toLowerCase()).filter(Boolean);
                    }
                    scanFeed();
                })
                .catch(() => {
                    terminate();
                });
        } catch (e) {
            terminate();
        }
    }

    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
            chrome.storage.onChanged.addListener((changes, area) => {
                if (!isContextValid()) return;
                if (area === 'local' && (changes.features || changes.customKeywords)) {
                    loadSettings();
                }
            });
        }
    } catch (e) {
        terminate();
    }

    // Safely commit count increments to storage.local under 'global.counts'
    function queueCount(type) {
        if (!isContextValid()) return;
        if (type === 'reels' || type === 'suggested' || type === 'sponsored') {
            pendingCounts[type] = (pendingCounts[type] || 0) + 1;
            if (flushTimer) clearTimeout(flushTimer);
            flushTimer = setTimeout(flushCounts, 400);
        }
    }

    function flushCounts() {
        if (!isContextValid()) return;

        const toAdd = { ...pendingCounts };
        pendingCounts = { reels: 0, suggested: 0, sponsored: 0 };
        if (toAdd.reels === 0 && toAdd.suggested === 0 && toAdd.sponsored === 0) return;

        try {
            chrome.storage.local.get("global")
                .then((res) => {
                    if (!isContextValid() || !res) return;
                    const global = res.global || {};
                    const counts = global.counts || { reels: 0, suggested: 0, sponsored: 0, PYMK: 0 };
                    counts.reels = (counts.reels || 0) + (toAdd.reels || 0);
                    counts.suggested = (counts.suggested || 0) + (toAdd.suggested || 0);
                    counts.sponsored = (counts.sponsored || 0) + (toAdd.sponsored || 0);
                    global.counts = counts;
                    return chrome.storage.local.set({ global });
                })
                .catch(() => {
                    terminate();
                });
        } catch (e) {
            terminate();
        }
    }

    // Listen for updateCounts sent from the main world script (injects/index.js)
    window.addEventListener("message", (e) => {
        if (!isContextValid()) return;
        try {
            if (e.data && e.data.from === "remove-reels-for-facebook" && e.data.action === "updateCounts") {
                const payload = Array.isArray(e.data.payload) ? e.data.payload[0] : e.data.payload;
                if (payload) {
                    if (payload.reels) pendingCounts.reels = (pendingCounts.reels || 0) + payload.reels;
                    if (payload.suggested) pendingCounts.suggested = (pendingCounts.suggested || 0) + payload.suggested;
                    if (payload.sponsored) pendingCounts.sponsored = (pendingCounts.sponsored || 0) + payload.sponsored;
                    if (flushTimer) clearTimeout(flushTimer);
                    flushTimer = setTimeout(flushCounts, 300);
                }
            }
        } catch (e) {}
    });

    // Safely locate post element, strictly avoiding the feed container
    function getPostElement(node) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;
        if (node.getAttribute('role') === 'feed') return null;

        const post = node.closest('div[role="article"], div[data-pagelet^="FeedUnit_"]');
        if (post && post.getAttribute('role') !== 'feed' && !post.querySelector('div[role="feed"]')) {
            return post;
        }
        return null;
    }

    const SPONSORED_LABEL_REGEX = /^(sponsored|advertisement|sponsrad|promoted|gesponsert|commandit[eé]|patrocinado|مُموَّل)(\s*[\cdot•·\-\—\|]|\s+paid|\s+by|\s*$)/i;
    const SPONSORED_TEXT_REGEX = /^(sponsored|advertisement)(\s*[\cdot•·\-\—\|]|\s+paid|\s+by|\s*$)/i;

    function isSponsored(post) {
        // Direct ad links
        if (post.querySelector('a[href*="/ads/about"], a[href*="/ad_preferences"], a[href*="/about/ads"], a[href*="facebook.com/ads/"]')) {
            return true;
        }
        // aria-labels
        const ariaEls = post.querySelectorAll('[aria-label]');
        for (let i = 0; i < ariaEls.length; i++) {
            const label = (ariaEls[i].getAttribute('aria-label') || '').trim();
            if (SPONSORED_LABEL_REGEX.test(label)) {
                return true;
            }
        }
        // Standard text headers
        const links = post.querySelectorAll('a[role="link"], span[role="button"]');
        for (let i = 0; i < links.length; i++) {
            const t = (links[i].textContent || '').trim();
            if (SPONSORED_TEXT_REGEX.test(t)) {
                return true;
            }
        }
        return false;
    }

    function isReels(post) {
        if (post.querySelector('a[href*="/reel/"], a[href*="/reels/"]')) return true;
        const pagelet = post.getAttribute('data-pagelet') || '';
        if (pagelet.includes('Reels') || pagelet.includes('Shorts')) return true;
        const text = (post.textContent || '').slice(0, 300);
        if (text.includes('Reels and short videos') || text.includes('Facebook Reels')) return true;
        return false;
    }

    function isSuggested(post) {
        const text = (post.textContent || '').slice(0, 400);
        return text.includes('Suggested for you') ||
               text.includes('Suggested for You') ||
               text.includes('Suggested group') ||
               text.includes('Recommended for you');
    }

    function checkKeywords(post) {
        if (!settings.customKeywords.length) return false;
        const text = (post.textContent || '').toLowerCase();
        for (const kw of settings.customKeywords) {
            if (kw && text.includes(kw)) return kw;
        }
        return false;
    }

    function inspectAndClean(post) {
        if (!post || post.dataset.fbadblockerHidden) return;

        // 1. Check custom keywords
        const matchedKw = checkKeywords(post);
        if (matchedKw) {
            post.dataset.fbadblockerHidden = "true";
            post.style.setProperty("display", "none", "important");
            queueCount('suggested');
            return;
        }

        // 2. Check sponsored
        if (settings.removeSponsored && isSponsored(post)) {
            post.dataset.fbadblockerHidden = "true";
            post.style.setProperty("display", "none", "important");
            queueCount('sponsored');
            return;
        }

        // 3. Check reels
        if (settings.removeReels && isReels(post)) {
            post.dataset.fbadblockerHidden = "true";
            post.style.setProperty("display", "none", "important");
            queueCount('reels');
            return;
        }

        // 4. Check suggested
        if (settings.removeSuggestedForYou && isSuggested(post)) {
            post.dataset.fbadblockerHidden = "true";
            post.style.setProperty("display", "none", "important");
            queueCount('suggested');
            return;
        }
    }

    function scanFeed() {
        const posts = document.querySelectorAll('div[role="article"], div[data-pagelet^="FeedUnit_"]');
        posts.forEach(post => {
            if (post.getAttribute('role') !== 'feed' && !post.querySelector('div[role="feed"]')) {
                inspectAndClean(post);
            }
        });
    }

    observer = new MutationObserver((mutations) => {
        if (!isContextValid()) return;
        for (let i = 0; i < mutations.length; i++) {
            const added = mutations[i].addedNodes;
            for (let j = 0; j < added.length; j++) {
                const node = added[j];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const post = getPostElement(node);
                    if (post) {
                        inspectAndClean(post);
                    } else if (node.querySelectorAll) {
                        const subPosts = node.querySelectorAll('div[role="article"], div[data-pagelet^="FeedUnit_"]');
                        subPosts.forEach(p => {
                            if (p.getAttribute('role') !== 'feed' && !p.querySelector('div[role="feed"]')) {
                                inspectAndClean(p);
                            }
                        });
                    }
                }
            }
        }
    });

    function init() {
        if (!isContextValid()) return;
        loadSettings();
        try {
            observer.observe(document.documentElement, { childList: true, subtree: true });
        } catch (e) {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
