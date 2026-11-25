const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('activation removes only old profile caches', async () => {
  const handlers = {};
  const deleted = [];
  let claimed = false;
  let keys = [];
  const self = {
    addEventListener: (type, handler) => { handlers[type] = handler; },
    clients: { claim: async () => { claimed = true; } }
  };
  const context = vm.createContext({
    self, URL, caches: {
      keys: async () => keys,
      delete: async key => { deleted.push(key); }
    }
  });
  vm.runInContext(fs.readFileSync('sw.js', 'utf8'), context);
  const current = vm.runInContext('CACHE', context);
  assert.match(current, /^self-documentary-v[1-9]\d*$/);
  const version = Number(current.split('-v').at(-1));
  const old = ['self-documentary-v0', 'self-documentary-v' + (version - 1)].filter((key, index, list) => list.indexOf(key) === index);
  keys = [...old, current, 'keep-cache', 'clipboard-cache'];
  let pending;
  handlers.activate({ waitUntil: task => { pending = task; } });
  await pending;
  assert.deepEqual(deleted, old);
  assert.equal(claimed, true);
});
test('manifest pages exist', () => {
  const pages = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  for (const page of pages) for (const file of [page.file, ...(page.parts || [])]) assert.ok(fs.existsSync(file), file);
});
