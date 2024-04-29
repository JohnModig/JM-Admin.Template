/*---------------------------------------------------------------------------*\

    Slider

    Optional component.

    Scroll through elements horizontally, with navigation and progress
    indicator. This component is usually used to create carousel slideshows
    or to divide long forms into smaller sections.

    Features: 

    - Automatically creates navigation in different styles.
    
    - Automatically creates progress indicator with optional description of the steps.
    
    - Can be scrolled automatically.
    
    - Can be translated into other languages.

\*---------------------------------------------------------------------------*/

// Constructor function
function Slider(config) {

    // Public properties
    this.element = null;
    this.navigation = null;
    this.steps = null;
    this.slides = [];
    this.delay = 10000;
    this.autoplay = false;
    this.showProgress = false;
    this.navigationStyle = 'bullets';
    this.appendElement = null;
    this.gap = null;
    this.adjustHeight = false;
    this.text = {
        Slide: 'Slide',
        Previous: 'Previous',
        Next: 'Next'
    };

    // Private properties
    var eventTimer = null;
    var navigationTimer = null;

    // Public functions
    this.stop = function () {
        if (navigationTimer !== null) {
            clearTimeout(navigationTimer);
        }
    };
    this.play = () => {
        if (this.navigation === null) {
            return;
        }
        navigationTimer = setTimeout((e) => {
            this.showNext();
            this.play();
        }, this.delay);
    };
    this.show = (i) => {
        var slide = convertToIndex(i);
        this.element.scrollTo({ top: 0, left: this.slides[slide].offsetLeft, behavior: "smooth" });
    };
    this.showNext = () => {
        this.show(getCurrentIndex() + 1);
    };
    this.showPrevious = () => {
        this.show(getCurrentIndex() - 1);
    };

    // Private functions
    var convertToIndex = (i) => {
        return parseInt(i) < 0 && this.slides.length > 0 ? this.slides.length - 1 : parseInt(i) < 0 || parseInt(i) >= this.slides.length ? 0 : parseInt(i);
    };
    var getCurrentIndex = () => {
        // Find first visible slide
        var i = 0;
        var scrollPosition = Math.round(this.element.scrollLeft);
        for (var j = 0; j < this.slides.length; j++) {
            if (this.slides[j].offsetLeft >= scrollPosition) {
                i = j;
                break;
            };
        }
        return i;
    };
    var indicatePosition = () => {
        if (this.slides === null || this.slides.length < 2) {
            return;
        }
        var currentIndex = getCurrentIndex();
        if (this.navigation !== null) {
            switch (this.navigationStyle) {
                case 'prevNext':
                    var prevButton = this.navigation.querySelector('a.button.prev');
                    var nextButton = this.navigation.querySelector('a.button.next');
                    var appendedElement = this.appendElement ? nextButton.nextElementSibling : null;
                    if (currentIndex === 0) {
                        prevButton.classList.add('disabled');
                        nextButton.classList.remove('disabled');
                        if (appendedElement)
                            appendedElement.classList.add('disabled');
                    }
                    else if (currentIndex === this.slides.length - 1) {
                        prevButton.classList.remove('disabled');
                        nextButton.classList.add('disabled');
                        if (appendedElement)
                            appendedElement.classList.remove('disabled');
                    }
                    else {
                        prevButton.classList.remove('disabled');
                        nextButton.classList.remove('disabled');
                        if (appendedElement)
                            appendedElement.classList.add('disabled');
                    }
                    break;
                default:
                    var els = this.navigation.querySelectorAll('a');
                    for (var i = 0; i < els.length; i++) {
                        if (i == currentIndex) {
                            els[i].classList.add("selected");
                        }
                        else {
                            els[i].classList.remove("selected");
                        }
                    }
            }
        }
        if (this.steps !== null) {
            var els = this.steps.querySelectorAll('a.bullet');
            for (var i = 0; i < els.length; i++) {
                if (i < currentIndex) {
                    els[i].classList.add("visited");
                    els[i].classList.remove("current");
                }
                else if (i === currentIndex) {
                    els[i].classList.remove("visited");
                    els[i].classList.add("current");
                }
                else {
                    els[i].classList.remove("visited");
                    els[i].classList.remove("current");
                }
            }
        }
        if (this.adjustHeight) {
            this.element.style.height = `${this.slides[currentIndex].offsetHeight}px`;
            this.element.style.overflowY = 'hidden';
        }
    };

    // Constructor
    // -----------
    // Element
    if (typeof config === 'string') {
        this.element = document.querySelector(config);
    }
    // Configuration
    else if (typeof config === 'object') {
        if ('element' in config) {
            if (typeof config.element === 'string') {
                this.element = document.querySelector(config.element);
            }
            else if (typeof config.element === 'object') {
                this.element = config.element;
            }
        }
        if ('autoplay' in config && typeof config.autoplay === 'boolean') {
            this.autoplay = config.autoplay;
        }
        if ('delay' in config && typeof config.delay === 'number') {
            this.delay = config.delay;
        }
        if ('navigationStyle' in config && typeof config.navigationStyle === 'string') {
            this.navigationStyle = config.navigationStyle;
        }
        if ('appendElement' in config && this.element) {
            if (typeof config.appendElement === 'string') {
                this.appendElement = this.element.querySelector(config.appendElement);
            }
            else if (typeof config.appendElement === 'object') {
                this.appendElement = config.appendElement;
            }
        }
        if ('gap' in config && typeof config.gap === 'string') {
            this.gap = config.gap;
        }
        if ('text' in config && typeof config.text === 'object') {
            this.text = config.text;
        }
        if ('adjustHeight' in config && typeof config.adjustHeight === 'boolean') {
            this.adjustHeight = config.adjustHeight;
        }
    }
    if (!this.element) {
        console.error('Unable to create slider. (Error: no element)');
        return;
    }
    this.element.classList.add('slider');
    if (this.gap) {
        this.element.style.setProperty('--slider-gap', this.gap);
    }
    // Create slides from child elements
    this.slides = this.element.children;
    if (this.slides === null || this.slides.length < 1) {
        console.warn('Unable to create slider. (Error: no slides)');
        return;
    }
    else if (this.slides.length === 1) {
        console.warn('Unable to create slider. (Error: only one slide)');
        return;
    }
    if (this.slides.length > 1) {
        // Create navigation
        this.navigation = document.createElement('nav');
        this.navigation.className = this.navigationStyle;
        switch (this.navigationStyle) {
            case 'prevNext':
                var linkPrev = document.createElement('a');
                linkPrev.className = 'button transparent icon-arrow_back prev';
                linkPrev.textContent = this.text.Previous;
                linkPrev.setAttribute('href', '#');
                linkPrev.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.stop();
                    this.showPrevious();
                });
                this.navigation.appendChild(linkPrev);
                var linkNext = document.createElement('a');
                linkNext.className = 'button right-icon icon-arrow_forward next';
                linkNext.textContent = this.text.Next;
                linkNext.setAttribute('href', '#');
                linkNext.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.stop();
                    this.showNext();
                });
                this.navigation.appendChild(linkNext);
                if (this.appendElement && this.appendElement.nodeType === Node.ELEMENT_NODE) {
                    this.navigation.appendChild(this.appendElement);
                }
                break;
            default:
                for (var i = 0; i < this.slides.length; i++) {
                    var link = document.createElement('a');
                    link.dataset.index = i;
                    link.className = 'bullet';
                    link.textContent = (i + 1);
                    link.setAttribute('href', '#');
                    link.setAttribute('title', `${this.text.Slide} ${i + 1}`);
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.stop();
                        this.show(e.target.dataset.index);
                    });
                    this.navigation.appendChild(link);
                }
        }
        this.element.insertAdjacentElement('afterend', this.navigation);
        // Create steps
        if (config.steps && typeof config.steps === 'object') {
            this.steps = document.createElement('p');
            this.steps.className = 'slider-steps small';
            for (var i = 0; i < this.slides.length; i++) {
                this.steps.insertAdjacentHTML('beforeend', `<a href="#" class="bullet" title="${this.text.Slide} ${i + 1}" data-index="${i}">${i + 1}</a>${config.steps[i] ? `<a href="#" class="name" title="${this.text.Slide} ${i + 1}" data-index="${i}">${config.steps[i]}</a>` : ''}${i < this.slides.length - 1 && config.steps[i] ? '<span class="icon-arrow_forward"></span>' : i < this.slides.length - 1 ? '<span class="connection"></span>' : ''}`)
            }
            var els = this.steps.querySelectorAll('a');
            for(const link of els) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.stop();
                    this.show(e.target.dataset.index);
                });
            }
            this.element.insertAdjacentElement('beforebegin', this.steps);
        }
        // Scrolling event
        this.element.addEventListener('scroll', (e) => {
            clearTimeout(eventTimer);
            eventTimer = setTimeout((e) => {
                this.stop();
                indicatePosition();
                if (this.autoplay) {
                    this.play();
                }
            }, 50);
        });
        // Initial position
        indicatePosition();
        // Autoplay
        if (this.autoplay) {
            this.play();
        }
    }
}