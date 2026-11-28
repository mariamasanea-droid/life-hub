/* Lifey service worker: push notifications only.
   There is deliberately NO fetch handler and NO cache: every page load goes to the network, so app updates land as before. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  var title = d.title || 'Lifey';
  var opts = { body: d.body || '', tag: d.tag || undefined, data: { url: d.url || './', kind: d.kind || '' } };
  e.waitUntil(self.registration.showNotification(title, opts).then(function () {
    return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  }).then(function (list) {
    list.forEach(function (c) { try { c.postMessage({ lifeyPush: 1, tag: opts.tag || '', kind: opts.data.kind }); } catch (x) {} });
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if ('focus' in c) { try { c.postMessage({ lifeyOpen: 1, url: url }); } catch (x) {} return c.focus(); }
    }
    return self.clients.openWindow ? self.clients.openWindow(url) : null;
  }));
});
