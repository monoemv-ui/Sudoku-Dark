const CACHE_NAME = 'sudoku-dark-v4';
const FILES_TO_CACHE = [
  './Sudoku_Dark.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalación: guarda los archivos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting(); // Activa el nuevo SW inmediatamente sin esperar
});

// Activación: limpia cachés viejos automáticamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('[SW] Eliminando caché viejo:', k);
        return caches.delete(k);
      }))
    )
  );
  self.clients.claim(); // Toma control de todas las pestañas abiertas
});

// Fetch: estrategia "Network First, fallback to Cache"
// Intenta obtener la versión más reciente de la red.
// Si no hay red (offline), usa la caché.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la respuesta es válida, actualiza la caché con la versión fresca
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Sin red → sirve desde caché
        return caches.match(event.request);
      })
  );
});

// Escucha mensajes desde la app (para forzar actualización manual si se quiere)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
