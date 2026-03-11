import { BaseGame } from './base-game.js';

export class SupplyDropGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.timeLeft = 20; // Increased from 15 to give more time
        this.boxesCaught = 0;
        this.targetBoxes = 3 + (this.level - 1);
        this.paddleX = 50; // percentage
        this.targetPaddleX = 50; 
        this.boxes = [];
        this.boxInterval = null;
    }

    setupGame() {
        this.container.classList.add('supply-drop-game');
        this.container.innerHTML = `
            <div class="supply-hud">
                <span>Cajas: <span id="sd-score">0</span>/${this.targetBoxes}</span>
            </div>
            <div class="sd-paddle" id="sdPaddle">🧍🏠</div>
        `;
        
        this.paddleEl = this.container.querySelector('#sdPaddle');
        this.scoreEl = this.container.querySelector('#sd-score');
        
        // Mouse/Touch controls - Now sets target X for smooth interpolation
        this.container.addEventListener('mousemove', this.handleMove.bind(this));
        this.container.addEventListener('touchmove', this.handleTouch.bind(this));
        
        // Keyboard controls
        this.boundKeyDown = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.boundKeyDown);

        this.spawnBox();
        // Slower spawn rate
        this.boxInterval = setInterval(() => this.spawnBox(), 2500 - (this.level * 100));
    }

    handleMove(e) {
        if (!this.isActive) return;
        const rect = this.container.getBoundingClientRect();
        let x = e.clientX - rect.left;
        this.targetPaddleX = (x / rect.width) * 100;
    }

    handleTouch(e) {
        if (!this.isActive) return;
        const rect = this.container.getBoundingClientRect();
        let x = e.touches[0].clientX - rect.left;
        this.targetPaddleX = (x / rect.width) * 100;
    }

    handleKeyDown(e) {
        if (!this.isActive) return;
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.targetPaddleX = Math.max(5, this.targetPaddleX - 15);
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            this.targetPaddleX = Math.min(95, this.targetPaddleX + 15);
        }
    }

    updatePaddlePosition() {
        // limit bounds
        this.targetPaddleX = Math.max(5, Math.min(95, this.targetPaddleX));
        // Smooth interpolation (Lerp) for paddle
        this.paddleX += (this.targetPaddleX - this.paddleX) * 0.2; 
        
        if (this.paddleEl) {
            this.paddleEl.style.left = `${this.paddleX}%`;
        }
    }

    spawnBox() {
        if (!this.isActive) return;
        const box = document.createElement('div');
        box.className = 'sd-box';
        // Random horizontal position
        const startX = 10 + Math.random() * 80;
        box.style.left = `${startX}%`;
        box.style.top = '-10%';
        box.innerHTML = '🪂<br>📦';
        
        this.container.appendChild(box);
        this.boxes.push({
            el: box,
            x: startX,
            y: -10,
            speed: 0.3 + (this.level * 0.05) // Reduced fall speed
        });
    }

    update() {
        if (!this.isActive) return;
        
        this.updatePaddlePosition(); // Smooth movement update every frame

        const paddleRect = this.paddleEl.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        for (let i = this.boxes.length - 1; i >= 0; i--) {
            let boxObj = this.boxes[i];
            boxObj.y += boxObj.speed * 2;
            boxObj.el.style.top = `${boxObj.y}%`;
            
            // Check collision Wait, CSS top is in %, we need rects to be precise
            const boxRect = boxObj.el.getBoundingClientRect();
            
            // If hits bottom
            if (boxObj.y > 100) {
                // box fell outside -> missed
                boxObj.el.remove();
                this.boxes.splice(i, 1);
                // penalización o perder? El prompt dice "Si caen fuera -> se pierde"
                this.finish(false);
                return;
            }
            
            // Check collision with paddle
            // Check intersect
            if (this.rectIntersect(boxRect, paddleRect)) {
                boxObj.el.remove();
                this.boxes.splice(i, 1);
                this.boxesCaught++;
                this.scoreEl.innerText = this.boxesCaught;
                
                if (this.boxesCaught >= this.targetBoxes) {
                    this.finish(true);
                    return;
                }
            }
        }
    }
    
    rectIntersect(r1, r2) {
        return !(r2.left > r1.right || 
                 r2.right < r1.left || 
                 r2.top > r1.bottom ||
                 r2.bottom < r1.top);
    }

    cleanup() {
        super.cleanup();
        clearInterval(this.boxInterval);
        window.removeEventListener('keydown', this.boundKeyDown);
        this.boxes.forEach(b => b.el.remove());
        this.boxes = [];
    }
}
