import { BaseGame } from './base-game.js';

export class SuperFarmerGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.timeLeft = 25; // Increased time
        this.cropsCaught = 0;
        this.targetCrops = 4 + (this.level - 1); // Reduced target crops slightly
        this.playerX = 50;
        this.playerY = 50;
        this.speed = 0.4; // Reduced speed for smoother control (was 0.8)
        this.keys = {};
        this.elements = [];
    }

    setupGame() {
        this.container.classList.add('super-farmer-game');
        this.container.innerHTML = `
            <div class="farmer-hud">
                <span>Cosecha: <span id="sf-score">0</span>/${this.targetCrops}</span>
            </div>
            <div class="sf-player" id="sfPlayer">🚜</div>
        `;
        
        this.playerEl = this.container.querySelector('#sfPlayer');
        this.scoreEl = this.container.querySelector('#sf-score');
        
        // Input
        this.boundKeyDown = (e) => this.keys[e.key] = true;
        this.boundKeyUp = (e) => this.keys[e.key] = false;
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);

        this.generateMap();
        this.updatePlayerPosition();
    }

    generateMap() {
        const numGood = this.targetCrops + 1; // Exactly what's needed + 1
        const numBad = 1 + this.level; // Reduced bad elements significantly
        const numRocks = 1 + this.level; // Reduced rocks

        for (let i = 0; i < numGood; i++) this.spawnElement('carrot', '🥕');
        for (let i = 0; i < numBad; i++) this.spawnElement('sprout', '🌱');
        for (let i = 0; i < numRocks; i++) this.spawnElement('rock', '🪨');
    }

    spawnElement(type, icon) {
        const el = document.createElement('div');
        el.className = `sf-item ${type}`;
        el.innerText = icon;
        
        // Random position, avoiding center where player is
        let x, y;
        do {
            x = 10 + Math.random() * 80;
            y = 10 + Math.random() * 80;
        } while (Math.abs(x - 50) < 20 && Math.abs(y - 50) < 20); // increased safe zone
        
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        
        this.container.appendChild(el);
        this.elements.push({ el, type, x, y, active: true });
    }

    update() {
        if (!this.isActive) return;
        
        // Movement
        if (this.keys['ArrowUp'] || this.keys['w']) this.playerY -= this.speed;
        if (this.keys['ArrowDown'] || this.keys['s']) this.playerY += this.speed;
        if (this.keys['ArrowLeft'] || this.keys['a']) this.playerX -= this.speed;
        if (this.keys['ArrowRight'] || this.keys['d']) this.playerX += this.speed;

        // Bounds
        this.playerX = Math.max(5, Math.min(95, this.playerX));
        this.playerY = Math.max(5, Math.min(95, this.playerY));
        this.updatePlayerPosition();

        // Collision
        const pRect = this.playerEl.getBoundingClientRect();
        
        for (let item of this.elements) {
            if (!item.active) continue;
            
            const iRect = item.el.getBoundingClientRect();
            if (this.rectIntersect(pRect, iRect)) {
                if (item.type === 'rock') {
                    // Block movement - simple bounce back
                    if (this.keys['ArrowUp'] || this.keys['w']) this.playerY += this.speed * 2;
                    if (this.keys['ArrowDown'] || this.keys['s']) this.playerY -= this.speed * 2;
                    if (this.keys['ArrowLeft'] || this.keys['a']) this.playerX += this.speed * 2;
                    if (this.keys['ArrowRight'] || this.keys['d']) this.playerX -= this.speed * 2;
                } else {
                    item.active = false;
                    item.el.style.display = 'none';
                    this.collectItem(item.type);
                }
            }
        }
    }

    collectItem(type) {
        if (type === 'carrot') {
            this.cropsCaught++;
            this.scoreEl.innerText = this.cropsCaught;
            if (this.cropsCaught >= this.targetCrops) {
                this.finish(true);
            }
        } else if (type === 'sprout') {
            // Penalización: lose game immediately
            this.finish(false);
        }
    }

    updatePlayerPosition() {
        if (this.playerEl) {
            this.playerEl.style.left = `${this.playerX}%`;
            this.playerEl.style.top = `${this.playerY}%`;
        }
    }

    rectIntersect(r1, r2) {
        // slightly smaller hitbox for better gameplay
        const shrink = 10;
        return !(r2.left > r1.right - shrink || 
                 r2.right < r1.left + shrink || 
                 r2.top > r1.bottom - shrink ||
                 r2.bottom < r1.top + shrink);
    }

    cleanup() {
        super.cleanup();
        window.removeEventListener('keydown', this.boundKeyDown);
        window.removeEventListener('keyup', this.boundKeyUp);
    }
}
