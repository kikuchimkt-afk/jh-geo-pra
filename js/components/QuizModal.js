
class QuizModal {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.element = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    render(questionData) {
        this.element = document.createElement('div');
        this.element.className = 'quiz-hud fade-in';

        // Initial Position: Centered Bottom
        // We use top/left for draggable capability
        this.element.style.cssText = `
            position: fixed;
            top: 80%; 
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 600px;
            z-index: 1000;
            display: flex;
            justify-content: center;
            touch-action: none; /* Prevent browser scrolling while dragging */
        `;

        const card = document.createElement('div');
        card.className = 'quiz-card slide-up';
        card.style.cssText = `
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            padding: 1rem 2rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            width: 100%;
            text-align: center;
            border: 1px solid rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            cursor: grab;
            user-select: none;
        `;

        let title = '';
        let question = '';
        let hint = '地図をタッチして回答 (Touch map)';

        const target = questionData.target;

        switch (questionData.mode) {
            case 'prefecture':
                title = '次の都道府県はどこ？';
                question = `<span style="color:var(--primary-color); font-size: 2rem;">${target.name}</span>`;
                break;
            case 'capital':
                title = '県庁所在地クイズ';
                question = `<span style="color:var(--accent-color); font-size: 1.8rem;">${target.capital}</span> があるのはどこ？`;
                break;
            case 'feature':
                const feature = target.features[Math.floor(Math.random() * target.features.length)];
                title = '特徴から推測！';
                question = `<span style="color:var(--success-color); font-size: 1.6rem;">${feature}</span> といえば？`;
                break;
            case 'region':
                title = '地方区分';
                question = `<span style="color:var(--gold); font-size: 2rem; text-shadow: 1px 1px 0 rgba(0,0,0,0.1);">${target.region}地方</span> の都道府県を1つ選んで！`;
                break;
            default:
                title = '問題';
                question = target.name;
        }

        card.innerHTML = `
            <div style="width: 40px; height: 4px; background: #ddd; border-radius: 2px; margin-bottom: 0.5rem;"></div>
            <div style="color:var(--text-sub); font-size: 0.9rem; font-weight:bold;">${title}</div>
            <div style="font-weight:800; line-height:1.2;">${question}</div>
            <div style="color:var(--text-sub); font-size: 0.8rem; margin-top:0.2rem;">${hint}</div>
        `;

        this.element.appendChild(card);
        this.initDrag(card); // Attach drag events to card

        return this.element;
    }

    initDrag(target) {
        const startDrag = (clientX, clientY) => {
            this.isDragging = true;
            target.style.cursor = 'grabbing';
            const rect = this.element.getBoundingClientRect();
            this.dragOffset.x = clientX - rect.left;
            this.dragOffset.y = clientY - rect.top;

            // Remove transform to rely on top/left
            this.element.style.transform = 'none';
            this.element.style.left = `${rect.left}px`;
            this.element.style.top = `${rect.top}px`;
        };

        const onDrag = (clientX, clientY) => {
            if (!this.isDragging) return;
            const x = clientX - this.dragOffset.x;
            const y = clientY - this.dragOffset.y;
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
        };

        const endDrag = () => {
            if (this.isDragging) {
                this.isDragging = false;
                target.style.cursor = 'grab';
            }
        };

        // Mouse Events
        target.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => onDrag(e.clientX, e.clientY));
        window.addEventListener('mouseup', endDrag);

        // Touch Events
        target.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.isDragging && e.touches.length === 1) {
                e.preventDefault();
                onDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        window.addEventListener('touchend', endDrag);
    }

    showResult(isCorrect, target) {
        if (this.element) {
            this.element.style.transition = 'opacity 0.2s';
            this.element.style.opacity = '0';
        }

        const feedback = document.createElement('div');
        feedback.className = 'feedback-toast fade-in';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${isCorrect ? 'var(--success-color)' : 'var(--error-color)'};
            color: white;
            padding: 2rem 4rem;
            border-radius: var(--radius-lg);
            font-size: 3rem;
            font-weight: 800;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 2000;
            pointer-events: none;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            white-space: nowrap;
            text-align: center;
        `;

        let subText = isCorrect ? '正解！' : '不正解...';
        let detailText = `<div style="font-size:1.5rem; margin-top:0.5rem; font-weight:normal;">正解は ${target.name} でした</div>`;

        feedback.innerHTML = `
            <div>${isCorrect ? '⭕' : '❌'}</div>
            <div>${subText}</div>
            ${!isCorrect ? detailText : ''}
        `;

        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
            if (this.callbacks.onNext) this.callbacks.onNext();
        }, 1200);
    }
}
window.QuizModal = QuizModal;
