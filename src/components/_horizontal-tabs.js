/*---------------------------------------------------------------------------*\

    Horizontal tabs

    Progressive enhancement for the component. Supports multiple components.

    The component works without javascript, but the javascript adds the some 
    additional functionality and style for grouped links (<details>):

    - Positioning of the groups, when the menu is scrolled horizontally.
    
    - Minimum width of the groups.

\*---------------------------------------------------------------------------*/

// Constructor function
function _horizontalTabs(el) {
    // Timer for scrolling event
    this.timer = null;
    // Groups that needs to be moved
    this.groups = el.querySelectorAll('details');
    // Move groups function
    this.moveGroups = () => {
        if (!this.groups || this.groups.length < 1) {
            return;
        }
        const headerLeft = this.groups[0].parentElement.parentElement.getBoundingClientRect().left;
        for (var i = 0; i < this.groups.length; i++) {
            const el = this.groups[i].querySelector('nav');
            if (!el) {
                continue;
            }
            let rect = this.groups[i].getBoundingClientRect();
            el.style.left = Math.round(rect.left) + 'px';
            if (this.groups[i].open) {
                // Close if outside
                if (rect.left < (headerLeft - 20)) {
                    this.groups[i].open = false;
                    el.classList.remove('open');
                }
                else {
                    el.classList.add('open');
                }
            }
            else {
                el.classList.remove('open');
            }
        }
    }
    // Scroll event
    el.addEventListener('scroll', () => {
        clearTimeout(this.timer);
        this.timer = setTimeout(this.moveGroups, 100);
    });
    // Set width for groups
    for (var i = 0; i < this.groups.length; i++) {
        let nav = this.groups[i].querySelector('nav');
        let summary = this.groups[i].querySelector('summary');
        if (!nav || !summary) {
            continue;
        }
        // Wait for tranformation to finish before setting width
        setTimeout(() => { nav.style.width = Math.round(summary.clientWidth) + 'px'; }, 100);
    }
}

// Create objects
(() => {
    let els = document.querySelectorAll('.horizontal-tabs');
    for (var i = 0; i < els.length; i++) {
        // Does the navigation contain groups?
        let el = document.querySelector('details');
        if (el) {
            // Create object
            new _horizontalTabs(els[i]);
        }
    }
})();