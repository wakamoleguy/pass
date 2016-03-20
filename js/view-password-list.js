(function () {
  'use strict';

  let el = {
    passlist: document.getElementById('pass-list')
  };

  let templateCache = {};

  function Template(id, tag, params) {
    let template = templateCache[id] ||
      (templateCache[id] = document.getElementById(id));

    let node = document.createElement(tag);
    node.innerHTML = template.innerHTML;

    for (let key in params) {
      node.dataset[key] = params[key];
      let keyNode = node.querySelector('.' + key);
      if (keyNode) {
        keyNode.innerHTML = params[key];
      }
    }

    return node;
  }

  function trying() {
    console.log('Trying...');
  }

  function printDone(message) {
    console.log(message);
    console.log('Done');
  }

  function clearList() {
    for (let i = 1; i < el.passlist.children.length; 'no increment') {
      el.passlist.removeChild(el.passlist.children.item(i));
    }
  }

  function PasswordListView() {
    /* Make sure code doesn't crash */
    this.dobrowse =
    this.doread   =
    this.doedit   =
    this.doadd    =
    this.dodel    =
    this.dodebug  = (_ => (new Promise(function (r) { r(); })));

    /* Wire the DOM to various methods */

  }

  PasswordListView.prototype = {
    browse() {
      trying();
      this.dobrowse().then(this.onbrowse);
    },

    clearList: clearList,

    onbrowse(values) {
      clearList();
      values.forEach(url => {
        let name = url.match(/.*\/([^/]*)\/$/)[1];

        let node = new Template('passlist-item-template', 'li', {
          name: name
        });

        /* Node.addabunchofeventlisteners() */

        el.passlist.appendChild(node);
      });
      printDone(values);
    },

    read(key) {
      trying();
      this.doread(key).then(this.onread);
    },

    onread(value) {
      printDone(value);
    },

    edit(key, value) {
      console.log('Not trying...I have not written that yet.');
    },

    add(key, value) {
      trying();
      this.doadd(key, value).then(this.onadd);
    },

    onadd(bool) {
      printDone(bool);
    },

    del(key) {
      trying();
      this.dodel(key).then(this.ondel);
    },

    ondel(bool) {
      printDone(bool);
    },

    dump(key) {
      trying();
      console.log('Debugging password key', key);
      this.dodump(key).then(this.ondump);
    },

    ondump(ciphertext) {
      if (ciphertext === null) {
        printDone('Fetch failed. Ciphertext null.');
      } else {
        console.log('---Begin Ciphertext---');
        console.log(ciphertext);
        console.log('---End Ciphertext---');
        console.log('Done.');
      }
    }
  };

  app.PasswordListView = PasswordListView;
})();
