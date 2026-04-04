// ─── CACHÉ: cambia automáticamente con cada deploy del HTML ───
const BASE_CACHE = 'sudoku-dark';
const BUILD_VERSION = '__BUILD_VERSION__'; // el HTML lo reemplaza en tiempo real
let CACHE_NAME = `${BASE_CACHE}-${BUILD_VERSION}`;

const FILES_TO_CACHE = [
  './Sudoku_Dark.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ─── INSTALACIÓN ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// ─── ACTIVACIÓN: borra TODOS los cachés viejos de esta app ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(k => k.startsWith(BASE_CACHE) && k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] 🗑 Borrando caché viejo:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH: Network First, cache solo como fallback offline ───
// { cache: 'no-store' } evita que el navegador sirva respuestas HTTP cacheadas
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// ─── MENSAJES ───
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
