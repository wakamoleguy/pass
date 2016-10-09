(function () {
  'use strict';

  let pubkey = null;
  let privkey = null;

  let options = {
    userIds: [{ name: 'Will Mitchell', email: 'wakamoleguy@gmail.com' }],
    numBits: 1024,
    passphrase: null
  };

  let root = 'https://crypt.invalid/api/crypt/';
  let certURL = 'https://crypt.invalid/api/cert/';

  function initWorkers() {
    openpgp.initWorker({ path: 'openpgp/openpgp.worker.js' });

    return navigator.serviceWorker.register('serviceWorker.js', {
      scope: '/pass/'
    }).then(_ => (console.log('Service Worker initialized.')));
  }

  function acquireCert() {
    console.log('Initializing OpenPGP');
    openpgp.initWorker({ path: 'openpgp/openpgp.worker.js' });

    console.log('Checking for saved certificate');
    return crypt.getCert();
  }

  function CryptModel() {
    this.doaddok = () => {};
    this.initialized = new Promise((resolve, reject) => {
      console.log('Initializing...');
      openpgp.initWorker({ path: 'openpgp/openpgp.worker.js' });

      return navigator.serviceWorker.register('serviceWorker.js', {
        scope: '/pass/'
      }).
        then(_ => (console.log('Service Worker initialized.'))).
        then(_ => {
          return new Promise((res, rej) => {
            setTimeout(res, 100);
          });
        }).
        then(_ => {

          console.log('Initializing OpenPGP');
          openpgp.initWorker({ path: 'openpgp/openpgp.worker.js' });

          console.log('Checking for saved certificate');
          return this.getCert();
        }).
        then(key => {

          if (key === null) {

            console.log('No certificate found.');
            console.log("Generating keypair...(" + options.numBits + ")");

            return new Promise((resolve, reject) => {

              if (options.passphrase === null) {
                this.doprompt(
                  'Enter New Passphrase',
                  'Press cancel if you will be syncing from another device'
                ).then((value) => {
                  options.passphrase = value;
                  resolve();
                });
              } else {
                resolve();
              }
            }).then(_ => {
              return options.passphrase !== null ?
                openpgp.generateKey(options).then(key => (this.putCert(key))) :
                true;
              });
          } else {

            console.log('Got keypair from cache.');
            pubkey = openpgp.key.readArmored(key.publicKeyArmored);
            privkey = openpgp.key.readArmored(key.privateKeyArmored);
            this.doaddok();
            return true;
          }
        }).
        then(_ => {

          console.log('Initialized');
          resolve();
        }).catch(reject);

    });
  }

  CryptModel.prototype = {
    initialized: null,

    decrypt(ciphertext) {
      return this.initialized.
        then(_ => {
          var key = privkey.keys[0];

          return (
            options.passphrase === null ?
              this.doprompt('Enter Passphrase', '').then((passphrase) => {
                options.passphrase = passphrase;
              }) :
              new Promise((resolve, reject) => resolve())
          ).then(_ => {

            key.decrypt(options.passphrase);
            return openpgp.decrypt({
              message: openpgp.message.readArmored(ciphertext),
              privateKey: key
            });
          });
        }).
        then(plaintext => plaintext.data).
        catch(console.log.bind(console));
    },

    encrypt(plaintext) {
      return this.initialized.
        then(_ => {
          return openpgp.encrypt({
            data: plaintext,
            publicKeys: pubkey.keys,
          });
        }).
        then(ciphertext => {
          console.log(ciphertext);
          return ciphertext.data;
        }).
        catch(console.log.bind(console));
    },

    browse() {
      return this.initialized.then(_ => {
        return fetch(root);
      }).
        then(response => ((response.status === 200) ? response.json() : [])).
        catch(console.log.bind(console));
    },

    read(key) {
      return this.initialized.then(_ => {
        return fetch(root + key + '/');
      }).
        then(response => {

          if (response.status === 200) {
            return response.json().then(json => (this.decrypt(json.value)));
          } else {
            return null;
          }
        }).
        catch(console.log.bind(console));
    },

    dump(key) {
      return this.initialized.then(_ => {
        return fetch(root + key + '/');
      }).
        then(response => {

          if (response.status === 200) {
            return response.json().then(json => json.value);
          } else {
            return null;
          }
        }).
        catch(console.log.bind(console));
    },

    edit() {
      console.warn('Not implemented.');
    },

    add(key, value, encrypted) {
      return this.initialized.then(_ => {
        return encrypted ? value : this.encrypt(value);
      }).
        then(ciphertext => {
          return {
            key: key,
            value: ciphertext
          };
        }).
        then(data => {
          return fetch(root, {
            method: 'POST',
            body: JSON.stringify(data)
          });
        }).
        then(response => (response.status === 201)).
        catch(console.log.bind(console));
    },

    del(key) {
      return this.initialized.then(_ => {
        return fetch(root + key + '/', {
          method: 'DELETE'
        });
      }).
        then(response => (response.status === 204)).
        catch(console.log.bind(console));
    },

    /**
     * These are called from *within* the init promise chain,
     * so ***DO NOT*** require intialized before attempting them.
     */
    putCert(key) {
      return fetch(certURL, {
        method: 'PUT',
        body: JSON.stringify({
          publicKeyArmored: key.publicKeyArmored,
          privateKeyArmored: key.privateKeyArmored
        })
      }).then(response => {
        if (response.status === 200) {
          pubkey = openpgp.key.readArmored(key.publicKeyArmored);
          privkey = openpgp.key.readArmored(key.privateKeyArmored);
          this.doaddok();
        }
        return response.status === 200;
      });
    },

    getCert() {
      return fetch(certURL).then(response => {

        if (response.status === 200) {
          return response.json().then(json => json.value);
        } else {
          return null;
        }
      });
    },

    doprompt(title, description) {
        throw new Error("`doprompt` not implemented. Did you remember to wire it in main?");
    }
  };

  app.Crypt = CryptModel;
})();
