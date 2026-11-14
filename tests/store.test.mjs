import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, defaultState, STORAGE_KEY } from '../site/js/engine/store.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
    data,
  };
}

test('estado inicial vazio', () => {
  const store = createStore(memoryStorage());
  const s = store.get();
  assert.equal(s.xp, 0);
  assert.equal(s.name, '');
  assert.deepEqual(s.lessons, {});
  assert.deepEqual(s.achievements, []);
  assert.equal(s.settings.theme, 'dark');
  assert.equal(STORAGE_KEY, 'devtrilhas:v1');
});

test('update persiste no storage', () => {
  const storage = memoryStorage();
  const store = createStore(storage);
  store.update((s) => { s.xp = 42; s.lessons['python/m1/l1'] = true; });
  const reloaded = createStore(storage);
  assert.equal(reloaded.get().xp, 42);
  assert.equal(reloaded.get().lessons['python/m1/l1'], true);
});

test('storage nulo funciona em memoria', () => {
  const store = createStore(null);
  store.update((s) => { s.xp = 5; });
  assert.equal(store.get().xp, 5);
  assert.equal(store.persistent, false);
});

test('JSON corrompido volta ao estado inicial sem lancar', () => {
  const storage = memoryStorage({ 'devtrilhas:v1': '{nao e json' });
  const store = createStore(storage);
  assert.equal(store.get().xp, 0);
  assert.equal(store.recovered, true);
});

test('storage que lanca excecao nao quebra', () => {
  const storage = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
    removeItem() {},
  };
  const store = createStore(storage);
  store.update((s) => { s.xp = 1; });
  assert.equal(store.get().xp, 1);
  assert.equal(store.persistent, false);
});

test('campos ausentes sao preenchidos com padroes', () => {
  const storage = memoryStorage({ 'devtrilhas:v1': JSON.stringify({ xp: 10 }) });
  const s = createStore(storage).get();
  assert.equal(s.xp, 10);
  assert.deepEqual(s.quizzes, {});
  assert.equal(s.streak.count, 0);
});

test('export e import preservam o progresso', () => {
  const a = createStore(memoryStorage());
  a.update((s) => { s.xp = 300; s.name = 'Ana'; });
  const json = a.exportJSON();
  const b = createStore(memoryStorage());
  b.importJSON(json);
  assert.equal(b.get().xp, 300);
  assert.equal(b.get().name, 'Ana');
});

test('import rejeita formato invalido', () => {
  const store = createStore(memoryStorage());
  assert.throws(() => store.importJSON('lixo'), /inválido/);
  assert.throws(() => store.importJSON('[1,2]'), /inválido/);
  assert.throws(() => store.importJSON(JSON.stringify({ xp: 'muito' })), /inválido/);
  assert.equal(store.get().xp, 0);
});

test('subscribe recebe atualizacoes e reset limpa', () => {
  const store = createStore(memoryStorage());
  let calls = 0;
  store.subscribe(() => { calls++; });
  store.update((s) => { s.xp = 9; });
  store.reset();
  assert.equal(calls, 2);
  assert.equal(store.get().xp, 0);
  assert.deepEqual(defaultState().exercises, {});
});
