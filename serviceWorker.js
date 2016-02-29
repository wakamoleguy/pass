'use strict';

self.addEventListener('install', event => {
  // Do install stuff
  console.log('installing', new Date());

  function prefillCache () {
    return caches.open('crypt').
      then(cache => {
        let response = new Response('{"key":"ABC123"}', {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        cache.put('/pass/super-secret-password.json', response);
        return;
      });
  }

  event.waitUntil(prefillCache(event));
});

self.addEventListener('activate', event => {
  // Do activate stuff: This will come later on.
  console.log('activating', new Date());
});


self.addEventListener('fetch', event => {
  // … Perhaps respond to this fetch in a useful way?
  console.log("Service worker handling fetch?");

  function shouldHandleFetch (event) {
    // Should we handle this fetch?
    var request            = event.request;
    var url                = new URL(request.url);
    var criteria           = {
      matchesPathPattern: url.pathname === '/pass/super-secret-password.json',
      isGETRequest      : request.method === 'GET',
      isFromMyOrigin    : url.origin === self.location.origin
    };
    console.log('Cache criteria', criteria, url);

    // Create a new array with just the keys from criteria that have
    // failing (i.e. false) values.
    var failingCriteria    = Object.keys(criteria).
      filter(criteriaKey => !criteria[criteriaKey]);

    // If that failing array has any length, one or more tests failed.
    return !failingCriteria.length;
  }

  function fetchFromCache(event) {
    return caches.match(event.request).then(response => {
      if (!response) {
        throw Error('${event.request.url} not found in cache');
      }
      return response;
    })
  }

  function onFetch (event) {
    console.log("Using fetch for request", event);
    event.respondWith(fetchFromCache(event));
  }

  if (shouldHandleFetch(event)) {
    onFetch(event);
  }
});
