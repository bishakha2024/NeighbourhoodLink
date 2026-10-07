const { test, before, beforeEach } = require('node:test');
const fs = require('node:fs');
const { assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { createMockUserToken } = require('@firebase/util');
const project = 'demo-neighbourhoodlink';
const base = `http://127.0.0.1:8080/v1/projects/${project}/databases/(default)/documents`;
const encodeValue = (value) => typeof value === 'string' ? { stringValue: value } : typeof value === 'boolean' ? { booleanValue: value } : typeof value === 'number' ? { integerValue: String(value) } : { mapValue: { fields: encodeFields(value) } };
const encodeFields = (value) => Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encodeValue(item)]));
const userDb = (user) => ({ token: createMockUserToken({ sub: user, user_id: user }, project) });
const doc = (db, path) => ({ db, path });
const collection = doc;
const where = (field, _operation, value) => ({ fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: encodeValue(value) } });
const or = (...filters) => ({ compositeFilter: { op: 'OR', filters } });
const query = (source, filter) => ({ ...source, filter });
async function request(db, path, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, { method, headers: { Authorization: `Bearer ${db.token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
  if (!response.ok) { const error = new Error(await response.text()); error.code = response.status === 403 ? 'permission-denied' : 'unknown'; throw error; }
  return response.json();
}
const documentPath = (path) => '/' + path.split('/').map(encodeURIComponent).join('/');
const setDoc = (target, value) => request(target.db, documentPath(target.path), 'PATCH', { fields: encodeFields(value) });
const updateDoc = (target, value) => request(target.db, documentPath(target.path) + '?' + Object.keys(value).map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`).join('&'), 'PATCH', { fields: encodeFields(value) });
const getDoc = (target) => request(target.db, documentPath(target.path));
const getDocs = (source) => request(source.db, ':runQuery', 'POST', { structuredQuery: { from: [{ collectionId: source.path }], ...(source.filter ? { where: source.filter } : {}) } });
before(async () => {
  // Wait for the JVM, then upload rules with a bounded HTTP request.
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${project}:securityRules`, {
        method: 'PUT', body: JSON.stringify({ rules: { files: [{ content: fs.readFileSync('firestore.rules', 'utf8') }] } }), signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(await response.text());
      return;
    } catch (error) {
      if (!['ECONNRESET', 'ECONNREFUSED', 'UND_ERR_SOCKET'].includes(error.cause?.code) || attempt === 39) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
});
beforeEach(async () => {
  const response = await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${project}/databases/(default)/documents`, { method: 'DELETE', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(await response.text());
});
const seed = async (path, value) => setDoc(doc({ token: 'owner' }, path), value);
test('only participants can read messages, including the live conversation query', async () => {
  await seed('Messages/mine', { senderId: 'alice', receiverId: 'bob', text: 'Private' });
  await seed('Messages/other', { senderId: 'charlie', receiverId: 'dana', text: 'Private' });
  const db = userDb('alice');
  await assertSucceeds(getDocs(query(collection(db, 'Messages'), or(where('senderId', '==', 'alice'), where('receiverId', '==', 'alice')))));
  await assertFails(getDocs(collection(db, 'Messages')));
  await assertFails(getDoc(doc(db, 'Messages/other')));
  await assertFails(setDoc(doc(db, 'Messages/self'), { senderId: 'alice', receiverId: 'alice', text: 'Self' }));
});
test('community interactions allow other members while preventing impersonation', async () => {
  await seed('Community Posts/p1', { userId: 'alice', title: 'Post' });
  const db = userDb('bob');
  await assertSucceeds(setDoc(doc(db, 'Post Likes/p1_bob'), { userId: 'bob', postId: 'p1' }));
  await assertSucceeds(setDoc(doc(db, 'Post Comments/c1'), { userId: 'bob', postId: 'p1', content: 'Nice!' }));
  await assertFails(setDoc(doc(db, 'Post Likes/p1_alice'), { userId: 'alice', postId: 'p1' }));
  await assertFails(setDoc(doc(db, 'Post Comments/empty'), { userId: 'bob', postId: 'p1', content: '' }));
  await assertFails(updateDoc(doc(db, 'Community Posts/p1'), { title: 'Hijacked' }));
});
test('listing updates preserve ownership', async () => {
  await seed('Listings/l1', { userId: 'alice', title: 'Original' });
  await assertSucceeds(updateDoc(doc(userDb('alice'), 'Listings/l1'), { title: 'Edited' }));
  await assertFails(updateDoc(doc(userDb('alice'), 'Listings/l1'), { userId: 'bob' }));
  await assertFails(updateDoc(doc(userDb('bob'), 'Listings/l1'), { title: 'Hijacked' }));
});
test('reports and devices are private and reviews require valid ratings', async () => {
  const db = userDb('alice');
  await assertSucceeds(setDoc(doc(db, 'Reports/r1'), { userId: 'alice', status: 'pending', details: 'A problem' }));
  await assertFails(getDoc(doc(userDb('bob'), 'Reports/r1')));
  await assertSucceeds(setDoc(doc(db, 'Users/alice/Devices/device'), { token: 'token', enabled: true }));
  await assertFails(getDoc(doc(userDb('bob'), 'Users/alice/Devices/device')));
  await assertSucceeds(setDoc(doc(db, 'Reviews/alice_bob'), { reviewerId: 'alice', reviewedUserId: 'bob', rating: 5, comment: 'Good' }));
  await assertFails(setDoc(doc(db, 'Reviews/alice_alice'), { reviewerId: 'alice', reviewedUserId: 'alice', rating: 5, comment: 'Self' }));
  await assertFails(updateDoc(doc(db, 'Reviews/alice_bob'), { rating: 6 }));
});
test('members cannot assign themselves verified status or write push jobs', async () => {
  const db = userDb('alice');
  await assertSucceeds(setDoc(doc(db, 'Users/alice'), { userId: 'alice', verificationStatus: 'pending', rating: 0 }));
  await assertSucceeds(updateDoc(doc(db, 'Users/alice'), { preferences: { pushEnabled: false } }));
  await assertFails(updateDoc(doc(db, 'Users/alice'), { verificationStatus: 'verified' }));
  await assertFails(setDoc(doc(db, 'Push Jobs/job'), { status: 'sent' }));
});
