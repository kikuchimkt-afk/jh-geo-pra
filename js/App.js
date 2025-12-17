
class App {
    constructor(rootElement) {
        this.root = rootElement;
        this.gameState = {
            mode: null,
            score: 0,
            questionIndex: 0,
            queue: [], // Array of question objects
            isGameActive: false,
            isWaitingForNext: false
        };
        this.map = null;
        this.quizModal = null;
    }

    init() {
        this.showLandingPage();
    }

    clear() {
        this.root.innerHTML = '';
    }

    showLandingPage() {
        this.clear();
        // LandingPage is now global
        const landing = new LandingPage({
            onStartGame: (mode) => this.startGame(mode)
        });
        this.root.appendChild(landing.render());
    }

    startGame(mode) {
        this.gameState.mode = mode;
        this.gameState.score = 0;
        this.gameState.questionIndex = 0;
        this.gameState.isGameActive = true;
        this.gameState.isWaitingForNext = false;

        this.gameState.queue = this.generateQuestions(mode);

        this.clear();
        this.renderGameLayout();
        this.nextQuestion();
    }

    generateQuestions(mode) {
        // prefectures is global
        const shuffled = [...prefectures].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);

        return selected.map(p => {
            let type = mode;
            if (mode === 'mix') {
                const types = ['prefecture', 'capital', 'feature', 'region'];
                type = types[Math.floor(Math.random() * types.length)];
            }

            return {
                mode: type,
                target: p,
            };
        });
    }

    renderGameLayout() {
        const container = document.createElement('div');
        container.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
        `;

        const mapWrapper = document.createElement('div');
        mapWrapper.className = 'map-container';
        container.appendChild(mapWrapper);

        const header = document.createElement('div');
        header.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            pointer-events: none;
            z-index: 150;
        `;

        const backBtn = document.createElement('button');
        backBtn.textContent = '戻る'; // Localized
        backBtn.className = 'btn-primary';
        backBtn.style.pointerEvents = 'auto';
        backBtn.onclick = () => {
            if (confirm('ゲームを終了してメニューに戻りますか？')) this.showLandingPage();
        };

        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.style.cssText = `
            background: rgba(255,255,255,0.9);
            padding: 0.5rem 1rem;
            border-radius: var(--radius-md);
            font-weight: bold;
            box-shadow: var(--shadow-sm);
        `;
        this.updateScoreDisplay();

        header.appendChild(backBtn);
        header.appendChild(this.scoreDisplay);
        container.appendChild(header);

        this.root.appendChild(container);

        // JapanMap is global
        this.map = new JapanMap(mapWrapper, {
            onRegionClick: (id) => this.handleAnswer(id)
        });
        this.map.mount();

        // QuizModal is global
        this.quizModal = new QuizModal({
            onNext: () => this.nextQuestion()
        });
    }

    updateScoreDisplay() {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `正解数: ${this.gameState.score} / ${this.gameState.queue.length}`;
        }
    }

    nextQuestion() {
        if (this.gameState.questionIndex >= this.gameState.queue.length) {
            this.finishGame();
            return;
        }

        // Reset map highlights from previous turn
        if (this.map) this.map.resetHighlights();

        const currentQ = this.gameState.queue[this.gameState.questionIndex];
        this.gameState.isWaitingForNext = false;

        const modalEl = this.quizModal.render(currentQ);

        const existing = this.root.querySelector('.quiz-hud, .overlay');
        if (existing) existing.remove();

        this.root.appendChild(modalEl);
    }

    handleAnswer(clickedId) {
        if (!this.gameState.isGameActive || this.gameState.isWaitingForNext) return;

        const currentQ = this.gameState.queue[this.gameState.questionIndex];
        const isCorrect = this.checkAnswer(currentQ, clickedId);

        if (isCorrect) {
            this.gameState.score++;
            this.updateScoreDisplay();
        } else {
            // Wrong answer: Highlight the correct prefecture
            // Use 'correct' style (red) to indicate "This was the answer"
            this.map.highlightPrefecture(currentQ.target.id, 'correct');
        }

        this.gameState.isWaitingForNext = true;
        this.quizModal.showResult(isCorrect, currentQ.target);

        this.gameState.questionIndex++;
    }

    checkAnswer(question, clickedId) {
        const target = question.target;

        if (question.mode === 'region') {
            const clickedPref = prefectures.find(p => p.id === clickedId);
            return clickedPref.region === target.region;
        }

        return clickedId === target.id;
    }

    finishGame() {
        // ResultScreen is global
        const result = new ResultScreen({
            onRetry: () => this.showLandingPage()
        });
        this.clear();
        this.root.appendChild(result.render(this.gameState.score, this.gameState.queue.length));
    }
}
window.App = App;
