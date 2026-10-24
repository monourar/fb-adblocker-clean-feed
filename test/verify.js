/**
 * Automated Verification & Quality Gate Suite
 * Tests extension files, syntax, schemas, detection regexes, and security constraints.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ ${message}`);
        passed++;
    } else {
        console.error(`  ✗ FAIL: ${message}`);
        failed++;
    }
}

console.log('--- FB AdBlocker Verification Suite ---');

// 1. JSON Schema & Manifest Validity
console.log('\n[1] Checking JSON Schemas...');
try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    assert(manifest.manifest_version === 3, 'Manifest is MV3');
    assert(manifest.content_scripts && manifest.content_scripts.length > 0, 'Content scripts registered');
    assert(manifest.permissions.includes('storage'), 'Storage permission declared');
    assert(manifest.permissions.includes('declarativeNetRequest'), 'DNR permission declared');

    const rules = JSON.parse(fs.readFileSync('rules_1.json', 'utf8'));
    assert(Array.isArray(rules) && rules.length > 0, 'DNR rules array valid');
    assert(rules[0].action.responseHeaders[0].header === 'content-security-policy', 'CSP header modification present');
} catch (e) {
    assert(false, `JSON parsing error: ${e.message}`);
}

// 2. Syntax Check on Extension Scripts
console.log('\n[2] Checking JavaScript Syntax...');
const jsFiles = [
    'injects/cleaner.js',
    'src/pages/options/settings_ext.js',
    'src/pages/popup/popup_ext.js',
    'service-worker-loader.js',
    'assets/index.html-Wrnw42Ml.js',
    'assets/index.html-CsQMIuHV.js'
];

for (const file of jsFiles) {
    try {
        execSync(`node --check "${file}"`, { stdio: 'pipe' });
        assert(true, `${file} syntax is valid`);
    } catch (e) {
        assert(false, `${file} syntax error: ${e.message}`);
    }
}

// 3. Regex & Ad Detection Unit Tests
console.log('\n[3] Testing Ad Detection Patterns...');
const cleanerSource = fs.readFileSync('injects/cleaner.js', 'utf8');

const labelRegexMatch = cleanerSource.match(/const SPONSORED_LABEL_REGEX = (.*?);/);
const textRegexMatch = cleanerSource.match(/const SPONSORED_TEXT_REGEX = (.*?);/);

assert(Boolean(labelRegexMatch), 'SPONSORED_LABEL_REGEX defined in cleaner.js');
assert(Boolean(textRegexMatch), 'SPONSORED_TEXT_REGEX defined in cleaner.js');

if (labelRegexMatch && textRegexMatch) {
    const labelRegex = eval(labelRegexMatch[1]);
    const textRegex = eval(textRegexMatch[1]);

    // Positive matches
    assert(labelRegex.test('Sponsored'), 'Matches plain "Sponsored"');
    assert(labelRegex.test('Sponsored · Paid for by Acme Inc.'), 'Matches suffixed "Sponsored · Paid for by..."');
    assert(labelRegex.test('Sponsored • '), 'Matches bullet-separated "Sponsored • "');
    assert(labelRegex.test('مُموَّل'), 'Matches Arabic "مُموَّل"');
    assert(labelRegex.test('gesponsert'), 'Matches German "gesponsert"');
    assert(textRegex.test('Sponsored'), 'Text matches "Sponsored"');
    assert(textRegex.test('Sponsored •'), 'Text matches "Sponsored •"');

    // Negative matches
    assert(!labelRegex.test('This post was not sponsored'), 'Does not match "This post was not sponsored"');
    assert(!labelRegex.test('General Discussion'), 'Does not match "General Discussion"');
    assert(!textRegex.test('The sponsors of the event'), 'Does not match "The sponsors of the event"');
    assert(!textRegex.test('Comment on this post'), 'Does not match "Comment on this post"');
}

// 4. Security & Privacy Audit
console.log('\n[4] Auditing Security & Zero Telemetry...');
const rulesRaw = fs.readFileSync('rules_1.json', 'utf8');
assert(!rulesRaw.includes('google-analytics.com'), 'CSP does not allow google-analytics.com');
assert(!rulesRaw.includes('localhost'), 'CSP does not allow localhost or local ports');
assert(!cleanerSource.includes('.innerText'), 'cleaner.js uses textContent without innerText layout thrashing');

// Summary
console.log('\n=======================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('=======================================');

if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
