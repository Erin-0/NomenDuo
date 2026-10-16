const CACHE_NAME = 'nomenduo-v6'; // Version bumped to force the update
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './duo-win.png',
  './icon-192-v2.png',
  './icon-512-v2.png',
  './tuco-get-out.mp3' 
  // Removed duo-lose.png just in case it doesn't exist on your server
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // "Forgiving" cache: If one file is missing, it skips it but still caches the rest!
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.warn('Failed to cache:', url));
        })
      );
    })
    // Removed self.skipWaiting() here so the app waits for the user's click
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    // ignoreSearch: true prevents URL parameters from breaking the cache
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html', { ignoreSearch: true });
        }
      });
    })
  );
});

// Listen for the "Update" button click from your Custom Notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting(); // This triggers the update ONLY when the user clicks the button
  }
});
