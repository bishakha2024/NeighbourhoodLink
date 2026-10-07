const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const compile = (file, mocks) => {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, { exports, console, require: (name) => { if (name in mocks) return mocks[name]; throw new Error(`Unexpected import: ${name}`); } });
  return exports;
};
const { buildNotifications } = compile('src/lib/notifications.ts', {});
async function harness(firebase = false) {
  let user = { id: 'owner', fullName: 'Owner' }; let state; let fail = false; let delayed;
  const storage = new Map(); const subscribers = new Map();
  const remote = {
    subscribeCollection: (name, receive) => { subscribers.set(name, receive); return () => subscribers.delete(name); },
    subscribeMessages: (_id, receive) => { subscribers.set('Messages', receive); return () => subscribers.delete('Messages'); },
  };
  for (const name of ['deleteService', 'saveListingLike', 'saveListingComment', 'deleteListing', 'saveListing', 'saveService', 'savePost', 'saveMessage', 'saveReview', 'saveReport', 'savePostComment', 'savePostLike', 'savePreferences']) remote[name] = async () => { if (fail) throw new Error('Offline'); if (delayed) await delayed; };
  const context = compile('src/context/DataContext.tsx', {
    react: React, 'react/jsx-runtime': require('react/jsx-runtime'),
    'firebase/firestore': { doc: () => ({}), getDoc: async () => ({ exists: () => false }) },
    '@react-native-async-storage/async-storage': { getItem: async (key) => storage.get(key) ?? null, setItem: async (key, value) => storage.set(key, value) },
    '../lib/firebase': { isFirebaseConfigured: firebase, db: firebase ? {} : null },
    '../lib/firebaseData': remote,
    '../lib/notifications': { buildNotifications },
    './AuthContext': { useAuth: () => ({ user }) },
    '../lib/mockData': { listings: [{ id: 'mine', userId: 'owner', title: 'Original' }, { id: 'other', userId: 'other', title: 'Other' }], posts: [{ id: 'post', userId: 'other', title: 'Post', createdAt: '2026-10-06' }], services: [], messages: [], reviews: [] },
  });
  function Probe() { state = context.useData(); return null; }
  const element = () => React.createElement(context.DataProvider, null, React.createElement(Probe));
  let renderer;
  await act(async () => { renderer = create(element()); });
  return {
    get state() { return state; }, storage, subscribers,
    fail: (value) => fail = value,
    delay: (value) => delayed = value,
    run: async (action) => { await act(async () => { await action(state); }); },
    switchUser: async (value) => { user = value; await act(async () => renderer.update(element())); },
    close: async () => { await act(async () => renderer.unmount()); },
  };
}
test('likes, comments, reports and preferences persist and validate input', async () => {
  const h = await harness();
  await h.run((data) => data.togglePostLike('post')); assert.equal(h.state.postLikes.length, 1);
  await h.run((data) => data.togglePostLike('post')); assert.equal(h.state.postLikes.length, 0);
  await h.run((data) => data.addPostComment('post', '  Hello  ')); assert.equal(h.state.postComments[0].content, 'Hello');
  await h.run((data) => data.addPostComment('post', ' ')); assert.equal(h.state.postComments.length, 1);
  await assert.rejects(h.state.addPostComment('missing', 'Hi'), /not found/);
  await h.run((data) => data.addReport('Scam', 'Details', 'mine')); assert.equal(h.state.reports[0].status, 'pending');
  await h.run((data) => data.updatePreferences({ ...data.preferences, communityUpdates: false }));
  const saved = JSON.parse(h.storage.get('nl_app_data_v2_demo_owner'));
  assert.equal(saved.postComments.length, 1); assert.equal(saved.reports.length, 1); assert.equal(saved.preferences.communityUpdates, false);
  await h.close();
});
test('ownership, self messaging and review validation are enforced', async () => {
  const h = await harness();
  await assert.rejects(h.state.updateListing({ id: 'other', userId: 'other' }), /owner/);
  await h.run((data) => data.updateListing({ id: 'mine', userId: 'owner', title: 'Edited' })); assert.equal(h.state.listings[0].title, 'Edited');
  await assert.rejects(h.state.addMessage({ senderId: 'owner', receiverId: 'owner', text: 'Hi' }), /another neighbour/);
  await assert.rejects(h.state.addReview('owner', 5, 'Self'), /another neighbour/);
  await assert.rejects(h.state.addReview('other', 6, 'Invalid'), /1–5/);
  await h.run((data) => data.addReview('other', 5, ' Great '));
  await h.run((data) => data.addReview('other', 4, 'Updated')); assert.equal(h.state.reviews.length, 1); assert.equal(h.state.reviews[0].rating, 4);
  await h.close();
});
test('failed saves leave state unchanged', async () => {
  const h = await harness(); h.fail(true);
  await assert.rejects(h.state.updateListing({ id: 'mine', userId: 'owner', title: 'Failed' }), /Offline/);
  assert.equal(h.state.listings[0].title, 'Original');
  await assert.rejects(h.state.togglePostLike('post'), /Offline/); assert.equal(h.state.postLikes.length, 0);
  await assert.rejects(h.state.addPostComment('post', 'Failed'), /Offline/); assert.equal(h.state.postComments.length, 0);
  await assert.rejects(h.state.addReport('Other', 'Failed'), /Offline/); assert.equal(h.state.reports.length, 0);
  await h.close();
});
test('account switching isolates cached activity and blocks late writes', async () => {
  const h = await harness();
  await h.run((data) => data.addPostComment('post', 'Private cache'));
  let resolve; const pending = new Promise((done) => resolve = done); h.delay(pending);
  const save = h.state.updateListing({ id: 'mine', userId: 'owner', title: 'Late write' });
  await h.switchUser({ id: 'new-user', fullName: 'New User' });
  await act(async () => { resolve(); await save; });
  assert.equal(h.state.postComments.length, 0); assert.equal(h.state.listings[0].title, 'Original');
  await h.switchUser({ id: 'owner', fullName: 'Owner' }); assert.equal(h.state.postComments[0].content, 'Private cache');
  await h.close();
});
test('live mode starts empty, accepts snapshots and unsubscribes on sign-out', async () => {
  const h = await harness(true);
  assert.equal(h.state.listings.length, 0);
  await act(async () => h.subscribers.get('Listings')([{ id: 'live', userId: 'other' }])); assert.equal(h.state.listings[0].id, 'live');
  await h.switchUser(null); assert.equal(h.state.listings.length, 0); assert.equal(h.subscribers.size, 0);
  await h.close();
});

