// Minimal app-shell service worker: enables "Add to Home Screen" install
// on Android and a light offline fallback. Network-first, cache as backup.
var CACHE = 'field-notes-v1';

self.addEventListener('install', function(event){
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(function(resp){
      var copy = resp.clone();
      caches.open(CACHE).then(function(cache){ cache.put(event.request, copy); }).catch(function(){});
      return resp;
    }).catch(function(){
      return caches.match(event.request);
    })
  );
});
