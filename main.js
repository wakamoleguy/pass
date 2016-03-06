'use strict';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('serviceWorker.js', {
    scope: '/pass/'
  });
} else {
  console.warn("ServiceWorker unavailable.");
}

function go(method, url) {
  let xhr = new XMLHttpRequest();
  xhr.open(method.toUpperCase(), url);
  xhr.onload = function () {
    console.log(method, url, this.responseText);
  }

  xhr.send();
}


go('GET', 'https://crypt.invalid/api/crypt/');
go('POST', 'https://crypt.invalid/api/crypt/');
go('GET', 'https://crypt.invalid/api/crypt/123/');
go('GET', 'https://crypt.invalid/api/crypt/github.com/');
go('PUT', 'https://crypt.invalid/api/crypt/123/');
go('DELETE', 'https://crypt.invalid/api/crypt/123/');

