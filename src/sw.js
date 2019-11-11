// Cache the Hacker News API responses files with a cache first strategy for 1 day.

importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js',
);

workbox.core.skipWaiting();

workbox.core.clientsClaim();

workbox.precaching.precacheAndRoute([]);

workbox.routing.registerNavigationRoute('__PUBLIC/index.html');

workbox.routing.registerRoute(
  new RegExp(/https:\/\/hacker-news\.firebaseio\.com\/v0\/item\/\d*\.json/),
  new workbox.strategies.CacheFirst({
    cacheName: 'hacker-news-offline',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  }),
);
