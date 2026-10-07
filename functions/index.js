const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { createHash } = require('node:crypto');
const { sendPushBatch } = require('./push');
initializeApp();
const db = getFirestore();

async function notify(eventId, userId, title, body, target, community = false, notificationId) {
  if (!userId) return;
  const profile = await db.doc(`Users/${userId}`).get();
  const preferences = profile.data()?.preferences;
  if (!preferences?.pushEnabled || (community && preferences.communityUpdates === false)) return;
  const devices = await db.collection(`Users/${userId}/Devices`).where('enabled', '==', true).get();
  const deliveries = devices.docs.map((device) => ({ token: device.data().token, path: device.ref.path }));
  if (!deliveries.length) return;
  const id = createHash('sha256').update(`${eventId}:${userId}`).digest('hex');
  const job = db.doc(`Push Jobs/${id}`);
  const claimed = await db.runTransaction(async (transaction) => {
    const saved = await transaction.get(job);
    if (saved.data()?.status === 'sent') return false;
    if (saved.data()?.status === 'sending' && Date.now() - saved.data().startedAt < 120000) throw new Error('Push delivery is already running; retry later.');
    transaction.set(job, { status: 'sending', startedAt: Date.now(), userId });
    return true;
  });
  if (!claimed) return;
  try {
    await sendPushBatch(deliveries, { title, body, data: { target, userId, notificationId } }, {
      fetch,
      disable: (path) => db.doc(path).set({ enabled: false }, { merge: true }),
      receipt: (ticketId, path) => db.doc(`Push Receipts/${ticketId}`).set({ devicePath: path, createdAt: Date.now() }),
    });
    await job.set({ status: 'sent', completedAt: Date.now() }, { merge: true });
  } catch (error) {
    await job.set({ status: 'failed' }, { merge: true });
    throw error;
  }
}
const options = (document) => ({ document, retry: true });
exports.messagePush = onDocumentCreated(options('Messages/{id}'), async (event) => {
  const message = event.data?.data();
  if (!message || message.senderId === message.receiverId) return;
  await notify(event.id, message.receiverId, 'New message', `${message.senderName}: ${message.text}`, { page: 'message', sellerId: message.senderId, sellerName: message.senderName, ...(message.listingId ? { listingId: message.listingId } : {}), ...(message.serviceId ? { serviceId: message.serviceId } : {}) }, false, `message-${event.params.id}`);
});
exports.reviewPush = onDocumentCreated(options('Reviews/{id}'), async (event) => {
  const review = event.data?.data();
  if (review) await notify(event.id, review.reviewedUserId, 'Review received', `${review.reviewerName} left you a ${review.rating}-star review.`, { page: 'reviews', userId: review.reviewedUserId }, false, `review-${event.params.id}`);
});
exports.communityPush = onDocumentCreated(options('Community Posts/{id}'), async (event) => {
  const post = event.data?.data();
  if (!post) return;
  // Paginate to avoid loading the whole member list into one function invocation.
  let cursor;
  while (true) {
    let source = db.collection('Users').orderBy('__name__').limit(100);
    if (cursor) source = source.startAfter(cursor);
    const users = await source.get();
    if (users.empty) break;
    for (const user of users.docs) if (user.id !== post.userId) await notify(event.id, user.id, 'Neighbourhood update', post.title, { page: 'community', id: event.params.id }, true, `post-${event.params.id}`);
    cursor = users.docs.at(-1);
  }
});
exports.commentPush = onDocumentCreated(options('Post Comments/{id}'), async (event) => {
  const comment = event.data?.data();
  if (!comment) return;
  const post = (await db.doc(`Community Posts/${comment.postId}`).get()).data();
  if (post && post.userId !== comment.userId) await notify(event.id, post.userId, 'New comment', `${comment.userName}: ${comment.content}`, { page: 'community', id: comment.postId }, false, `comment-${event.params.id}`);
});
exports.likePush = onDocumentCreated(options('Post Likes/{id}'), async (event) => {
  const like = event.data?.data();
  if (!like) return;
  const post = (await db.doc(`Community Posts/${like.postId}`).get()).data();
  if (post && post.userId !== like.userId) await notify(event.id, post.userId, 'Post liked', `A neighbour liked “${post.title}”.`, { page: 'community', id: like.postId }, false, `like-${event.params.id}`);
});
exports.checkPushReceipts = onSchedule('every 15 minutes', async () => {
  const pending = await db.collection('Push Receipts').where('createdAt', '<', Date.now() - 900000).limit(1000).get();
  if (pending.empty) return;
  const response = await fetch('https://exp.host/--/api/v2/push/getReceipts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: pending.docs.map((item) => item.id) }), signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Receipt request failed (${response.status}).`);
  const result = await response.json();
  if (result.errors?.length) throw new Error('Expo receipt request returned an error.');
  for (const item of pending.docs) {
    const receipt = result.data?.[item.id];
    if (!receipt && Date.now() - item.data().createdAt < 86400000) continue;
    if (receipt?.details?.error === 'DeviceNotRegistered') await db.doc(item.data().devicePath).set({ enabled: false }, { merge: true });
    if (receipt?.status === 'error') console.error('Push receipt error', receipt.details?.error);
    await item.ref.delete();
  }
  const oldJobs = await db.collection('Push Jobs').where('completedAt', '<', Date.now() - 7 * 86400000).limit(400).get();
  const batch = db.batch();
  oldJobs.docs.forEach((job) => batch.delete(job.ref));
  await batch.commit();
});
