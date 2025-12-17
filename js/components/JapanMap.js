
class JapanMap {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.scale = 1;
        this.panning = false;
        this.hasMoved = false; // Track if a pan occurred
        this.pointX = 0;
        this.pointY = 0;
        this.start = { x: 0, y: 0 };
    }

    mount() {
        this.container.innerHTML = window.japanMapSVG;
        this.svg = this.container.querySelector('svg');
        if (!this.svg) return;
        this.svg.style.width = '100%';
        this.svg.style.height = '100%';
        this.svg.style.transformOrigin = 'center';

        const prefectures = this.container.querySelectorAll('.prefecture');
        prefectures.forEach(pref => {
            pref.style.cursor = 'pointer';
            pref.style.transition = 'fill 0.2s';

            // Store original fill for reset
            pref.setAttribute('data-original-fill', '#EEEEEE');

            pref.addEventListener('click', (e) => {
                if (this.hasMoved) {
                    e.stopPropagation();
                    return;
                }

                const id = parseInt(pref.getAttribute('data-code'));
                if (this.callbacks.onRegionClick) {
                    this.callbacks.onRegionClick(id);
                }
                e.stopPropagation();
            });

            pref.addEventListener('mouseenter', () => {
                // Ensure we don't override special highlights
                if (!pref.classList.contains('highlighted')) {
                    pref.style.fill = 'var(--accent-glow)';
                }
            });
            pref.addEventListener('mouseleave', () => {
                if (!pref.classList.contains('highlighted')) {
                    pref.style.fill = pref.getAttribute('data-original-fill');
                }
            });

            pref.addEventListener('touchend', (e) => {
                if (!this.hasMoved) {
                    // Manual trigger if needed
                }
            });
        });

        this.initZoomPan();
    }

    highlightPrefecture(id, type) {
        const pref = this.container.querySelector(`.prefecture[data-code="${id}"]`);
        if (!pref) return;

        let color = '#EEEEEE';
        if (type === 'correct') color = '#e74c3c'; // Red for "This was the answer"
        if (type === 'selected') color = '#f1c40f'; // Yellow for selection

        pref.style.fill = color;
        pref.classList.add('highlighted');

        // Auto remove highlight after a duration if needed, 
        // but App.js handles clearing map so we just provide a reset method.
    }

    resetHighlights() {
        const highlighted = this.container.querySelectorAll('.highlighted');
        highlighted.forEach(el => {
            el.style.fill = el.getAttribute('data-original-fill');
            el.classList.remove('highlighted');
        });
    }

    initZoomPan() {
        const setTransform = () => {
            this.svg.style.transform = `translate(${this.pointX}px, ${this.pointY}px) scale(${this.scale})`;
        }

        const DISTANCE_THRESHOLD = 5;

        // Mouse Events
        this.container.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            this.start = { x: e.clientX - this.pointX, y: e.clientY - this.pointY };
            this.panning = true;
            this.hasMoved = false;
        });

        this.container.addEventListener('mousemove', (e) => {
            e.preventDefault();
            if (!this.panning) return;

            this.pointX = (e.clientX - this.start.x);
            this.pointY = (e.clientY - this.start.y);

            this.hasMoved = true;
            setTransform();
        });

        this.container.addEventListener('mouseup', () => {
            this.panning = false;
        });

        this.container.addEventListener('mouseleave', () => {
            this.panning = false;
        });

        // Wheel Zoom
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const xs = (e.clientX - this.pointX) / this.scale;
            const ys = (e.clientY - this.pointY) / this.scale;
            const delta = -Math.sign(e.deltaY) * 0.1;
            const newScale = Math.min(Math.max(0.5, this.scale + delta), 4);

            this.pointX = e.clientX - xs * newScale;
            this.pointY = e.clientY - ys * newScale;
            this.scale = newScale;

            setTransform();
        });

        // Touch Events
        this.container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.start = { x: e.touches[0].clientX - this.pointX, y: e.touches[0].clientY - this.pointY };
                this.panning = true;
                this.hasMoved = false;
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            }
        });

        this.container.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.panning) {
                e.preventDefault();
                const dx = Math.abs(e.touches[0].clientX - this.touchStartX);
                const dy = Math.abs(e.touches[0].clientY - this.touchStartY);

                if (dx > DISTANCE_THRESHOLD || dy > DISTANCE_THRESHOLD) {
                    this.hasMoved = true;
                }

                this.pointX = e.touches[0].clientX - this.start.x;
                this.pointY = e.touches[0].clientY - this.start.y;
                setTransform();
            }
        });

        this.container.addEventListener('touchend', () => {
            this.panning = false;
        });
    }
}
window.JapanMap = JapanMap;
