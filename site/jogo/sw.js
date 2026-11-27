// Guarda o jogo no aparelho para jogar sem internet depois da primeira visita.
const CACHE = 'faisca-v3';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './js/achievements.js',
  './js/audio.js',
  './js/config.js',
  './js/endless.js',
  './js/game.js',
  './js/input.js',
  './js/level.js',
  './js/levels/index.js',
  './js/levels/scenes.js',
  './js/levels/w1.js',
  './js/levels/w2.js',
  './js/levels/w3.js',
  './js/main.js',
  './js/physics.js',
  './js/render.js',
  './js/save.js',
  './js/sprites.js',
  './js/themes.js',
];

self.addEventListener('install', (e) => {
  // Um arquivo que falhe não derruba a instalação inteira: cada um é guardado à parte.
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(CORE.map((u) => fetch(u, { cache: 'reload' }).then((r) => (r.ok ? c.put(u, r) : null)))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Responde do cache na hora e atualiza em segundo plano (fontes do Google incluídas).
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !fonts) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: sameOrigin });
      const net = fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    }),
  );
});
