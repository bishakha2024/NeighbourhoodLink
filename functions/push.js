async function sendPushBatch(devices, notification, dependencies) {
  const valid = devices.filter((device) => typeof device.token === 'string' && /^(ExponentPushToken|ExpoPushToken)\[[^\]]+\]$/.test(device.token));
  for (let offset = 0; offset < valid.length; offset += 100) {
    const chunk = valid.slice(offset, offset + 100);
    const response = await dependencies.fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chunk.map((device) => ({ to: device.token, sound: 'default', channelId: 'default', ...notification }))),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`Push request failed (${response.status}).`);
    const result = await response.json();
    if (result.errors?.length || !Array.isArray(result.data) || result.data.length !== chunk.length) throw new Error('Expo returned an invalid push response.');
    for (let i = 0; i < chunk.length; i++) {
      const ticket = result.data[i];
      if (ticket.status === 'ok' && ticket.id) await dependencies.receipt(ticket.id, chunk[i].path);
      else if (ticket.details?.error === 'DeviceNotRegistered') await dependencies.disable(chunk[i].path);
      else throw new Error(`Push delivery rejected: ${ticket.details?.error ?? ticket.message ?? 'unknown error'}`);
    }
  }
}
module.exports = { sendPushBatch };
