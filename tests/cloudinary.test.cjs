const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
function load(path, globals) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports, ...globals });
  return exports;
}
test('iOS photo uploads serialize through Expo multipart and surface provider errors', async () => {
  const { convertFormDataAsync } = load('node_modules/expo/src/winter/fetch/convertFormData.ts', {
    Blob, TextEncoder, Uint8Array, require: () => ({ blobToArrayBufferAsync: blob => blob.arrayBuffer() }),
  });
  class LocalFile {
    constructor(uri) { this.uri = uri; this.name = 'photo.png'; this.type = 'image/png'; }
    async bytes() { return new TextEncoder().encode('actual-photo-bytes'); }
  }
  class Multipart {
    parts = [];
    append(name, value) { this.parts.push([name, value]); }
    entries() { return this.parts; }
  }
  let fail = false;
  const api = load('src/lib/cloudinary.ts', {
    process: { env: { EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME: 'test-cloud', EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET: 'photos' } },
    FormData: Multipart, AbortController, setTimeout, clearTimeout,
    require: name => name === 'react-native' ? { Platform: { OS: 'ios' } } : { File: LocalFile },
    fetch: async (url, options) => {
      assert.equal(url, 'https://api.cloudinary.com/v1_1/test-cloud/image/upload');
      const encoded = await convertFormDataAsync(options.body, 'test-boundary');
      const body = new TextDecoder().decode(encoded.body);
      assert.match(body, /actual-photo-bytes/);
      assert.match(body, /photos/);
      assert.match(body, /image\/png/);
      return { ok: !fail, json: async () => fail ? { error: { message: 'Preset rejected' } } : { secure_url: 'https://res.cloudinary.com/test/photo.png' } };
    },
  });
  assert.equal(await api.uploadCloudinaryImage('file:///photo.png'), 'https://res.cloudinary.com/test/photo.png');
  fail = true;
  await assert.rejects(api.uploadCloudinaryImage('file:///photo.png'), /Preset rejected/);
});
