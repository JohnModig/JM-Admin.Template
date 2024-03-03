/*---------------------------------------------------------------------------*\

    Alert

    Progressive enhancement for the component. Supports multiple components.

    The component works without javascript, but the javascript adds the some
    additional functionality:

    - Closing function that removes the element from the DOM.

\*---------------------------------------------------------------------------*/

// Singleton pattern (for performance)
const alert = {
    // Function for closing
    close: function (element) {
        console.log(element);
        var el = element.closest('.alert');
        if (!el) {
            console.warn('No alert found.');
            return;
        }
        el.classList.add('fade-out');
        setTimeout(function () { el.remove(); }, 400);
    }
};

// Create objects
(function () {
    // Find all closing links
    let els = document.querySelectorAll('.alert a.close, .alert.close');
    for (var el of els) {
        el.addEventListener("click", function (e) {
            alert.close(this);
            e.preventDefault();
        });
    }
})();