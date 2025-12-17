
class ResultScreen {
    constructor(callbacks) {
        this.callbacks = callbacks;
    }

    render(score, total) {
        const container = document.createElement('div');
        container.className = 'overlay fade-in';

        const card = document.createElement('div');
        card.className = 'quiz-card slide-up';
        card.style.cssText = `
            background: var(--card-bg);
            padding: 3rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            text-align: center;
        `;

        const percentage = Math.round((score / total) * 100);

        card.innerHTML = `
            <h1 style="color:var(--primary-color); margin-bottom:1rem;">Result</h1>
            <div style="font-size: 4rem; font-weight:bold; color:var(--accent-color); margin-bottom:1rem;">
                ${score} / ${total}
            </div>
            <p style="font-size: 1.2rem; color:var(--text-sub); margin-bottom:2rem;">
                Score: ${percentage}%
            </p>
            <button id="retry-btn" class="btn-primary">Back to Menu</button>
        `;

        container.appendChild(card);

        setTimeout(() => {
            const btn = container.querySelector('#retry-btn');
            if (btn) btn.onclick = this.callbacks.onRetry;
        }, 0);

        return container;
    }
}
window.ResultScreen = ResultScreen;
