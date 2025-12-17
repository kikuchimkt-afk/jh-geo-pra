
class LandingPage {
    constructor(callbacks) {
        this.callbacks = callbacks;
    }

    render() {
        const container = document.createElement('div');
        container.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
            padding: 2rem;
            position: relative;
            overflow-y: auto;
        `;

        const title = document.createElement('h1');
        title.innerHTML = `<span style="color:var(--primary-color)">日本</span><span style="color:var(--error-color)">地図</span>マスター`;
        title.style.cssText = `
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 2rem;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
            letter-spacing: 0.1em;
            text-align: center;
            font-family: 'M PLUS Rounded 1c', sans-serif;
        `;

        const subTitle = document.createElement('p');
        subTitle.textContent = 'モードを選択してチャレンジ！';
        subTitle.style.cssText = `
            font-size: 1.2rem;
            color: var(--text-sub);
            margin-bottom: 3rem;
            font-weight: 700;
        `;

        const menuGrid = document.createElement('div');
        menuGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            width: 100%;
            max-width: 800px;
        `;

        const modes = [
            { id: 'prefecture', label: '都道府県クイズ', desc: '場所を当てよう！', color: 'var(--primary-color)', icon: '🗺️' },
            { id: 'capital', label: '県庁所在地', desc: '県庁はどこにある？', color: 'var(--accent-color)', icon: '🏛️' },
            { id: 'feature', label: '特徴・名産', desc: '特産品や特徴から推測', color: 'var(--success-color)', icon: '🍎' },
            { id: 'region', label: '地方区分', desc: 'どの地方にある？', color: 'var(--gold)', icon: '🗾' },
            { id: 'mix', label: '総合テスト', desc: '全モードからの出題', color: '#8e44ad', icon: '🔥' }
        ];

        modes.forEach(mode => {
            const btn = document.createElement('button');
            btn.className = 'fade-in';
            btn.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 1.5rem;
                border: none;
                border-radius: var(--radius-md);
                background: white;
                box-shadow: var(--shadow-md);
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                text-align: center;
                border-left: 6px solid ${mode.color};
                position: relative;
                overflow: hidden;
            `;

            btn.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${mode.icon}</div>
                <div style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; font-family: 'M PLUS Rounded 1c', sans-serif;">${mode.label}</div>
                <div style="font-size: 0.9rem; color: var(--text-sub);">${mode.desc}</div>
            `;

            btn.onmouseenter = () => {
                btn.style.transform = 'translateY(-4px)';
                btn.style.boxShadow = 'var(--shadow-lg)';
            };
            btn.onmouseleave = () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'var(--shadow-md)';
            };

            btn.onclick = () => {
                if (this.callbacks.onStartGame) {
                    this.callbacks.onStartGame(mode.id);
                }
            };

            menuGrid.appendChild(btn);
        });

        const footer = document.createElement('div');
        footer.style.cssText = `
            margin-top: 3rem;
            color: var(--text-sub);
            font-size: 0.8rem;
            opacity: 0.7;
        `;
        footer.textContent = '地図をタッチして回答してください';

        container.appendChild(title);
        container.appendChild(subTitle);
        container.appendChild(menuGrid);
        container.appendChild(footer);

        return container;
    }
}
window.LandingPage = LandingPage;
