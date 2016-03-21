(function () {
  'use strict';

  let domain = 'TODO - put domain here';

  function Sync() {
  }

  Sync.prototype = {
    /* Enter your PIN, connect, and discover endpoints */
    register(pin, display) {
      this.ua = new SIP.UA({
        uri: '' + pin + '@' + domain,
        displayName: display,
        traceSip: true
      });

      this.ua.on('registered', response => {
        if (!response) return;
        let contacts = response.getHeaders('Contact');
        if (contacts.length > 1) {
          console.log('I am not first');
          this.ua.unregister();
          this.session = this.ua.invite('' + pin + '@' + domain, {
            media: {
              constraints: {},
              dataChannel: true
            }
          });
          this.session.on('accepted', response => {
            this.session.data.remote_fingerprint = this.getfingerprint(response.body);
            this.session.data.local_fingerprint = this.getfingerprint(this.session.request.body);
            if (this.session.mediaHandler.dataChannel) {
              this.verify();
            } else {
              this.session.mediaHandler.on('dataChannel', _ => this.verify());
            }
          });

        } else {
          console.log('Nobody here yet');
          this.ua.on('invite', session => {
            this.ua.unregister();
            this.session = session;

            this.session.mediaHandler.on('getDescription', sdp => {
              this.session.data.local_fingerprint = this.getfingerprint(sdp.sdp);
              this.session.data.remote_fingerprint = this.getfingerprint(this.session.request.body);
            });

            this.session.mediaHandler.on('dataChannel', _ => this.verify());

            this.session.accept({
              media: {
                constraints: {},
                dataChannel: true
              }
            });
          });
        }


      });
    },

    /* Verify dtls fingerprint */
    getfingerprint(sdp) {
      let parser = /\r\na=fingerprint.* (.*)\r\n/;
      let match = sdp.match(parser);
      return (match && match.length >= 2) ? match[1] : null;
    },

    verify() {
      console.log('Please manually verify!');
      console.log('You are: ', this.session.data.local_fingerprint);
      console.log('They are: ', this.session.data.remote_fingerprint);
    },

    stop() {
      this.ua.stop();
    }
  };

  app.Sync = Sync;

})();
