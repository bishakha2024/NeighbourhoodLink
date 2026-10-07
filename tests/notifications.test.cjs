const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
function load(file) {
  const result = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: result.exports });
  return result.exports;
}
const { buildNotifications } = load('src/lib/notifications.ts');
const { notificationRoute } = load('src/lib/notificationRoute.ts');
const preferences = { communityUpdates: true, pushEnabled: false, useLocation: true };
const data = {
  messages: [
    { id: 'incoming', receiverId: 'me', senderId: 'provider', senderName: 'Provider', text: 'Hello', timestamp: '2026-10-06T12:00:00Z', serviceId: 's1' },
    { id: 'outgoing', receiverId: 'provider', senderId: 'me', text: 'Hello', timestamp: '2026-10-06T13:00:00Z' },
    { id: 'other', receiverId: 'other', senderId: 'provider', text: 'Private', timestamp: '2026-10-06T14:00:00Z' },
  ],
  posts: [{ id: 'mine', userId: 'me', title: 'Mine', createdAt: '2026-10-05' }, { id: 'theirs', userId: 'provider', title: 'Theirs', createdAt: '2026-10-06' }],
  reviews: [{ id: 'review', reviewedUserId: 'me', reviewerName: 'Provider', rating: 5, createdAt: '2026-10-04' }],
  postComments: [{ id: 'comment', postId: 'mine', userId: 'provider', userName: 'Provider', content: 'Nice!', createdAt: '2026-10-06' }],
  postLikes: [{ id: 'like', postId: 'mine', userId: 'provider', createdAt: '2026-10-06' }, { id: 'self', postId: 'mine', userId: 'me', createdAt: '2026-10-06' }],
};
test('notifications use only incoming activity and retain read state', () => {
  const result = buildNotifications('me', data, ['message-incoming'], preferences);
  assert.equal(result.length, 5);
  assert.equal(result.find((item) => item.id === 'message-incoming').read, true);
  assert.equal(result.some((item) => ['message-outgoing', 'message-other', 'like-self', 'post-mine'].includes(item.id)), false);
  assert.equal(result[0].id, 'message-incoming');
  assert.equal(result[0].target.serviceId, 's1');
});
test('community opt-out hides broadcasts while preserving personal activity', () => {
  const result = buildNotifications('me', data, [], { ...preferences, communityUpdates: false });
  assert.equal(result.length, 4);
  assert.equal(result.some((item) => item.id === 'post-theirs'), false);
});
test('all notification targets route correctly and malformed targets stay in the app', () => {
  assert.equal(notificationRoute({ page: 'listing', id: 'l1' }).pathname, '/listing/[id]');
  assert.equal(notificationRoute({ page: 'community', id: 'p1' }).pathname, '/community/[id]');
  assert.equal(notificationRoute({ page: 'service', id: 's1' }).pathname, '/services/[id]');
  assert.equal(notificationRoute({ page: 'reviews', userId: 'me' }).params.userId, 'me');
  assert.equal(notificationRoute({ page: 'message', sellerId: 'provider', serviceId: 's1' }).params.serviceId, 's1');
  assert.equal(notificationRoute({ page: 'message' }), '/(tabs)/messages');
  assert.equal(notificationRoute({ page: 'community' }), '/(tabs)/community');
  assert.equal(notificationRoute({ page: 'https://bad.example' }), '/notifications');
  assert.equal(notificationRoute(null), '/notifications');
});
