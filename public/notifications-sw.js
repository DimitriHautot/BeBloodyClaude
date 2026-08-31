// Minimal service worker whose only job is to let the page display system
// notifications via `registration.showNotification()` — required on some
// browsers (e.g. Chrome on Android disallows the `Notification` constructor
// directly from a page). There is no backend for this app, so there is no
// push handling here: notifications are only ever triggered by the page
// itself, while it's open, via postMessage below.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'show-notification') return;
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body }));
});
