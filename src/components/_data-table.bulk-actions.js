/*---------------------------------------------------------------------------*\

    Data table bulk actions (add-on)

    Extended functionality to component: Data table

    Features:

    - Generate a user interface for selecting records.

    - Enables you to perform actions to multiple records at once.

    - Send POST requests with data from the data-id attribute of the selected 
      records.

    - Works with all variants of the Data table component.

\*---------------------------------------------------------------------------*/

var DataTableBulkActions = function (config) {
    // The input element (<input type="text"> or <input type="search">)
    this.input = null;

    // The UI (generated)
    this.UI = {

        // Record checkboxes
        recordCheckboxes: [],

        // Section element
        section: null,

        // Master checkbox
        masterCheckbox: null,

        // Size label (for how many are selected)
        sizeLabel: null,

        // Text (for globalization)
        text: {
            singleSelected: 'selected',
            multipleSelected: 'selected',
            noneSelected: 'none selected',
            select: 'Select',
            show: 'Show',
            hide: 'Hide'
        },

        // Toggle link
        toggleLink: null,

        // Grouped links
        groupedLinks: null,

        // Form
        form: null,

        // Event: on selection
        onSelect: () => {
            // Count selected
            const sum = this.UI.recordCheckboxes.filter(item => item.checked === true).length;
            if (sum === 0) {
                this.UI.sizeLabel.textContent = `(${this.UI.text.noneSelected})`;
                this.UI.sizeLabel.classList.add('thin');
                if (this.UI.groupedLinks) {
                    this.UI.groupedLinks.firstElementChild.textContent = this.UI.sizeLabel.textContent;
                    this.UI.sizeLabel.classList.remove('hidden');
                    this.UI.groupedLinks.classList.add('hidden');
                }
            }
            else if (sum === 1) {
                this.UI.sizeLabel.textContent = `${sum} ${this.UI.text.singleSelected}`;
                this.UI.sizeLabel.classList.remove('thin');
                if (this.UI.groupedLinks) {
                    this.UI.groupedLinks.firstElementChild.textContent = this.UI.sizeLabel.textContent;
                    this.UI.sizeLabel.classList.add('hidden');
                    this.UI.groupedLinks.classList.remove('hidden');
                }
            }
            else {
                this.UI.sizeLabel.textContent = `${sum} ${this.UI.text.multipleSelected}`;
                this.UI.sizeLabel.classList.remove('thin');
                if (this.UI.groupedLinks) {
                    this.UI.groupedLinks.firstElementChild.textContent = this.UI.sizeLabel.textContent;
                    this.UI.sizeLabel.classList.add('hidden');
                    this.UI.groupedLinks.classList.remove('hidden');
                }
            }

            // Master checkbox tri state
            if (sum < 1) {
                this.UI.masterCheckbox.checked = false;
                this.UI.masterCheckbox.classList.remove('partly');
            }
            else if (sum >= this.UI.recordCheckboxes.length) {
                this.UI.masterCheckbox.checked = true;
                this.UI.masterCheckbox.classList.remove('partly');
            }
            else {
                this.UI.masterCheckbox.checked = true;
                this.UI.masterCheckbox.classList.add('partly');
            }
        }
    };

    // Visibility functions
    // Hide the UI
    this.hide = () => {
        this.UI.section.classList.add('hidden');
        if (this.UI.toggleLink) {
            this.UI.toggleLink.classList.remove('icon-toggle_on');
            this.UI.toggleLink.classList.add('icon-toggle_off');
            this.UI.toggleLink.title = this.UI.text.show;
        }
    };

    // Show the UI
    this.show = () => {
        this.UI.section.classList.remove('hidden');
        if (this.UI.toggleLink) {
            this.UI.toggleLink.classList.add('icon-toggle_on');
            this.UI.toggleLink.classList.remove('icon-toggle_off');
            this.UI.toggleLink.title = this.UI.text.hide;
        }
    };

    // Toggle the UI
    this.toggle = () => {
        if (this.UI.section.classList.contains('hidden')) {
            this.show();
        }
        else {
            this.hide();
        }
    };

    // Constructor function
    this.constructor = function (configuration) {
        // Validate configuration
        // Input element
        if (!configuration.input) {
            console.error('Bulk actions error: 🚩 Input element is not configured correctly.');
            return;
        }
        else if (typeof (configuration.input) === 'string') {
            this.input = document.querySelector(configuration.input);
        }
        else if (typeof (configuration.input) === 'object') {
            this.input = configuration.input;
        }
        if (!this.input || this.input.nodeName !== 'DIV') {
            console.error('Bulk actions error: 🚩 Input element is not configured correctly.');
            return;
        }
        // Text
        if (typeof (configuration.text) === 'object') {
            this.UI.text = configuration.text;
        }
        // Record rows
        var els = this.input.querySelectorAll('div.item');
        if (els.length < 1) {
            return;
        }
        for (var el of els) {
            const elDiv = document.createElement('div');
            if (!el.classList.contains('headings')) {
                // Add checkbox to record rows
                const elCheckbox = document.createElement('input');
                elCheckbox.type = 'checkbox';
                elCheckbox.value = el.getAttribute('data-id');
                elCheckbox.name = 'id';
                elDiv.append(elCheckbox);
                elCheckbox.addEventListener('change', (e) => {
                    this.UI.onSelect();
                });
                // Add checkbox to UI object
                this.UI.recordCheckboxes.push(elCheckbox);
            }
            el.prepend(elDiv);
        }

        // Change key column
        var changedKeyColumn = false;
        if (this.input.classList.contains('change-key-column')) {
            var keyColumn = this.input.style.getPropertyValue('--key-column');
            if (keyColumn) {
                this.input.style.setProperty('--key-column', parseInt(keyColumn) + 1);
                changedKeyColumn = true;
            }
        }
        if (!changedKeyColumn) {
            this.input.classList.add('change-key-column');
            this.input.style.setProperty('--key-column', '2');
        }

        // Change attribute for number of columns
        var prop = this.input.style.getPropertyValue('--columns');
        if (prop) {
            this.input.style.setProperty('--columns', parseInt(prop) + 1);
        }

        // Create the UI

        // Section
        this.UI.section = document.createElement('section');
        this.UI.section.className = 'bulk-actions align vertical-center';
        this.input.insertAdjacentElement('beforebegin', this.UI.section);

        // Master checkbox
        this.UI.masterCheckbox = document.createElement('input');
        this.UI.masterCheckbox.type = 'checkbox';
        var elDiv = document.createElement('div');
        elDiv.append(this.UI.masterCheckbox);
        this.UI.section.append(elDiv);
        this.UI.masterCheckbox.addEventListener('change', (e) => {
            if (e.currentTarget.checked) {
                this.UI.recordCheckboxes.forEach((el) => el.checked = true);
            }
            else {
                this.UI.recordCheckboxes.forEach((el) => el.checked = false);
            }
            this.UI.onSelect();
        });

        // Size label
        this.UI.sizeLabel = document.createElement('p');
        this.UI.section.append(this.UI.sizeLabel);

        // Grouped links
        if (configuration.links && typeof (configuration.links) === 'object') {
            this.UI.groupedLinks = document.createElement('details');
            var elSummary = document.createElement('summary');
            this.UI.groupedLinks.append(elSummary);
            var elNav = document.createElement('nav');
            this.UI.groupedLinks.append(elNav);
            for (var link of configuration.links) {
                var elLink = document.createElement('a');
                elLink.href = link.url;
                elLink.textContent = link.text;
                if (link.class) {
                    elLink.className = link.class;
                }
                elNav.append(elLink);
                elLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.UI.form.action = e.currentTarget.href;
                    this.UI.form.submit();
                });
            }
            this.UI.section.append(this.UI.groupedLinks);
        }

        // Form
        if (this.UI.groupedLinks) {
            this.UI.form = document.createElement('form');
            this.UI.form.method = 'post';
            this.input.parentElement.insertBefore(this.UI.form, this.input);
            this.UI.form.append(this.input);
        }

        // Header present?
        var header = null;
        if (this.input.firstElementChild && this.input.firstElementChild.nodeName === 'HEADER') {
            // Header exists
            header = this.input.firstElementChild;
            header.classList.add('align')
            header.classList.add('header')
        }
        else {
            // No header - create one
            header = document.createElement("header");
            header.className = 'align header bulk-actions';
            // Add section to header
            header.append(this.UI.section);
            // Add sorting menu to header
            if (this.UI.form.previousElementSibling && this.UI.form.previousElementSibling.matches('section.sorting')) {
                var sorting = this.UI.form.previousElementSibling;
                sorting.classList.remove('small');
                header.append(sorting);
            }
            this.input.prepend(header);
        }

        // Toggle link
        if (configuration.hideable !== false) {
            // Create the toggle link
            this.UI.toggleLink = document.createElement('a');
            this.UI.toggleLink.href = document.location.href;
            this.UI.toggleLink.innerHTML = this.UI.text.select;
            this.UI.toggleLink.className = 'vertical-center';
            this.UI.toggleLink.addEventListener('click', (e) => {
                this.toggle();
                e.preventDefault();
            });
            header.append(this.UI.toggleLink);
        }

        // Hidden?
        if (configuration.hidden === true) {
            this.hide();
        }
        else {
            this.show();
        }

        // Fire select event
        this.UI.onSelect();
        console.log('Data table bulk actions ready.')
    }
    this.constructor(config);
}