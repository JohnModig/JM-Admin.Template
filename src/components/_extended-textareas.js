/*---------------------------------------------------------------------------*\

    Extended textareas

    Extended versions of the textarea element. Features: 

    - Auto-height: Get a <textarea> to automatically set its height to fit 
      its content.

\*---------------------------------------------------------------------------*/

// Singleton pattern (for performance)
const extendedTextareas = {
    // Functions for elements
    elements: {
        add: function (el) {
            if (!el) {
                console.error('Could not add element (no element).');
                return;
            }
            if (el.nodeName !== 'TEXTAREA') {
                console.error('Could not add element (not textarea).');
                return;
            }
            el.setAttribute('rows', '1');
            el.addEventListener('input', () => {
                extendedTextareas.elements.resize(el);
            });
            el.addEventListener('resize', () => {
                console.log("!");
            });
        },
        resize: function (el) {
            el.style.height = '';
            if (el.value.length === 0) {
                return;
            }
            let offset = 0;
            if (!el.hasAttribute(extendedTextareas.settings.autoHeightOffsetAttribute)) {
                // Calculate offset
                offset = el.offsetHeight - el.clientHeight + 1;
                el.setAttribute(extendedTextareas.settings.autoHeightOffsetAttribute, offset);
            }
            else {
                offset = parseInt(el.getAttribute(extendedTextareas.settings.autoHeightOffsetAttribute));
            }
            el.style.height = el.scrollHeight + offset + 'px';
        }
    },
    // Settings
    settings: {
        autoHeightAttribute: 'data-auto-height',
        autoHeightOffsetAttribute: 'data-auto-height-offset'
    }
};

// Create objects
(function () {
    // Find all elements
    let els = document.querySelectorAll(`textarea[${extendedTextareas.settings.autoHeightAttribute}]`);
    for (var el of els) {
        extendedTextareas.elements.add(el);
    }
})();