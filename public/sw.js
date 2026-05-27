const BASE = '/woodflow';

const CACHE_NAME = 'woodflow-cache-v1';
const urlsToCache = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Strip the base path for cache matching
  let cacheKey = event.request;
  if (url.pathname.startsWith(BASE)) {
    cacheKey = BASE + url.pathname.slice(BASE.length) || BASE + '/';
  }
  event.respondWith(
    caches.match(cacheKey)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
