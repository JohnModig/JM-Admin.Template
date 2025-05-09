﻿/*---------------------------------------------------------------------------*\

    Data table

    Progressive enhancement for the component. Supports multiple components.

    The component works without javascript, but the javascript adds the some 
    additional functionality and style for context menues (<details>):

    - Only one menu in the data table can be opened at the same time.
    
    - Menues are opened on hover (besides click).
    
    - Generates a menu for sorting in the header for small screens (on 
      collapsible data tables with headings). If the data table doesn't have 
      a header, the sorting menu for small screens will be placed above the 
      data table.

\*---------------------------------------------------------------------------*/

// Add event listeners
(() => {
    // Data tables (fix layout problem with <header> and more)
    let els = document.querySelectorAll('div.data');
    for (var el of els) {
        var rows = el.querySelectorAll('div.item');
        if (rows.length === 0) {
            continue;
        }
        var maxColumns = 0;
        for (var row of rows) {
            var rowColumns = row.childElementCount;
            if (rowColumns > maxColumns) {
                maxColumns = rowColumns;
            }
        }
        if (maxColumns > 0) {
            el.style.setProperty('--columns', maxColumns);
        }
    };
    // Context menues (<details>)
    els = document.querySelectorAll('div.data details');
    for (var el of els) {
        // Only match context menues (empty <summary>)
        var summary = el.querySelector('summary:empty');
        if (!summary) {
            continue;
        }
        // Open menu on hover
        el.addEventListener('mouseover', function () {
            let attr = this.getAttribute('open');
            if (attr !== null && attr !== 'mouseover') {
                // Already opened, but not by hover
                return;
            }
            // Open the menu and flag it as open by hover (so we know if it should be closed on mouseout)
            this.setAttribute('open', 'mouseover');
        }, true);
        // Close when hovered, but not when clicked
        el.addEventListener('mouseout', function () {
            let attr = this.getAttribute('open');
            if (attr === 'mouseover') {
                this.removeAttribute('open');
            }
        }, true);
        // Don't close on click when hovered
        el.addEventListener('click', function (e) {
            if (e.target.nodeName === 'A') {
                return;
            }
            let attr = this.getAttribute('open');
            if (attr !== null && attr === 'mouseover') {
                e.preventDefault();
                this.setAttribute('open', '');
            }
        });
        // Toggle event
        el.addEventListener('toggle', (e) => {
            if (e.currentTarget.open) {
                // Close other opened context menues
                let els = document.querySelectorAll('div.data details[open]:has(summary:empty)');
                for (var el of els) {
                    if (el === e.currentTarget) {
                        continue;
                    }
                    el.removeAttribute('open');
                }
            }
        });
    };
    // Collapsible data tables
    els = document.querySelectorAll('div.data.collapse');
    for (var el of els) {
        // Create sorting for small screens
        var header = el.querySelector('header:first-child');
        var headerLastLink = el.querySelector('header>a:last-child, header>details:last-child');
        var headings = el.querySelectorAll('div.item.headings:first-of-type a');
        var sortedHeading = el.querySelector('div.item.headings:first-of-type a[class^="icon-arrow_"], div.item.headings:first-of-type a[class*=" icon-arrow_"], div.item.headings:first-of-type a:has(>[class^="icon-arrow_"])');
        var sortedHeadingNode = Array.from(headings).find((node) => node.isSameNode(sortedHeading) === true);
        if (headings.length < 1 || sortedHeadingNode === undefined) {
            continue;
        }
        var section = null;
        if (header === null) {
            section = document.createElement('section');
            section.className = 'align right show-for-phone-only sorting';
            el.insertAdjacentElement('beforebegin', section);
        }
        else {
            header.classList.add('align');
            header.classList.add('header');
        }
        if (headings.length === 1) {
            // One sorting link, use a single link
            var node = headings[0].cloneNode(true);
            // Use same size as existing links
            if (headerLastLink !== null && headerLastLink.classList.contains('small')) {
                node.classList.add('small');
            }
            node.classList.add('show-for-phone-only');
            if (header === null) {
                section.insertAdjacentElement('beforeend', node);
            }
            else {
                header.insertAdjacentElement('beforeend', node);
            }
        }
        else if (headings.length > 1) {
            // Multiple sorting links
            // Use a single link for the currently selected option
            var nodeA = sortedHeadingNode.cloneNode(true);
            // Use same size as existing links
            if (headerLastLink !== null && headerLastLink.classList.contains('small')) {
                nodeA.classList.add('small');
            }
            nodeA.classList.add('show-for-phone-only');
            // Support icons in first childnode
            if (nodeA.hasChildNodes() && nodeA.firstChild.textContent == "" && nodeA.firstChild.className.includes('icon-')) {
                while (nodeA.childNodes.length > 1) {
                    nodeA.removeChild(nodeA.lastChild);
                }
            }
            else {
                nodeA.textContent = '';
            }
            // Insert last or before context menu
            if (headerLastLink !== null && headerLastLink.querySelector('summary:empty') !== null) {
                headerLastLink.insertAdjacentElement('beforebegin', nodeA);
            }
            else if (header === null) {
                section.insertAdjacentElement('beforeend', nodeA);
            }
            else {
                header.insertAdjacentElement('beforeend', nodeA);
            }
            // Use a dropdown with other sorting links
            var nodeDetails = document.createElement('details');
            // Use same size as existing links
            if (headerLastLink !== null && headerLastLink.classList.contains('small')) {
                nodeDetails.classList.add('small');
            }
            nodeDetails.classList.add('show-for-phone-only');
            var html = `<summary>${sortedHeadingNode.textContent}</summary><nav>`;
            for (var heading of headings) {
                if (heading.isSameNode(sortedHeadingNode)) {
                    continue;
                }
                html += heading.outerHTML;
            }
            html += '</nav>';
            nodeDetails.innerHTML = html;
            // Insert last or before context menu
            if (headerLastLink !== null && headerLastLink.querySelector('summary:empty') !== null) {
                headerLastLink.insertAdjacentElement('beforebegin', nodeDetails);
            }
            else if (header === null) {
                section.insertAdjacentElement('beforeend', nodeDetails);
            }
            else {
                header.insertAdjacentElement('beforeend', nodeDetails);
            }
        }
    }
})();