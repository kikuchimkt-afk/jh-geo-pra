const App = {
    state: {
        currentView: 'home',
        selectedCategory: null,
        selectedSubCategory: null,
        activeQuestions: [],
        score: 0,
        weaknessMode: false // Added for weakness mode flag
    },

    init() {
        this.render();
        // Header click listener
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('.click', () => {
                this.state.currentView = 'home';
                this.render();
            });
            logo.style.cursor = 'pointer';
        }
    },

    // Utility to shuffle array
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },

    render() {
        const main = document.getElementById('main-content');
        main.innerHTML = '';

        switch (this.state.currentView) {
            case 'home':
                this.renderHome(main);
                break;
            case 'category':
                this.renderCategorySelection(main);
                break;
            case 'subcategory':
                this.renderSubCategorySelection(main);
                break;
            case 'quiz':
                this.renderQuiz(main);
                break;
            case 'result':
                this.renderResult(main);
                break;
            default:
                this.renderHome(main);
        }
    },

    renderHome(container) {
        const stored = localStorage.getItem('geography_weakness_list');
        const weaknessList = stored ? JSON.parse(stored) : [];
        const count = weaknessList.length;

        const section = document.createElement('section');
        section.className = 'view-home fade-in';
        section.innerHTML = `
            <div class="hero">
                <h1>中学地理<br>完全攻略</h1>
                <p>クイズで楽しく世界の姿や日本の地域をマスターしよう！</p>
                <div class="home-actions">
                    <button class="btn-primary" onclick="App.startApp()">学習を始める</button>
                    <button class="btn-secondary" onclick="App.startWeaknessMode()" style="margin-top: 1rem;">
                        苦手克服モード ${count > 0 ? `(残り${count}問)` : ''}
                    </button>
                </div>
            </div>
        `;
        container.appendChild(section);
    },

    startApp() {
        this.state.currentView = 'category';
        this.render();
    },

    renderCategorySelection(container) {
        const section = document.createElement('section');
        section.className = 'view-category fade-in';

        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = '学習する分野を選んでください';
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'category-grid';

        QUIZ_DATA.categories.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'category-card';
            // Change: Navigate to subcategory selection instead of starting quiz directly
            card.onclick = () => App.selectCategory(cat.id);
            card.innerHTML = `
                <div class="category-icon">${cat.icon}</div>
                <div class="category-name">${cat.name}</div>
                <div class="category-meta">全${cat.subcategories.length}単元</div>
            `;
            grid.appendChild(card);
        });

        section.appendChild(grid);

        // Add back button
        const backBtn = document.createElement('button');
        backBtn.className = 'btn-secondary';
        backBtn.textContent = 'タイトルに戻る';
        backBtn.onclick = () => {
            this.state.currentView = 'home';
            this.render();
        };
        section.appendChild(backBtn);

        container.appendChild(section);
    },

    selectCategory(categoryId) {
        this.state.selectedCategory = categoryId;
        this.state.currentView = 'subcategory';
        this.render();
    },

    renderSubCategorySelection(container) {
        const categoryId = this.state.selectedCategory;
        const category = QUIZ_DATA.categories.find(c => c.id === categoryId);

        const section = document.createElement('section');
        section.className = 'view-category fade-in'; // Reuse category view styles

        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = `${category.name}`;
        section.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.style.textAlign = 'center';
        subtitle.style.marginBottom = '2rem';
        subtitle.style.color = 'var(--text-muted)';
        subtitle.textContent = '詳細な単元を選んでください';
        section.appendChild(subtitle);

        const grid = document.createElement('div');
        grid.className = 'category-grid';

        category.subcategories.forEach(sub => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.onclick = () => App.startQuiz(sub.id);

            // Count questions for this subcategory
            const questionCount = QUIZ_DATA.questions[sub.id]?.length || 0;

            card.innerHTML = `
                <div class="category-name" style="font-size: 1.2rem;">${sub.name}</div>
                <div class="category-meta">全${questionCount}問</div>
            `;
            grid.appendChild(card);
        });

        section.appendChild(grid);

        // Add buttons container
        const btnContainer = document.createElement('div');
        btnContainer.className = 'action-buttons';
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '10px';
        btnContainer.style.justifyContent = 'center';
        btnContainer.style.marginTop = '2rem';

        const backBtn = document.createElement('button');
        backBtn.className = 'btn-secondary';
        backBtn.textContent = '分野選択に戻る';
        backBtn.onclick = () => {
            this.state.currentView = 'category';
            this.render();
        };

        const homeBtn = document.createElement('button');
        homeBtn.className = 'btn-secondary';
        homeBtn.textContent = 'ホームに戻る';
        homeBtn.onclick = () => {
            this.state.currentView = 'home';
            this.render();
        };

        btnContainer.appendChild(backBtn);
        btnContainer.appendChild(homeBtn);
        section.appendChild(btnContainer);

        container.appendChild(section);
    },

    startQuiz(subCategoryId) {
        this.state.selectedSubCategory = subCategoryId;
        this.state.weaknessMode = false;


        // 1. Get original questions
        // Note: Questions are now keyed by subcategory ID directly in QUIZ_DATA.questions
        const originalQuestions = QUIZ_DATA.questions[subCategoryId] || [];

        if (originalQuestions.length === 0) {
            alert('この単元の問題はまだありません。');
            return;
        }

        // 2. Clone and shuffle options for each question
        const randomizedQuestions = originalQuestions.map(q => {
            // Deep clone to avoid mutating original data
            const questionCopy = JSON.parse(JSON.stringify(q));

            // Get the text of the correct answer
            const correctText = questionCopy.options[questionCopy.a];

            // Shuffle the options
            questionCopy.options = this.shuffleArray(questionCopy.options);

            // Update the index of the correct answer
            questionCopy.a = questionCopy.options.indexOf(correctText);

            return questionCopy;
        });

        // 3. Shuffle the order of the questions themselves
        this.state.activeQuestions = this.shuffleArray(randomizedQuestions);

        this.state.currentQuestionIndex = 0;
        this.state.score = 0;
        this.state.isAnswered = false;
        this.state.currentView = 'quiz';
        this.render();
        this.render();
    },

    startWeaknessMode() {
        const stored = localStorage.getItem('geography_weakness_list');
        const weaknessList = stored ? JSON.parse(stored) : [];

        if (weaknessList.length === 0) {
            alert('苦手な問題はまだありません。クイズで間違えるとここに追加されます！');
            return;
        }

        // Shuffle current weakness list
        this.state.activeQuestions = this.shuffleArray(weaknessList).map(q => {
            // Deep clone and shuffle options logic is needed here too? 
            // Typically stored questions might already have shuffled options if saved directly.
            // But let's assume we saved the raw question object. 
            // Ideally we should save the raw question data.

            // Let's re-shuffle options to ensure randomness every time
            const questionCopy = JSON.parse(JSON.stringify(q));
            const correctText = questionCopy.options[questionCopy.a];
            questionCopy.options = this.shuffleArray(questionCopy.options);
            questionCopy.a = questionCopy.options.indexOf(correctText);
            return questionCopy;
        });

        this.state.weaknessMode = true;
        this.state.selectedCategory = null; // No specific category
        this.state.selectedSubCategory = null;
        this.state.currentQuestionIndex = 0;
        this.state.score = 0;
        this.state.isAnswered = false;
        this.state.currentView = 'quiz';
        this.render();
    },

    saveWeakness(question) {
        if (question.excludeWeakness) return;

        // Retrieve ONE original question object (without shuffled options if possible, 
        // but here we just save what we have, ensuring we can identify the correct answer)
        // To avoid keeping shuffled options effectively "stuck", it's best to find the original from QUIZ_DATA if possible.
        // However, searching through all data is slow.
        // Let's just save the current question object. When loading, we re-shuffle.
        // To prevent duplication, we use question text as unique key.

        const stored = localStorage.getItem('geography_weakness_list');
        let list = stored ? JSON.parse(stored) : [];

        // Check for duplicates
        if (!list.some(item => item.q === question.q)) {
            // Restore options order if needed? No, shuffle handles it.
            // But we need to make sure 'a' points to the correct text.
            // The active question object is already consistent (options[a] is correct).
            list.push(question);
            localStorage.setItem('geography_weakness_list', JSON.stringify(list));
        }
    },

    removeWeakness(question) {
        const stored = localStorage.getItem('geography_weakness_list');
        if (!stored) return;

        let list = JSON.parse(stored);
        const initialLength = list.length;
        list = list.filter(item => item.q !== question.q);

        if (list.length !== initialLength) {
            localStorage.setItem('geography_weakness_list', JSON.stringify(list));
        }
    },


    renderQuiz(container) {
        const subCategoryId = this.state.selectedSubCategory;
        const categoryId = this.state.selectedCategory;
        const category = categoryId ? QUIZ_DATA.categories.find(c => c.id === categoryId) : null;
        const subCategory = (category && subCategoryId) ? category.subcategories.find(s => s.id === subCategoryId) : null;

        const modeTitle = this.state.weaknessMode ? '苦手克服モード' : subCategory ? subCategory.name : 'クイズ';


        const questions = this.state.activeQuestions;

        if (!questions || this.state.currentQuestionIndex >= questions.length) {
            this.state.currentView = 'result';
            this.render();
            return;
        }

        const question = questions[this.state.currentQuestionIndex];
        const progress = `${this.state.currentQuestionIndex + 1} / ${questions.length}`;

        const section = document.createElement('section');
        section.className = 'view-quiz fade-in';

        section.innerHTML = `
            <div class="quiz-header">
                <span class="quiz-category">${modeTitle}</span>
                <button class="btn-text" onclick="App.goHome()" style="font-size: 0.9rem; color: var(--text-muted); background: none; border: none; cursor: pointer;">ホームへ</button>
                <span class="quiz-progress">Q. ${progress}</span>
            </div>
            
            <div class="quiz-card">
                <h3 class="question-text">${question.q}</h3>
                ${question.img ? `<div class="quiz-image-container" style="text-align: center; margin-bottom: 1rem;"><img src="${question.img}" alt="問題画像" style="max-width: 100%; max-height: 250px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>` : ''}
                <div class="options-grid">
                    ${question.options.map((opt, i) => `
                        <button class="option-btn" onclick="App.checkAnswer(${i})">${opt}</button>
                    `).join('')}
                </div>
            </div>

            <div id="feedback-area" class="feedback-area hidden">
                <div class="feedback-content">
                    <h4 id="feedback-title"></h4>
                    <p id="feedback-expl"></p>
                    <button class="btn-primary" onclick="App.nextQuestion()">次へ</button>
                </div>
            </div>
        `;

        container.appendChild(section);
    },

    checkAnswer(selectedIndex) {
        if (this.state.isAnswered) return;

        this.state.isAnswered = true;

        const question = this.state.activeQuestions[this.state.currentQuestionIndex];
        const isCorrect = selectedIndex === question.a;

        if (isCorrect) this.state.score++;

        // UI Updates
        const options = document.querySelectorAll('.option-btn');
        options.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === question.a) {
                btn.classList.add('correct');
            } else if (idx === selectedIndex && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        const feedbackArea = document.getElementById('feedback-area');
        const feedbackTitle = document.getElementById('feedback-title');
        const feedbackExpl = document.getElementById('feedback-expl');

        feedbackArea.classList.remove('hidden');
        if (isCorrect) {
            feedbackArea.classList.add('is-correct');
            feedbackTitle.textContent = '正解！🎉';
        } else {
            feedbackArea.classList.add('is-incorrect');
            feedbackTitle.textContent = '残念...不正解';
        }
        feedbackExpl.textContent = question.expl;

        // Weakness logic
        if (isCorrect) {
            this.removeWeakness(question);
        } else {
            this.saveWeakness(question);
        }
    },


    nextQuestion() {
        this.state.currentQuestionIndex++;
        this.state.isAnswered = false;
        this.render();
    },

    renderResult(container) {
        // const subCategoryId = this.state.selectedSubCategory; 
        // Need to handle null subCategory in weakness mode

        const total = this.state.activeQuestions.length;
        const score = this.state.score;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

        const section = document.createElement('section');
        section.className = 'view-result fade-in';

        let message = '';
        if (percentage === 100) message = '地理博士レベルです！素晴らしい！🌍';
        else if (percentage >= 80) message = 'あと少しで満点！その調子です！✈️';
        else message = '基本を復習して、もう一度挑戦しよう！🗺️';

        section.innerHTML = `
            <div class="result-card">
                <h2>結果発表</h2>
                <div class="score-display">
                    <span class="score-num">${score}</span>
                    <span class="score-total">/ ${total}</span>
                </div>
                <p class="result-message">${message}</p>
                <div class="result-actions">
                    <button class="btn-primary" onclick="App.startApp()">分野選択へ</button>
                    ${this.state.weaknessMode ?
                `<button class="btn-secondary" onclick="App.startWeaknessMode()">もう一度挑戦</button>` :
                `<button class="btn-secondary" onclick="App.startQuiz('${this.state.selectedSubCategory}')">もう一度挑戦</button>`
            }
                    <button class="btn-secondary" onclick="App.goHome()">ホームへ</button>
                </div>

            </div>
        `;
        container.appendChild(section);
    },

    goHome() {
        this.state.currentView = 'home';
        this.render();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
