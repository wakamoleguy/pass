if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('serviceWorker.js', {
    scope: '/pass/'
  });
} else {
  console.warn("ServiceWorker unavailable.");
}

var i = 0;
var interval = setInterval(function () {
  i++;
  if (i > 5) clearInterval(interval);
var xhr = new XMLHttpRequest();
xhr.open('GET', '/pass/super-secret-password.json');
xhr.onload = function () {
  console.log(this.responseText);
}
xhr.send();
}, 2000);
