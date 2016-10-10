(function () {
    'use strict';

    let el = {
        section: document.getElementById('prompt'),
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

    function PromptView() {
        /* Wire the DOM to various methods */
    }

    PromptView.prototype = {
        open(title, description) {
            return new Promise((resolve, reject) => {
                let node = new Template('prompt-template', 'form', {
                    title: title,
                    description: description
                });

                let passphraseInput = node.querySelector('input[type="password"]');

                node.addEventListener('submit', e => {
                    e.preventDefault();
                    let formData = new FormData(node);
                    let canceled = formData.get('cancel') !== null;
                    let passphrase = (canceled ? null : passphraseInput.value);

                    passphraseInput.value = '';
                    el.section.removeChild(node);
                    resolve(passphrase);
                }, false);

                el.section.appendChild(node);
                passphraseInput.focus();
            });
        }

    };

    app.PromptView = PromptView;

})();
