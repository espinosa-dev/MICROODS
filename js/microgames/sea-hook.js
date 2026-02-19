import { BaseGame } from './base-game.js';

export class SeaHookGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.targetScore = level >= 3 ? 10 : 5;
        this.catcherX = 50; // Percentage
        this.catcherWidth = 10; // Percentage

        this.items = []; // {element, type, x, y, speed}
        this.fishCaught = 0;
        this.maxFishCaught = 3;

        this.lastSpawn = 0;
        this.spawnRate = Math.max(500, 1500 - (level * 100));

        this.boundMouseMove = this.handleInput.bind(this);
    }

    setupGame() {
        this.container.innerHTML = '';
        this.container.className = 'sea-hook-game';

        // Background
        this.container.style.backgroundColor = '#006994';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.cursor = 'none'; // Hide default cursor

        // Catcher Element (Hook at bottom)
        this.catcherEl = document.createElement('div');
        this.catcherEl.className = 'sea-catcher';
        this.container.appendChild(this.catcherEl);

        // Score UI
        const ui = document.createElement('div');
        ui.className = 'game-ui-top-left';
        ui.innerHTML = `Residuos: <span id="trashScore">0</span>/${this.targetScore} <br> Peces: <span id="fishScore" style="color:red">0</span>/${this.maxFishCaught}`;
        this.container.appendChild(ui);

        // Instructions
        const info = document.createElement('div');
        info.className = 'game-instruction';
        info.innerText = 'Mueve el ratón para recoger basura';
        this.container.appendChild(info);

        document.addEventListener('mousemove', this.boundMouseMove);
    }

    handleInput(e) {
        if (!this.isActive) return;

        // Map mouse X to percentage relative to container
        const rect = this.container.getBoundingClientRect();
        let x = e.clientX - rect.left;

        // Clamp
        if (x < 0) x = 0;
        if (x > rect.width) x = rect.width;

        this.catcherX = (x / rect.width) * 100;

        // Update visual
        this.catcherEl.style.left = `${this.catcherX}%`;
    }

    update() {
        if (!this.isActive) return;

        // Spawn Items
        const now = Date.now();
        if (now - this.lastSpawn > this.spawnRate) {
            this.spawnItem();
            this.lastSpawn = now;
        }

        // Move Items
        this.items.forEach((item, index) => {
            item.y += item.speed;
            item.element.style.top = `${item.y}%`;

            // Check Collision with Catcher (Bottom ~90%)
            if (item.y > 85 && item.y < 95) {
                // Check X overlap
                // Item width is approx 5-8%
                const itemX = item.x;
                // Catcher width is this.catcherWidth (centered)
                const catcherLeft = this.catcherX - (this.catcherWidth / 2);
                const catcherRight = this.catcherX + (this.catcherWidth / 2);

                if (itemX >= catcherLeft && itemX <= catcherRight) {
                    this.handleCollision(item, index);
                    return;
                }
            }

            // Remove if off screen
            if (item.y > 100) {
                item.element.remove();
                this.items.splice(index, 1);
            }
        });
    }

    spawnItem() {
        const type = Math.random() > 0.3 ? 'trash' : 'fish'; // 70% trash, 30% fish
        const el = document.createElement('div');
        el.className = 'sea-item-emoji';
        el.innerText = type === 'trash' ? this.getRandomTrash() : '🐟';

        const x = Math.random() * 90 + 5; // 5% to 95%
        el.style.left = `${x}%`;
        el.style.top = '-10%';

        this.container.appendChild(el);

        this.items.push({
            element: el,
            type: type,
            x: x,
            y: -10,
            speed: 0.5 + (Math.random() * 0.5) + (this.level * 0.1) // Vertical speed
        });
    }

    getRandomTrash() {
        const trash = ['🛢️', '🥤', '🥡', '🦴', '👞'];
        return trash[Math.floor(Math.random() * trash.length)];
    }

    handleCollision(item, index) {
        item.element.remove();
        this.items.splice(index, 1);

        if (item.type === 'trash') {
            this.score++;
            document.getElementById('trashScore').innerText = this.score;

            // Visual feedback
            const feedback = document.createElement('div');
            feedback.innerText = '+1';
            feedback.style.position = 'absolute';
            feedback.style.left = `${this.catcherX}%`;
            feedback.style.bottom = '15%';
            feedback.style.color = 'yellow';
            feedback.style.animation = 'floatUp 0.5s forwards';
            this.container.appendChild(feedback);

            if (this.score >= this.targetScore) {
                this.finish(true);
            }
        } else {
            // Caught a fish!
            this.fishCaught++;
            document.getElementById('fishScore').innerText = this.fishCaught;

            // Visual feedback
            const feedback = document.createElement('div');
            feedback.innerText = '❌';
            feedback.style.position = 'absolute';
            feedback.style.left = `${this.catcherX}%`;
            feedback.style.bottom = '15%';
            feedback.style.color = 'red';
            feedback.style.animation = 'floatUp 0.5s forwards';
            this.container.appendChild(feedback);

            if (this.fishCaught >= this.maxFishCaught) {
                this.finish(false);
            }
        }
    }

    cleanup() {
        super.cleanup();
        document.removeEventListener('mousemove', this.boundMouseMove);
        this.container.style.cursor = 'default';
    }
}
