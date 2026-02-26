import { BaseGame } from './base-game.js';

export class EcoRunGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.targetScore = level >= 3 ? 10 : 5;
        this.spawnRate = Math.max(500, 1500 - (level * 100)); // Increases with level
        this.lastSpawnTime = 0;
        this.trashContainer = null;
    }

    setupGame() {
        // Set up background and container
        this.container.innerHTML = ''; // Clear previous
        this.container.className = 'eco-run-game'; // Apply CSS class

        // Add specific game UI for score
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '70px';
        overlay.style.left = '20px';
        overlay.style.fontSize = '24px';
        overlay.style.color = 'white';
        overlay.innerHTML = `Basura: <span id="trashCount">0</span>/${this.targetScore}`;
        this.container.appendChild(overlay);

        // Instructions overlay (Briefly)
        const briefing = document.createElement('div');
        briefing.className = 'game-overlay';
        briefing.style.background = 'rgba(0,0,0,0.5)';
        briefing.innerHTML = '<h2 style="font-size: 40px; color: #fff;">¡Limpia la ciudad!</h2><p>Click en la basura</p>';
        this.container.appendChild(briefing);

        setTimeout(() => {
            if (briefing.parentNode) briefing.parentNode.removeChild(briefing);
        }, 1500);
    }

    update() {
        const now = Date.now();
        if (now - this.lastSpawnTime > this.spawnRate) {
            this.spawnTrash();
            this.lastSpawnTime = now;
        }
    }

    spawnTrash() {
        const trash = document.createElement('div');
        trash.className = 'trash-item';

        // Random position within container (assuming 800x600 roughly or relative)
        // Container text says "height: 100%" of parent (600px)
        const maxX = this.container.clientWidth - 64;
        const maxY = this.container.clientHeight - 64;

        const x = Math.random() * maxX;
        const y = Math.random() * maxY;

        trash.style.left = `${x}px`;
        trash.style.top = `${y}px`;

        // Random trash image (using CSS colors or placeholder for now)
        // Ideally use background-image from sprite sheet
        const colors = ['#555', '#444', '#666', '#8B4513'];
        trash.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        trash.style.borderRadius = '50%'; // Ball of trash
        trash.style.border = '2px solid #000';

        trash.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.collectTrash(trash);
        });

        // Auto-remove after some time (fail condition for individual item?) 
        // Logic says "Eliminar basura antes de que desaparezca". 
        // So we can fade it out.

        this.container.appendChild(trash);

        // Despawn logic
        setTimeout(() => {
            if (trash.parentNode) {
                trash.classList.add('trash-vanish');
                setTimeout(() => {
                    if (trash.parentNode) trash.parentNode.removeChild(trash);
                }, 300);
            }
        }, 2000 + Math.random() * 1000); // 2-3 seconds lifetime
    }

    collectTrash(element) {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
            this.score++;
            this.updateScoreDisplay();

            if (this.score >= this.targetScore) {
                this.finish(true);
            }
        }
    }

    updateScoreDisplay() {
        const el = document.getElementById('trashCount');
        if (el) el.textContent = this.score;
    }
}
