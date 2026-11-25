const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('activation removes only old profile caches', async () => {
  const handlers = {};
  const deleted = [];
  const self = {
    addEventListener: (type, handler) => { handlers[type] = handler; },
    clients: { claim: async () => {} }
  };
  vm.runInNewContext(fs.readFileSync('sw.js', 'utf8'), {
    self, URL, caches: {
      keys: async () => ['self-documentary-v9', 'self-documentary-v10', 'self-documentary-v11', 'self-documentary-v12', 'self-documentary-v13', 'self-documentary-v14', 'self-documentary-v15', 'self-documentary-v16', 'self-documentary-v17', 'self-documentary-v18', 'self-documentary-v19', 'keep-cache', 'clipboard-cache'],
      delete: async key => { deleted.push(key); }
    }
  });
  let pending;
  handlers.activate({ waitUntil: task => { pending = task; } });
  await pending;
  assert.deepEqual(deleted, ['self-documentary-v9', 'self-documentary-v10', 'self-documentary-v11', 'self-documentary-v12', 'self-documentary-v13', 'self-documentary-v14', 'self-documentary-v15', 'self-documentary-v16', 'self-documentary-v17', 'self-documentary-v18']);
});
test('manifest pages exist', () => {
  const pages = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  for (const page of pages) assert.ok(fs.existsSync(page.file), page.file);
});
