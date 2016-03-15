(function () {
  'use strict';

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
   * Sets up a new CryptApp client
   *
   * @param {String} name The name of your new CryptApp client.
   * @param {} models.crypt The encryption storage backend to use
   * @param {} views.password The view to display passwords
   */
  function CryptApp(name, models, views) {
    this.cryptModel = models.crypt;
    this.passwordView = views.password;

    // Wire stuff together now, please.
    this.passwordView.dobrowse = this.cryptModel.browse.bind(this.cryptModel);
    this.passwordView.doread = this.cryptModel.read.bind(this.cryptModel);
    this.passwordView.doedit = this.cryptModel.edit.bind(this.cryptModel);
    this.passwordView.doadd = this.cryptModel.add.bind(this.cryptModel);
    this.passwordView.dodel = this.cryptModel.del.bind(this.cryptModel);
    this.passwordView.dodump = this.cryptModel.dump.bind(this.cryptModel);
  }


  let crypt = new CryptApp('crypt-app', {
    crypt: new app.Crypt(),
  }, {
    password: new app.PasswordView()
  });

  app.crypt = crypt;

})();
