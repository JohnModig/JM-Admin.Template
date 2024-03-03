/*---------------------------------------------------------------------------*\

    Dialog

    Optional component, to be included in the html file.

    Displays content in a dialog box, a subwindow above the other elements of
    the page.

    Features: 

    - Uses modern Html <dialog> tag.

    - Can be used to display static content, or content from url.

    - Manages autofocus; when opened from keyboard, the close button will be focused.

    - Styles for media, e.g. images and video.

    Configurated via the data-dialog attribute. The attribute can contain: 

    - Html

    - Url
    
    - A selector to an element within the document

    - Empty - get url from href attribute (<a> tag)

\*---------------------------------------------------------------------------*/

// Singleton pattern (for performance)
const dialog = {
    // Functions for opening
    open: {
        // Show static html in the master dialog element.
        html: function (code, keyboardEvent = false) {
            if (!code) {
                console.error('Could not open dialog (no html).');
                return;
            }
            dialog.master.create();
            dialog.master.setHtml(code);
            dialog.master.showModal();
            dialog.master.focusOnCloseButton(keyboardEvent);
        },
        // Get html from an element within the document.
        element: function (selector, keyboardEvent = false) {
            let el = document.querySelector(selector);
            if (!el) {
                console.error('Could not open dialog (element not found).');
                return;
            }
            dialog.master.create();
            dialog.master.setHtml(el.innerHTML);
            dialog.master.showModal();
            dialog.master.focusOnCloseButton(keyboardEvent);
        },
        // Fetch html from url and show in the master dialog element.
        url: function (href, keyboardEvent = false) {
            dialog.master.create();
            dialog.master.clear();
            dialog.master.addLoader();
            dialog.master.showModal();
            dialog.master.focusOnCloseButton(keyboardEvent);

            // Fetch
            fetch(href)
                .then((response) => {
                    if (response.ok) {
                        return response.text();
                    }
                    return Promise.reject(response);
                })
                .then((result) => {
                    // Convert the Html string into a document object
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(result, 'text/html');
                    // Does the Html contain a <body> tag?
                    var body = doc.querySelector('body');
                    if (body) {
                        dialog.master.setHtml(body.innerHTML);
                    }
                    else {
                        dialog.master.setHtml(result);
                    }
                    dialog.master.removeLoader();
                    dialog.master.focusOnCloseButton(keyboardEvent);
                })
                .catch((error) => {
                    dialog.master.removeLoader();
                    dialog.master.close();
                    console.error('Could not load url.');
                });

        },
        // Open from attribute
        fromAttribute: function (el, keyboardEvent = false) {
            if (!el || !el.hasAttribute(dialog.settings.attribute)) {
                return;
            }
            // Determine what type of content defined by the attribute
            let attr = el.getAttribute(dialog.settings.attribute);
            // Type: Href from <a> tag
            if (attr === '' && el.nodeName === 'A' && el.hasAttribute('href')) {
                dialog.open.url(el.getAttribute('href'), keyboardEvent);
            }
            // Type: Url
            else if (!attr.startsWith('<') && (attr.startsWith('.') && attr.indexOf('/') > 0) || attr.startsWith('/') || attr.startsWith('http://') || attr.startsWith('https://')) {
                dialog.open.url(attr, keyboardEvent);
            }
            // Type: Selector
            // (test: https://regex101.com/r/xvl1Hy/2)
            else if (/^[a-zA-Z.#]( .|\(.|[\w >:\-\(\)])+$/.test(attr) && document.querySelector(attr) !== null) {
                dialog.open.element(attr, keyboardEvent);
            }
            // Type: Html
            else {
                dialog.open.html(attr, keyboardEvent);
            }
        }
    },
    // Functions for the master dialog element
    master: {
        id: 'dialog_0',
        create: function () {
            // Already exists?
            if (document.getElementById(dialog.master.id) !== null) {
                return;
            }
            // Generate id
            dialog.master.id = 'dialog_' + new Date().getTime();
            // Create Html
            let el = document.createElement('dialog');
            el.id = dialog.master.id;
            el.innerHTML = '<form method="dialog" tabindex="0"></form>';
            document.body.insertAdjacentElement('beforeend', el);
            dialog.master.clear();
            // Close dialog when clicking on backdrop
            document.getElementById(dialog.master.id).addEventListener("click", function (e) {
                if (e.target === this) {
                    this.close();
                }
            });
            // Clear dialog contents when closing
            document.getElementById(dialog.master.id).addEventListener("close", function (e) {
                dialog.master.clear();
            });
        },
        clear: function () {
            dialog.master.setHtml('');
        },
        setHtml: function (html) {
            let el = document.querySelector(`#${dialog.master.id}>form`);
            if (!el) {
                return;
            }
            el.innerHTML = `<button></button>${html}`;
        },
        showModal: function () {
            let el = document.getElementById(dialog.master.id);
            if (!el) {
                return;
            }
            el.showModal();
        },
        addLoader: function () {
            let el = document.querySelector(`#${dialog.master.id}>form`);
            if (!el) {
                return;
            }
            el.classList.add('loading');
        },
        removeLoader: function () {
            let el = document.querySelector(`#${dialog.master.id}>form`);
            if (!el) {
                return;
            }
            el.classList.remove('loading');
        },
        close: function () {
            let el = document.getElementById(dialog.master.id);
            if (!el) {
                return;
            }
            el.close();
        },
        focusOnCloseButton: function (focus) {
            let el = document.querySelector(`#${dialog.master.id} ${focus ? 'button' : 'form'}`)
            if (el) {
                el.focus();
            }
        }
    },
    // Settings
    settings: {
        attribute: 'data-dialog',
    }
};

// Create objects
(function () {
    // Find all elements that refers to a dialog
    let els = document.querySelectorAll(`[${dialog.settings.attribute}]`);
    for (var el of els) {
        el.addEventListener("click", function (e) {
            dialog.open.fromAttribute(this, e.detail === 0); // Detect keyboard
            e.preventDefault();
        });
    }
})();