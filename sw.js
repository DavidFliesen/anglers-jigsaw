
const CACHE_NAME = 'anglers-jigsaw-v0-4';
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/data.js",
  "./js/app.js",
  "./assets/images/logo.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/fish/largemouth-bass.svg",
  "./assets/fish/bluegill.svg",
  "./assets/fish/channel-catfish.svg",
  "./assets/fish/rainbow-trout.svg",
  "./assets/fish/brook-trout.svg",
  "./assets/fish/red-drum.svg"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
