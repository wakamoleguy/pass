var p;

if ('serviceWorker' in navigator) {
  p = navigator.serviceWorker.register('serviceWorker.js', {
    scope: '/pass/'
  });
} else {
  console.error("ServiceWorker unavailable.");
  throw new Error("ServiceWorker API required for this application.");
  p = new Promise(function (resolve, reject) { reject(); });
}

function go(method, url, data, decrypt) {
  let xhr = new XMLHttpRequest();
  let formdata= new FormData();

  for (let key in data) {
    formdata.append(key, data[key]);
  }
  xhr.open(method.toUpperCase(), url);
  xhr.onload = function () {
    var text = this.responseText;
    if (decrypt) {
      text = text.split('').reverse().join('');
    }
    console.log(method, url, text);
  }

  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
}

p.then(function () {
  return;
  go('GET', 'https://crypt.invalid/api/crypt/');
  go('POST', 'https://crypt.invalid/api/crypt/');
  go('GET', 'https://crypt.invalid/api/crypt/123/');
  go('GET', 'https://crypt.invalid/api/crypt/github.com/');
  go('PUT', 'https://crypt.invalid/api/crypt/123/');
  go('DELETE', 'https://crypt.invalid/api/crypt/123/');

  go('HELLO', 'https://crypt.invalid/api/crypt/');
  go('HELLO', 'https://crypt.invalid/api/crypt/123/');
  go('GET', 'https://crypt.invalid/foo/bar/');
});



window.crypt = {

  add: function (key, value) {
    let data = {
      key: key,
      value: value.split('').reverse().join('')
    };
    go('POST', 'https://crypt.invalid/api/crypt/', data, true);
  },

  get: function (key) {
    go('GET', 'https://crypt.invalid/api/crypt/' + key + '/', undefined, true);
  },

  del: function (key) {
    go('DELETE', 'https://crypt.invalid/api/crypt/' + key + '/');
  },

  browse: function () {
    go('GET', 'https://crypt.invalid/api/crypt/');
  }
};
