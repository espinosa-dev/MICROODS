import { BaseGame } from './base-game.js';

export class FactoryRushGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.timeLeft = 25; // Increased time
        this.savedWorkers = 0;
        this.targetWorkers = 3 + (this.level > 1 ? 1 : 0);
        this.leverDirection = 'left'; // 'left' or 'right'
        this.workers = [];
        this.spawnInterval = null;
        this.swapInterval = null;
        this.factories = { left: 'good', right: 'bad' }; // will randomize occasionally
    }

    setupGame() {
        this.container.classList.add('factory-rush-game');
        this.container.innerHTML = `
            <div class="factory-hud">
                <span>Salvos: <span id="fr-score">0</span>/${this.targetWorkers}</span>
            </div>
            <div class="fr-belt fr-belt-main"></div>
            <div class="fr-belt fr-belt-left"></div>
            <div class="fr-belt fr-belt-right"></div>
            
            <div class="fr-lever" id="frLever">🔀 IZQ</div>
            
            <div class="fr-factory left" id="facLeft">🏢</div>
            <div class="fr-factory right" id="facRight">🏭</div>
        `;
        
        this.leverEl = this.container.querySelector('#frLever');
        this.scoreEl = this.container.querySelector('#fr-score');
        this.facLeft = this.container.querySelector('#facLeft');
        this.facRight = this.container.querySelector('#facRight');
        
        this.leverEl.addEventListener('click', this.toggleLever.bind(this));
        
        this.randomizeFactories();
        
        // Spawn first worker
        this.spawnWorker();
        // Slower spawn rate
        this.spawnInterval = setInterval(() => this.spawnWorker(), 3000 - (this.level * 200));
        
        // Slower factory randomize
        this.swapInterval = setInterval(() => this.randomizeFactories(), 6000);
    }

    toggleLever() {
        if (!this.isActive) return;
        this.leverDirection = this.leverDirection === 'left' ? 'right' : 'left';
        this.leverEl.innerText = this.leverDirection === 'left' ? '🔀 IZQ' : '🔀 DER';
        this.leverEl.style.transform = this.leverDirection === 'left' ? 'rotate(-20deg)' : 'rotate(20deg)';
    }

    randomizeFactories() {
        if (!this.isActive) return;
        if (Math.random() > 0.5) {
            this.factories.left = 'good';
            this.factories.right = 'bad';
        } else {
            this.factories.left = 'bad';
            this.factories.right = 'good';
        }
        
        // Better visual feedback for factories
        this.facLeft.innerText = this.factories.left === 'good' ? '✔ Sostenible' : '❌ Contaminante';
        this.facLeft.style.background = this.factories.left === 'good' ? '#2e7d32' : '#c62828';
        this.facLeft.style.boxShadow = this.factories.left === 'good' ? '0 0 15px #4caf50' : 'none';
        
        this.facRight.innerText = this.factories.right === 'good' ? '✔ Sostenible' : '❌ Contaminante';
        this.facRight.style.background = this.factories.right === 'good' ? '#2e7d32' : '#c62828';
        this.facRight.style.boxShadow = this.factories.right === 'good' ? '0 0 15px #4caf50' : 'none';
    }

    spawnWorker() {
        if (!this.isActive) return;
        const worker = document.createElement('div');
        worker.className = 'fr-worker';
        worker.innerText = '👷';
        worker.style.top = '0%';
        worker.style.left = '45%';
        
        this.container.appendChild(worker);
        this.workers.push({
            el: worker,
            x: 45,
            y: 0,
            phase: 'down', // 'down' -> 'branch'
            targetDir: null
        });
    }

    update() {
        if (!this.isActive) return;
        
        // Reduced general speed
        const speed = 0.3 + (this.level * 0.05);
        
        for (let i = this.workers.length - 1; i >= 0; i--) {
            let w = this.workers[i];
            
            if (w.phase === 'down') {
                w.y += speed;
                w.el.style.top = `${w.y}%`;
                
                if (w.y >= 50) {
                    w.phase = 'branch';
                    w.targetDir = this.leverDirection;
                }
            } else if (w.phase === 'branch') {
                w.y += speed * 0.8;
                if (w.targetDir === 'left') {
                    w.x -= speed;
                } else {
                    w.x += speed;
                }
                
                w.el.style.top = `${w.y}%`;
                w.el.style.left = `${w.x}%`;
                
                // Check if reached factory (y > 85)
                if (w.y >= 85) {
                    const factoryType = this.factories[w.targetDir];
                    w.el.remove();
                    this.workers.splice(i, 1);
                    
                    if (factoryType === 'good') {
                        this.savedWorkers++;
                        this.scoreEl.innerText = this.savedWorkers;
                        if (this.savedWorkers >= this.targetWorkers) {
                            this.finish(true);
                            return;
                        }
                    } else {
                        // Bad factory -> lose
                        this.finish(false);
                        return;
                    }
                }
            }
        }
    }

    cleanup() {
        super.cleanup();
        clearInterval(this.spawnInterval);
        clearInterval(this.swapInterval);
        this.workers.forEach(w => w.el.remove());
        this.workers = [];
    }
}
