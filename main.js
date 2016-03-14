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
    openpgp.initWorker({ path:'openpgp/openpgp.worker.js' });

    navigator.serviceWorker.register('serviceWorker.js', {
      scope: '/pass/'
    }).then(_ => (console.log("Service Worker initialized."))).then(_ => {

      console.log('Initializing OpenPGP');
      openpgp.initWorker({ path: 'openpgp/openpgp.worker.js' });

      console.log('Checking for saved certificate');
      return crypt.getCert();
    }).then(key => {
      if (key === null) {
        console.log('No certificate found.');
        let options = {
          userIds: [{ name: 'Will Mitchell', email: 'wakamoleguy@gmail.com' }],
          numBits: 1024,
          passphrase: 'super secret'
        };

        console.log("Generating keypair...(" + options.numBits + ")");
        return openpgp.generateKey(options).then(key => {
          crypt.putCert(key);
          return key;
        });
      } else {
        console.log('Got keypair from cache.');
        return key;
      }
    }).then(key => {
      console.log("Keypair loaded.");
      crypt.pubkey = openpgp.key.readArmored(key.publicKeyArmored);
      crypt.privkey = openpgp.key.readArmored(key.privateKeyArmored);
      return true;
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
  }

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

  /* Overwrites default 'debug level' print */
  console.debug = function (key) {
    console.log('Debugging password key', key);
    crypt.dump(key).then(ciphertext => {
      if (ciphertext === null) {
        console.log('Fetch failed.  Ciphertext null.');
        console.log('Done.');
      } else {
        console.log('---Begin Ciphertext---');
        console.log(ciphertext);
        console.log('---End Ciphertext---');
        console.log('Decrypting...');
        crypt.decrypt(ciphertext).then(plaintext => {
          console.log('---Begin Plaintext---');
          console.log(plaintext);
          console.log('---End Plaintext---');
          console.log('Done.');
        });
      }
    });
  };

  /**
   *
   * Storage API
   *
   */
  crypt = {
    root: 'https://crypt.invalid/api/crypt/',
    certURL: 'https://crypt.invalid/api/cert/',

    // Set when initializing openpgp.js
    pubkey: null,
    privkey: null,

    decrypt(ciphertext) {
      var key = this.privkey.keys[0];
      key.decrypt('super secret');
      return openpgp.decrypt({
        message: openpgp.message.readArmored(ciphertext),
        privateKey: key
      }).then(plaintext => plaintext.data).catch(console.log.bind(console));
    },

    encrypt(plaintext) {
      return openpgp.encrypt({
        data: plaintext,
        publicKeys: this.pubkey.keys,
      }).then(ciphertext => {
        console.log(ciphertext);
        return ciphertext.data;
      });
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

    dump(key) {
      return fetch(this.root + key + '/').then(response => {

        if (response.status === 200) {
          return response.json().then(json => json.value);
        } else {
          return null;
        }
      });
    },

    edit() {
      console.warn('Not implemented.');
    },

    add(key, value) {
      return this.encrypt(value).then(ciphertext => {
        return {
          key: key,
          value: ciphertext
        };
      }).then(data => {
        return fetch(this.root, {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }).then(response => (response.status === 201));
    },

    del(key) {
      return fetch(this.root + key + '/', {
        method: 'DELETE'
      }).then(response => (response.status === 204));
    },

    putCert(key) {
      return fetch(this.certURL, {
        method: 'PUT',
        body: JSON.stringify({
          publicKeyArmored: key.publicKeyArmored,
          privateKeyArmored: key.privateKeyArmored
        })
      }).then(response => (response.status === 200));
    },

    getCert() {
      return fetch(this.certURL).then(response => {

        if (response.status === 200) {

          return response.json().then(json => json.value);
        } else {

          return null;
        }
      });
    }

  };

})();
