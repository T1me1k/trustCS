const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const context = { console, setTimeout, clearTimeout, fetch: async () => ({ ok: true, json: async () => ({}) }) };
context.globalThis = context;
vm.runInNewContext(fs.readFileSync('trust-utils.js', 'utf8'), context, { filename: 'trust-utils.js' });
const utils = context.TrustApi;

assert.strictEqual(utils.formatDuration(65), '1:05');
assert.strictEqual(utils.formatDuration(3661), '1:01:01');
assert.strictEqual(utils.formatDuration(undefined), '—');
assert.strictEqual(utils.formatEloChange(22), '+22');
assert.strictEqual(utils.formatEloChange(-18), '-18');
assert.strictEqual(utils.formatEloChange(0), '0');
assert.strictEqual(utils.safeNumber('bad', 0), 0);
assert.strictEqual(utils.calculateKd(10, 0), '10.00');
assert.notStrictEqual(utils.formatDate('2026-07-22T12:00:00.000Z', 'en'), '—');
console.log('trust-utils tests passed');
