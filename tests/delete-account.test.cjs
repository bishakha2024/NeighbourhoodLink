const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
function setup({ rejectPassword = false, rejectCommit = false } = {}) {
 const calls = []; const exports = {};
 const user = { uid: 'me', email: 'me@example.com' };
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/deleteAccount.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, { exports, require: name => name === './firebase' ? { auth: { currentUser: user }, db: {} } : name === 'firebase/auth' ? {
 EmailAuthProvider: { credential: () => ({}) }, reauthenticateWithCredential: async () => { calls.push('reauth'); if (rejectPassword) throw Error('Wrong password'); }, deleteUser: async () => calls.push('auth-delete'),
 } : {
 collection: (_db, ...parts) => parts.join('/'), doc: (_db, ...parts) => parts.join('/'), where: (field, _op, value) => ({ field, value }), query: (name, constraint) => ({ name, constraint }),
 getDocs: async source => { calls.push('read'); const name = source.name; return { docs: name === 'Listings' ? [{ id: 'listing', ref: { path: 'Listings/listing', parent: { id: 'Listings' } } }] : name === 'Listing Comments' && source.constraint.field === 'listingId' ? [{ id: 'comment', ref: { path: 'Listing Comments/comment', parent: { id: 'Listing Comments' } } }] : [] }; },
 writeBatch: () => ({ delete: ref => calls.push(`delete:${ref.path}`), commit: async () => { if (rejectCommit) throw Error('Denied'); calls.push('commit'); } }), deleteDoc: async path => calls.push(`delete:${path}`),
 } });
 return { calls, run: () => exports.deleteAccountData('password') };
}
test('account cleanup reauthenticates and removes dependent data before identity', async () => {
 const h = setup(); await h.run();
 assert.equal(h.calls[0], 'reauth');
 assert.ok(h.calls.indexOf('delete:Listing Comments/comment') < h.calls.indexOf('delete:Listings/listing'));
 assert.deepEqual(h.calls.slice(-2), ['delete:Users/me', 'auth-delete']);
});
test('failed password or cleanup preserves Authentication account for retry', async () => {
 const wrong = setup({ rejectPassword: true }); await assert.rejects(wrong.run(), /Wrong password/); assert.deepEqual(wrong.calls, ['reauth']);
 const denied = setup({ rejectCommit: true }); await assert.rejects(denied.run(), /retry deletion/); assert.ok(!denied.calls.includes('auth-delete')); assert.ok(!denied.calls.includes('delete:Users/me'));
});
