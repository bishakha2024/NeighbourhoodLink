const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sendPushBatch } = require('./push');
const device = (id) => ({ token: `ExpoPushToken[${id}]`, path: `Users/me/Devices/${id}` });
test('push delivery batches at 100 and records receipts', async () => {
  const sizes = []; const receipts = [];
  await sendPushBatch(Array.from({ length: 105 }, (_, i) => device(i)), { title: 'New message', data: { target: { page: 'messages' } } }, {
    fetch: async (_url, request) => { const messages = JSON.parse(request.body); sizes.push(messages.length); return { ok: true, json: async () => ({ data: messages.map((item) => ({ status: 'ok', id: item.to })) }) }; },
    receipt: async (id, path) => receipts.push({ id, path }), disable: async () => assert.fail('Unexpected disable'),
  });
  assert.deepEqual(sizes, [100, 5]); assert.equal(receipts.length, 105);
});
test('unregistered devices are disabled and malformed tokens are excluded', async () => {
  const disabled = [];
  await sendPushBatch([device('valid'), { token: 'invalid', path: 'bad' }], { title: 'Test' }, {
    fetch: async (_url, request) => { assert.equal(JSON.parse(request.body).length, 1); return { ok: true, json: async () => ({ data: [{ status: 'error', details: { error: 'DeviceNotRegistered' } }] }) }; },
    receipt: async () => assert.fail('Unexpected receipt'), disable: async (path) => disabled.push(path),
  });
  assert.deepEqual(disabled, ['Users/me/Devices/valid']);
});
test('network and provider failures propagate for retry', async () => {
  await assert.rejects(sendPushBatch([device('a')], {}, { fetch: async () => ({ ok: false, status: 503 }) }), /503/);
  await assert.rejects(sendPushBatch([device('a')], {}, { fetch: async () => ({ ok: true, json: async () => ({ errors: [{ code: 'RATE_LIMIT' }] }) }) }), /invalid/);
});
