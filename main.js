(function () {
  /***
   *
   * Feature detection!
   *
   **/

  if (!('serviceWorker' in navigator)) {
    throw new Error('ServiceWorker API is required.');
  }

  if (!self.fetch) {
    throw new Error('Fetch API is required.');
  }

  /**
   *
   * Initialization.
   *
   */
  var initialized = new Promise((resolve, reject) => {
    console.log('Initializing...');
    navigator.serviceWorker.register('serviceWorker.js', {
      scope: '/pass/'
    }).then(_ => {
      console.log('Initialized');
      resolve();
    }).catch(reject);
  });

  /**
   * console commands for convenience
   */
  function printDone(message) {
    console.log(message);
    console.log('Done.');
  };

  console.browse = function () {
    console.log('Trying...');
    crypt.browse().then(printDone);
  };

  console.read = function (key) {
    console.log('Trying...');
    crypt.read(key).then(printDone);
  };

  console.edit = function (key) {
    console.log('Not trying...I have not written that yet.');
  };

  console.add = function (key, value) {
    console.log('Trying...');
    crypt.add(key, value).then(printDone);
  };

  console.del = function (key) {
    console.log('Trying...');
    crypt.del(key).then(printDone);
  };

  /**
   *
   * Storage API
   *
   */
  crypt = {
    root: 'https://crypt.invalid/api/crypt/',

    decrypt(plaintext) {
      return plaintext.split('').reverse().join('');
    },

    encrypt(ciphertext) {
      return ciphertext.split('').reverse().join('');
    },

    browse() {
      return fetch(this.root).then(response => {
        if (response.status === 200) {

          return response.json();
        } else {

          return [];
        }
      });
    },

    read(key) {
      return fetch(this.root + key + '/').then(response => {

        if (response.status === 200) {

          return response.json().then(json => {

            return this.decrypt(json.value);
          });
        } else {

          return null;
        }
      });
    },

    edit() {
      console.warn('Not implemented.');
    },

    add(key, value) {
      let data = {
        key: key,
        value: this.encrypt(value)
      };

      return fetch(this.root, {
        method: 'POST',
        body: JSON.stringify(data)
      }).then(response => (response.status === 201));
    },

    del(key) {
      return fetch(this.root + key + '/', {
        method: 'DELETE'
      }).then(response => (response.status === 204));
    }
  };

})();
