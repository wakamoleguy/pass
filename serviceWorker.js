'use strict';

var crypt;

/**
 *
 * Installation and activation
 *
 */

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

/**
 *
 * Fetching and Caching
 *
 */
self.addEventListener('fetch', event => {
  // … Perhaps respond to this fetch in a useful way?
  var request            = event.request;
  var url                = new URL(request.url);
  console.log("Service worker handling fetch?", url.toString());

  if (url.hostname === 'crypt.invalid') {
    console.log('Passing to crypt');
    crypt.handleRequest(request);
  } else {
    console.log('Normal fetch');
  }

  /*
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
  */
});


/**
 * Crypt BREAD API
 *
 * Root Path:  /api/crypt
 *
 * Browse - GET    /api/crypt/
 * Read   - GET    /api/crypt/github.com
 * Edit   - PUT    /api/crypt/github.com
 * Add    - POST   /api/crypt/
 * Delete - DELETE /api/crypt/github.com
 */
crypt = {
  root: '/api/crypt/',
  parser: new RegExp('^/api/crypt/(?:([^/?#]*)/)?$'),

  handleRequest: function handleRequest(request) {
    let url = new URL(request.url);

    // Validate the URL
    console.log('matching', url.pathname, this.parser);
    let match = url.pathname.match(this.parser);
    if (match === null) {
      throw new Error('Invalid URL detected! ' + url.toString());
    }

    // Determine the operation
    let key = match[1];
    let value = request;
    if (key === undefined) {
      // Browse or Add

      if (request.method === 'GET') {

        return this.browse();
      } else if (request.method === 'POST') {

        // TODO - get key, value from POST
        return this.add(key, value);
      } else {

        throw new Error('Undefined operation! ' +
                        request.method + ' to ' + request.pathname);
      }

    } else {
      // Read, Edit, or Delete
      if (request.method === 'GET') {

        return this.read(key);
      } else if (request.method === 'PUT') {

        // TODO - get value from PUT
        return this.edit(key, value);
      } else if (request.method === 'DELETE') {

        return this.delete(key);
      } else {

        throw new Error('Undefined operation! ' +
                        request.method + ' to ' + request.pathname);
      }
    }

  },

  browse() {
    console.log('imunna browse');
  },

  read: function read(key) {
    console.log('imunna read', key);
  },

  edit: function edit(key, value) {
    console.log('imunna edit', key, value);
  },

  add: function add(key, value) {
    console.log('imunna add', key, value);
  },

  delete: function deleteCrypt(key) {
    console.log('imunna delete', key);
  },

};
