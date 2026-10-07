const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
test('registration after auth profile creation updates only the permitted name field', async () => {
  let saved; const writes = [];
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/userProfile.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, require: name => name === './firebase' ? { db: {} } : {
      doc: () => ({}), runTransaction: async (_db, action) => action({
        get: async () => ({ exists: () => !!saved, data: () => saved }),
        set: (_ref, value) => { saved = value; writes.push('create'); },
        update: (_ref, value) => { assert.deepEqual(Object.keys(value), ['fullName']); saved = { ...saved, ...value }; writes.push('update'); },
      }),
    },
  });
  const user = { id: 'u1', fullName: 'Neighbour', email: 'person@example.com', location: 'Your Neighbourhood', verificationStatus: 'pending', rating: 0 };
  await exports.ensureUserProfile(user);
  const createdAt = saved.createdAt;
  saved.rating = 4; saved.verificationStatus = 'verified';
  const result = await exports.ensureUserProfile({ ...user, fullName: 'Person' }, true);
  assert.equal(result.fullName, 'Person'); assert.equal(result.rating, 4);
  assert.equal(saved.verificationStatus, 'verified'); assert.equal(saved.createdAt, createdAt);
  await exports.ensureUserProfile(user);
  assert.deepEqual(writes, ['create', 'update']);
});
