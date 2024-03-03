/*---------------------------------------------------------------------------*\

    Validation

    Client side validation of form elements.

    Forms should always be validated server side. This components adds client
    side validation for a better user experience.

    - Supported server side validation: .NET DataAnnotation attributes 
      [Required] and [RegularExpression] 
      (https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations(v=vs.110).aspx)

    - Supported form elements: <input>, <textarea> and <select>.

    - Supported advanced input box: choices.js
    
    - Supported bot protection: Google ReCaptcha v3, Programmatically invoke 
      (https://developers.google.com/recaptcha/docs/v3#programmatically_invoke_the_challenge)

\*---------------------------------------------------------------------------*/

// Singleton pattern (for performance)
const validation = {
    // Functions for elements
    elements: {
        add: function (el) {
            if (!el) {
                console.error('Could not add validation (no element).');
                return;
            }
            if (validation.settings.allowedElements.indexOf(el.nodeName) < 0) {
                console.error('Could not add validation (element not allowed).');
                return;
            }
            if (el.nodeName === 'SELECT' || el.classList.contains('choices__input')) {
                el.addEventListener('change', () => {
                    validation.elements.validate(el);
                });
            }
            else {
                el.addEventListener('input', () => {
                    validation.elements.validate(el);
                });
            }
        },
        validate: function (el) {
            if (!el) {
                console.error('Could not validate (no element).');
                return;
            }
            let elMessage = document.querySelector('span[data-valmsg-for="' + el.getAttribute('name') + '"]');
            const valid = function () {
                el.classList.remove(validation.settings.inputClassError);
                el.classList.add(validation.settings.inputClassValid);
                if (elMessage != null) {
                    elMessage.innerHTML = '';
                    elMessage.classList.remove(validation.settings.messageClassError);
                    elMessage.classList.add(validation.settings.messageClassValid);
                }
            };
            const error = function (message) {
                el.classList.remove(validation.settings.inputClassValid);
                el.classList.add(validation.settings.inputClassError);
                if (elMessage != null) {
                    elMessage.innerHTML = message;
                    elMessage.classList.remove(validation.settings.messageClassValid);
                    elMessage.classList.add(validation.settings.messageClassError);
                }
            };
            let val = el.value.trim();
            let msg = '';
            if (val.length > 0) {
                let rx = el.getAttribute('data-val-regex-pattern');
                if (rx) {
                    let reg = new RegExp(rx, 'i');
                    let match = reg.exec(el.value);
                    if (!match) {
                        msg = el.getAttribute('data-val-regex');
                        error(msg);
                        return;
                    }
                }
                valid();
            }
            else if (el.hasAttribute('data-val-required')) {
                msg = el.getAttribute('data-val-required');
                error(msg);
            }
            else {
                valid();
            }
            
        }
    },
    // Functions for forms
    forms: {
        add: function (el) {
            if (!el) {
                console.error('Could not add validation (no element).');
                return;
            }
            if (el.nodeName !== 'FORM') {
                console.error('Could not add validation (no form element).');
                return;
            }
            let els = el.querySelectorAll(validation.settings.elementsSelector);
            if (els.length > 0) {
                el.addEventListener('submit', (e) => {
                    validation.forms.validate(el, e);
                });
            }
        },
        validate: function (el, e) {
            if (!el) {
                console.error('Could not validate (no element).');
                return;
            }
            if (el.nodeName !== 'FORM') {
                console.error('Could not validate (no form).');
                return;
            }
            let els = el.querySelectorAll(validation.settings.elementsSelector);
            let invalidEls = 0;
            for (var el of els) {
                validation.elements.validate(el);
                if (el.classList.contains(validation.settings.inputClassError)) {
                    invalidEls++;
                }
            }
            if (invalidEls > 0) {
                e.preventDefault();
                return;
            }
            // Google ReCaptcha v3
            if (typeof (grecaptcha) != "undefined") {
                let script = document.querySelector("script[src^='https://www.google.com/recaptcha/api.js?render=']");
                if (!script) {
                    console.error('ReCaptcha error.');
                    return;
                }
                let src = script.getAttribute('src');
                let iStart = src.indexOf('=') + 1;
                let iEnd = src.indexOf('&');
                let siteKey = iEnd > iStart ? src.substring(iStart, iEnd) : src.substring(iStart);
                e.preventDefault();
                grecaptcha.ready(function () {
                    grecaptcha.execute(siteKey, { action: 'submit' }).then(function (token) {
                        el.insertAdjacentHTML('beforeend', '<input type="hidden" name="g-recaptcha-response" value="' + token + '" />');
                        el.submit();
                    });
                });
            }
        }
    },
    // Settings
    settings: {
        inputClassValid: 'input-validation-valid',
        inputClassError: 'input-validation-error',
        messageClassValid: 'field-validation-valid',
        messageClassError: 'field-validation-error',
        allowedElements: ['INPUT', 'SELECT', 'TEXTAREA'],
        elementsSelector: 'input[data-val-required], input[data-val-regex], select[data-val-required], select[data-val-regex], textarea[data-val-required], textarea[data-val-regex]'
    }
};

// Create objects
(function () {
    // Find all elements that needs validation
    let els = document.querySelectorAll(validation.settings.elementsSelector);
    for (var el of els) {
        validation.elements.add(el);
    }
    // Find all forms that needs validation
    let forms = document.querySelectorAll('form');
    for (var form of forms) {
        validation.forms.add(form);
    }
    if (els.length > 0) {
        console.log('Validation ready.');
    }
})();