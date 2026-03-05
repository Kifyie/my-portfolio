// =====================================================
// LETTER SWAP - Vanilla JS Implementation
// Based on LetterSwapPingPong from framer-motion
// =====================================================

class LetterSwap {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            duration: options.duration || 0.7,
            staggerDuration: options.staggerDuration || 0.03,
            staggerFrom: options.staggerFrom || 'first', // 'first', 'last', 'center'
            reverse: options.reverse !== undefined ? options.reverse : true,
            ease: options.ease || 'cubic-bezier(0.34, 1.56, 0.64, 1)', // spring-like
            ...options
        };

        this.originalText = element.textContent.trim();
        this.isHovered = false;
        this.init();
    }

    init() {
        this.element.classList.add('letter-swap');
        this.buildLetters();

        this.element.addEventListener('mouseenter', () => this.hoverStart());
        this.element.addEventListener('mouseleave', () => this.hoverEnd());
    }

    getStaggerDelay(index, total) {
        const { staggerDuration, staggerFrom } = this.options;

        switch (staggerFrom) {
            case 'last':
                return (total - 1 - index) * staggerDuration;
            case 'center':
                const center = (total - 1) / 2;
                return Math.abs(index - center) * staggerDuration;
            case 'first':
            default:
                return index * staggerDuration;
        }
    }

    buildLetters() {
        const text = this.originalText;
        this.element.innerHTML = '';
        this.element.setAttribute('aria-label', text);

        // Screen reader text
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = text;
        this.element.appendChild(srText);

        // Container for letters
        const container = document.createElement('span');
        container.className = 'letter-swap__container';

        const letters = text.split('');
        const total = letters.length;

        letters.forEach((letter, i) => {
            const delay = this.getStaggerDelay(i, total);
            const wrapper = document.createElement('span');
            wrapper.className = 'letter-swap__wrapper';

            // Primary letter (visible)
            const primary = document.createElement('span');
            primary.className = 'letter-swap__primary';
            primary.textContent = letter === ' ' ? '\u00A0' : letter;
            primary.style.transition = `transform ${this.options.duration}s ${this.options.ease} ${delay}s`;

            // Secondary letter (hidden, slides in on hover)
            const secondary = document.createElement('span');
            secondary.className = 'letter-swap__secondary';
            secondary.textContent = letter === ' ' ? '\u00A0' : letter;
            secondary.style.transition = `top ${this.options.duration}s ${this.options.ease} ${delay}s`;
            secondary.style.top = this.options.reverse ? '-100%' : '100%';
            secondary.setAttribute('aria-hidden', 'true');

            wrapper.appendChild(primary);
            wrapper.appendChild(secondary);
            container.appendChild(wrapper);
        });

        this.element.appendChild(container);

        this.primaryLetters = this.element.querySelectorAll('.letter-swap__primary');
        this.secondaryLetters = this.element.querySelectorAll('.letter-swap__secondary');
    }

    hoverStart() {
        if (this.isHovered) return;
        this.isHovered = true;

        const direction = this.options.reverse ? '100%' : '-100%';

        this.primaryLetters.forEach(letter => {
            letter.style.transform = `translateY(${direction})`;
        });

        this.secondaryLetters.forEach(letter => {
            letter.style.top = '0%';
        });
    }

    hoverEnd() {
        this.isHovered = false;

        this.primaryLetters.forEach(letter => {
            letter.style.transform = 'translateY(0)';
        });

        this.secondaryLetters.forEach(letter => {
            letter.style.top = this.options.reverse ? '-100%' : '100%';
        });
    }
}

// Auto-initialize elements with data-letter-swap attribute
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-letter-swap]').forEach(el => {
        const options = {};
        if (el.dataset.duration) options.duration = parseFloat(el.dataset.duration);
        if (el.dataset.staggerDuration) options.staggerDuration = parseFloat(el.dataset.staggerDuration);
        if (el.dataset.staggerFrom) options.staggerFrom = el.dataset.staggerFrom;
        if (el.dataset.reverse) options.reverse = el.dataset.reverse === 'true';

        new LetterSwap(el, options);
    });
});

// Export for manual use
window.LetterSwap = LetterSwap;