test('listing deletion enforces ownership, preserves failed deletes, and persists success', async () => {
  const h = await harness();
  await assert.rejects(h.state.deleteListing('other'), /owner/);
  h.fail(true);
  await assert.rejects(h.state.deleteListing('mine'), /Offline/);
  assert.ok(h.state.listings.some(item => item.id === 'mine'));
  h.fail(false);
  await h.run(data => data.updateListing({ ...data.listings.find(item => item.id === 'mine'), images: ['https://example.com/a.jpg', 'https://example.com/b.jpg'] }));
  assert.equal(h.state.listings.find(item => item.id === 'mine').images.length, 2);
  await h.run(data => data.deleteListing('mine'));
  assert.equal(h.state.listings.some(item => item.id === 'mine'), false);
  const saved = JSON.parse(h.storage.get('nl_app_data_v2_demo_owner'));
  assert.equal(saved.listings.some(item => item.id === 'mine'), false);
  assert.ok(saved.listings.some(item => item.id === 'other'));
  await h.close();
});

test('listing reactions and read indicators persist and reject invalid targets', async () => {
 const h = await harness();
 await h.run(data => data.toggleListingLike('mine'));
 assert.equal(h.state.listingLikes.length, 1);
 await h.run(data => data.toggleListingLike('mine'));
 assert.equal(h.state.listingLikes.length, 0);
 await h.run(data => data.addListingComment('mine', ' Nice object '));
 assert.equal(h.state.listingComments[0].content, 'Nice object');
 await assert.rejects(h.state.addListingComment('missing', 'Hello'), /not found/);
 await h.run(data => data.markMarketplaceSeen());
 assert.ok(h.state.seenListingIds.includes('mine'));
 await h.close();
});

test('service CRUD enforces provider ownership and preserves failed deletion', async () => {
 const h = await harness();
 await h.run(data => data.addService({ id: 's1', userId: 'owner', serviceName: 'Tutoring' }));
 await assert.rejects(h.state.updateService({ id: 's1', userId: 'other' }), /provider/);
 await h.run(data => data.updateService({ id: 's1', userId: 'owner', serviceName: 'Math tutoring', price: 20 }));
 assert.equal(h.state.services[0].serviceName, 'Math tutoring');
 h.fail(true); await assert.rejects(h.state.deleteService('s1'), /Offline/);
 assert.equal(h.state.services.length, 1);
 h.fail(false); await h.run(data => data.deleteService('s1'));
 assert.equal(h.state.services.length, 0); await h.close();
});
