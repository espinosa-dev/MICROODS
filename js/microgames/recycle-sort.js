import { BaseGame } from './base-game.js';

export class RecycleSortGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.targetScore = 5;
        this.items = []; // {element, type, x, y}
        this.bins = ['blue', 'green', 'yellow'];
        this.binMapping = {
            'paper': 'blue',
            'glass': 'green',
            'plastic': 'yellow'
        };
        this.errors = 0;
        this.maxErrors = 3;
        
        // Difficulty
        this.spawnRate = Math.max(1000, 2500 - (level * 200)); 
        this.fallSpeed = 1 + (level * 0.5);
    }

    setupGame() {
        this.container.innerHTML = '';
        this.container.className = 'recycle-game';

        // Bins
        const binsContainer = document.createElement('div');
        binsContainer.className = 'recycle-bins';
        
        this.bins.forEach(bin => {
            const el = document.createElement('div');
            el.className = `recycle-bin ${bin}`;
            el.dataset.type = bin;
            el.innerText = bin === 'blue' ? 'Papel' : bin === 'green' ? 'Vidrio' : 'Plástico';
            
            // Drop zone logic
            el.addEventListener('dragover', (e) => e.preventDefault());
            el.addEventListener('drop', (e) => this.handleDrop(e, bin));
            
            binsContainer.appendChild(el);
        });
        
        this.container.appendChild(binsContainer);

        // Waste Container
        this.wasteZone = document.createElement('div');
        this.wasteZone.className = 'recycle-waste-zone';
        this.container.appendChild(this.wasteZone);

        // Score UI
        const ui = document.createElement('div');
        ui.className = 'game-ui-top-left';
        ui.innerHTML = `Clasificados: <span id="recycleScore">0</span>/${this.targetScore} <br> Errores: <span id="errorScore" style="color:red">0</span>/${this.maxErrors}`;
        this.container.appendChild(ui);

        this.startSpawning();
    }

    startSpawning() {
        this.spawnInterval = setInterval(() => {
            if(!this.isActive) return;
            this.spawnWaste();
        }, this.spawnRate);
    }

    spawnWaste() {
        const types = ['paper', 'glass', 'plastic'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const waste = document.createElement('div');
        waste.className = `waste-item ${type}`;
        waste.draggable = true;
        waste.innerText = this.getWasteIcon(type);
        
        // Random X position with padding (10% to 90%)
        const maxW = this.container.clientWidth;
        const padding = 60; // pixel padding
        const x = padding + Math.random() * (maxW - (padding * 2));
        waste.style.left = `${x}px`;
        waste.style.top = '0px';
        
        // Drag events
        waste.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', type);
            e.dataTransfer.effectAllowed = 'move';
            waste.classList.add('dragging');
        });
        
        waste.addEventListener('dragend', () => {
            waste.classList.remove('dragging');
        });

        this.wasteZone.appendChild(waste);
        
        // Failing logic: if it reaches bottom? Or just piles up?
        // Let's make them fall slowly
        this.animateFall(waste);
    }

    animateFall(element) {
        let top = 0;
        const interval = setInterval(() => {
            if(!this.isActive || !element.parentNode) {
                clearInterval(interval);
                return;
            }
            
            top += this.fallSpeed;
            element.style.top = `${top}px`;
            
            // If hits bottom/bins area without being sorted
            if(top > (this.container.clientHeight - 150)) { // Assuming bins are ~100px high
                clearInterval(interval);
                this.handleMiss(element);
            }
        }, 50);
    }

    handleMiss(element) {
        if(element.parentNode) {
            element.remove();
            this.handleError();
        }
    }

    handleDrop(e, binType) {
        e.preventDefault();
        const wasteType = e.dataTransfer.getData('text/plain');
        const correctBin = this.binMapping[wasteType];
        
        if(correctBin === binType) {
            this.handleSuccess();
        } else {
            this.handleError();
        }
        
        // Remove the dragged element (need reference logic or just finding dragging one)
        const dragging = document.querySelector('.waste-item.dragging');
        if(dragging) dragging.remove();
    }

    handleSuccess() {
        this.score++;
        document.getElementById('recycleScore').innerText = this.score;
        if(this.score >= this.targetScore) {
            this.finish(true);
        }
    }

    handleError() {
        this.errors++;
        document.getElementById('errorScore').innerText = this.errors;
        // Animation feedback on HUD?
        if(this.errors >= this.maxErrors) {
            this.finish(false);
        }
    }

    getWasteIcon(type) {
        if(type === 'paper') return '📰';
        if(type === 'glass') return '🍾';
        if(type === 'plastic') return '🥤';
        return '❓';
    }

    cleanup() {
        super.cleanup();
        clearInterval(this.spawnInterval);
    }
}
