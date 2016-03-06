'use strict';

var p;

if ('serviceWorker' in navigator) {
  p = navigator.serviceWorker.register('serviceWorker.js', {
    scope: '/pass/'
  });
} else {
  console.error("ServiceWorker unavailable.");
  p = new Promise(function (resolve, reject) { reject(); });
}

function go(method, url) {
  let xhr = new XMLHttpRequest();
  xhr.open(method.toUpperCase(), url);
  xhr.onload = function () {
    console.log(method, url, this.responseText);
  }

  xhr.send();
}

p.then(function () {
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
