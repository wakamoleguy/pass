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
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Do activate stuff: This will come later on.
  console.log('activating', new Date());
  self.clients.claim();
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

  if (url.hostname === 'crypt.invalid') {
    event.respondWith(crypt.handleRequest(request, event).catch(err => new Response('', {
      status: 500,
      statusText: 'Internal Server Error'
    })));
  }
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
  cache: 'crypt',

  putCache(key, value) {
    return caches.open(this.cache).then(cache => {
        let response = new Response(JSON.stringify({
          value: value
        }), {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        cache.put('https://crypt.invalid/api/crypt/'+key+'/', response);
        return;
      });
  },

  getCache(key) {
    return caches.match('https://crypt.invalid/api/crypt/'+key+'/').then(response => {
      return response || new Response(undefined, {
          status: 404,
          statusText: 'Item Not Found'
      });
    });
  },

  deleteCache(key) {
    return caches.open('crypt').then(cache => {
      return cache.delete('https://crypt.invalid/api/crypt/'+key+'/');
    }).then(deleted => {
      if (deleted) {
        return new Response(undefined, {
          status: '204',
          statusText: 'No Content'
        });
      } else {
        return new Response('', {
          status: '404',
          statusText: 'Not Found'
        });
      }
    });
  },

  handleRequest(request) {
    return new Promise((resolve, reject) => {
      let url = new URL(request.url);

      // Validate the URL
      let match = url.pathname.match(this.parser);
      if (match === null) {
        reject(new Error('Invalid URL detected! ' + url.toString()));
      }

      // Determine the operation
      let key = match[1];
      if (key === undefined) {
        // Browse or Add

        if (request.method === 'GET') {

          resolve(this.browse());
        } else if (request.method === 'POST') {

          // TODO - get key, value from POST
          resolve(this.add(request));
        } else {

          reject(new Error('Undefined operation! ' +
                           request.method + ' to ' + request.pathname));
        }

      } else {
        // Read, Edit, or Delete
        if (request.method === 'GET') {

          resolve(this.read(request, key));
        } else if (request.method === 'PUT') {

          // TODO - get value from PUT
          resolve(this.edit(request, key));
        } else if (request.method === 'DELETE') {

          resolve(this.delete(request, key));
        } else {

          reject(new Error('Undefined operation! ' +
                           request.method + ' to ' + request.pathname));
        }
      }

    });
  },

  browse() {
    return caches.open(this.cache).
      then(cache => cache.keys()).
      then(keys => new Response(JSON.stringify(keys.map(req => req.url))));
  },

  read(request, key) {
    return this.getCache(key);
  },

  edit(request, key) {
    return new Response('', {
      status: 501,
      statusText: 'Not Yet Implemented'
    });
  },

  add(request) {
    return request.json().then(data => {
      let k = data.key;
      let v = data.value;

      return this.putCache(k, v).then(_ => (
        new Response(`/api/crypt/${k}/`, {
          status: 201,
          statusText: 'Created'
        })
      ));
    });
  },

  delete(request, key) {
    return this.deleteCache(key);
  },

};
