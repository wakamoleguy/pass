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
    crypt.handleRequest(request, event).then(response => {
      event.respondWith(response);
    }, err => {
      event.respondWith(new Response(null, {
        status: 500,
        statusText: 'Internal Server Error'
      }));
    });
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

  handleRequest(request) {
    return new Promise((resolve, reject) => {
      let url = new URL(request.url);

      // Validate the URL
      console.log('matching', url.pathname, this.parser);
      let match = url.pathname.match(this.parser);
      if (match === null) {
        reject(new Error('Invalid URL detected! ' + url.toString()));
      }

      // Determine the operation
      let key = match[1];
      let value = request;
      if (key === undefined) {
        // Browse or Add

        if (request.method === 'GET') {

          resolve(this.browse());
        } else if (request.method === 'POST') {

          // TODO - get key, value from POST
          resolve(this.add(key, value));
        } else {

          reject(new Error('Undefined operation! ' +
                           request.method + ' to ' + request.pathname));
        }

      } else {
        // Read, Edit, or Delete
        if (request.method === 'GET') {

          resolve(this.read(key));
        } else if (request.method === 'PUT') {

          // TODO - get value from PUT
          resolve(this.edit(key, value));
        } else if (request.method === 'DELETE') {

          resolve(this.delete(key));
        } else {

          reject(new Error('Undefined operation! ' +
                           request.method + ' to ' + request.pathname));
        }
      }

    });
  },

  browse() {
    console.log('imunna browse');
    return new Response(null, {
      status: 501,
      statusText: 'Not Yet Implemented'
    });
  },

  read(key) {
    console.log('imunna read', key);
    return new Response(null, {
      status: 501,
      statusText: 'Not Yet Implemented'
    });
  },

  edit(key, value) {
    console.log('imunna edit', key, value);
    return new Response(null, {
      status: 501,
      statusText: 'Not Yet Implemented'
    });
  },

  add(key, value) {
    console.log('imunna add', key, value);
    return new Response(null, {
      status: 501,
      statusText: 'Not Yet Implemented'
    });
  },

  delete(key) {
    console.log('imunna delete', key);
    return new Response(null, {
      status: 501,
      statusText: 'Not Yet Implemented'
    });
  },

};
