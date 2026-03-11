import { BaseGame } from './base-game.js';

export class TrafficControlGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.timeLeft = 8; // Survive for 8 seconds
        this.horizontalGreen = true;
        this.cars = [];
        this.spawnInterval = null;
        this.carIdCounter = 0;
    }

    setupGame() {
        this.container.classList.add('traffic-control-game');
        this.container.innerHTML = `
            <div class="tc-hud">
                <span>Tiempo: <span id="tc-timer">${this.timeLeft}</span>s</span>
            </div>
            
            <div class="tc-road tc-road-h"></div>
            <div class="tc-road tc-road-v"></div>
            
            <div class="tc-intersection" id="tcIntersection">
                <div class="tc-semaphore tc-sem-h left"></div>
                <div class="tc-semaphore tc-sem-h right"></div>
                <div class="tc-semaphore tc-sem-v top"></div>
                <div class="tc-semaphore tc-sem-v bottom"></div>
                <div class="tc-center-click"></div>
            </div>
            
            <div id="tc-cars-container"></div>
        `;
        
        this.timerEl = this.container.querySelector('#tc-timer');
        this.carsContainer = this.container.querySelector('#tc-cars-container');
        
        // Traffic lights click logic
        this.intersectionEl = this.container.querySelector('#tcIntersection');
        this.intersectionEl.addEventListener('click', this.toggleSemaphore.bind(this));
        
        this.updateSemaphores();
        
        // Spawn first car
        this.spawnCar();
        // Spawning rate logic
        this.spawnInterval = setInterval(() => this.spawnCar(), 1200 - (this.level * 150));
    }

    toggleSemaphore() {
        if (!this.isActive) return;
        this.horizontalGreen = !this.horizontalGreen;
        this.updateSemaphores();
    }

    updateSemaphores() {
        const semsH = this.container.querySelectorAll('.tc-sem-h');
        const semsV = this.container.querySelectorAll('.tc-sem-v');
        
        semsH.forEach(s => {
            s.style.backgroundColor = this.horizontalGreen ? '#00e676' : '#ff1744';
            s.style.boxShadow = this.horizontalGreen ? '0 0 10px #00e676' : '0 0 10px #ff1744';
        });
        
        semsV.forEach(s => {
            s.style.backgroundColor = !this.horizontalGreen ? '#00e676' : '#ff1744';
            s.style.boxShadow = !this.horizontalGreen ? '0 0 10px #00e676' : '0 0 10px #ff1744';
        });
    }

    spawnCar() {
        if (!this.isActive) return;
        
        const dirs = ['right', 'left', 'down', 'up'];
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        
        let x, y;
        const speed = 0.5 + (this.level * 0.1);
        
        if (dir === 'right') { x = -10; y = 46; } // Left to right
        else if (dir === 'left') { x = 110; y = 54; } // Right to left
        else if (dir === 'down') { x = 46; y = -10; } // Top to bottom
        else if (dir === 'up') { x = 54; y = 110; } // Bottom to top
        
        const carEl = document.createElement('div');
        carEl.className = `tc-car ${dir}`;
        carEl.innerText = '🚗';
        
        this.carsContainer.appendChild(carEl);
        
        this.cars.push({
            id: this.carIdCounter++,
            el: carEl,
            dir: dir,
            x: x,
            y: y,
            speed: speed,
            width: 8,
            height: 8,
            stopped: false
        });
    }

    update() {
        if (!this.isActive) return;
        
        let stoppedCounts = { right: 0, left: 0, down: 0, up: 0 };

        // Move cars and check logic
        for (let i = 0; i < this.cars.length; i++) {
            let car = this.cars[i];
            
            // Check if car should stop due to traffic light
            let atLight = false;
            let stopLineDist = 2;
            
            if (car.dir === 'right' && car.x > 30 && car.x < 35 && !this.horizontalGreen) atLight = true;
            if (car.dir === 'left' && car.x < 70 && car.x > 65 && !this.horizontalGreen) atLight = true;
            if (car.dir === 'down' && car.y > 30 && car.y < 35 && this.horizontalGreen) atLight = true;
            if (car.dir === 'up' && car.y < 70 && car.y > 65 && this.horizontalGreen) atLight = true;
            
            // Check if car should stop due to car ahead
            let carAhead = false;
            for (let j = 0; j < this.cars.length; j++) {
                if (i === j) continue;
                let other = this.cars[j];
                if (car.dir === other.dir) {
                    if (car.dir === 'right' && other.x > car.x && other.x - car.x < 12) carAhead = true;
                    if (car.dir === 'left' && other.x < car.x && car.x - other.x < 12) carAhead = true;
                    if (car.dir === 'down' && other.y > car.y && other.y - car.y < 12) carAhead = true;
                    if (car.dir === 'up' && other.y < car.y && car.y - other.y < 12) carAhead = true;
                }
            }
            
            car.stopped = atLight || carAhead;
            
            if (car.stopped) {
                stoppedCounts[car.dir]++;
            } else {
                if (car.dir === 'right') car.x += car.speed;
                if (car.dir === 'left') car.x -= car.speed;
                if (car.dir === 'down') car.y += car.speed;
                if (car.dir === 'up') car.y -= car.speed;
            }
            
            car.el.style.left = `${car.x}%`;
            car.el.style.top = `${car.y}%`;
        }
        
        // Remove cars out of bounds
        for (let i = this.cars.length - 1; i >= 0; i--) {
            let car = this.cars[i];
            if (car.x < -20 || car.x > 120 || car.y < -20 || car.y > 120) {
                car.el.remove();
                this.cars.splice(i, 1);
            }
        }
        
        // Collision Detection
        for (let i = 0; i < this.cars.length; i++) {
            for (let j = i + 1; j < this.cars.length; j++) {
                if (this.checkCollision(this.cars[i], this.cars[j])) {
                    this.triggerCrash(this.cars[i], this.cars[j]);
                    return;
                }
            }
        }
        
        // Traffic Jam Detection (queue of 3 or more cars)
        if (Object.values(stoppedCounts).some(count => count >= 3)) {
            this.triggerTrafficJam();
            return;
        }
        // Win condition: handled by handleTimeout overriden below
        this.timerEl.innerText = this.timeLeft;
    }

    handleTimeout() {
        if (this.isActive) {
            this.finish(true); // Surviving the time limit is a WIN
        }
    }

    checkCollision(c1, c2) {
        // Simple AABB using center coordinates
        const hitDist = 6;
        return (Math.abs(c1.x - c2.x) < hitDist && Math.abs(c1.y - c2.y) < hitDist);
    }
    
    triggerCrash(c1, c2) {
        if (!this.isActive) return;
        
        // Visual explosion
        c1.el.innerText = '💥';
        c1.el.style.transform = 'scale(1.5)';
        c2.el.innerText = '💥';
        c2.el.style.transform = 'scale(1.5)';
        
        this.container.classList.add('shake');
        
        setTimeout(() => this.finish(false), 800);
    }

    triggerTrafficJam() {
        if (!this.isActive) return;
        
        this.cars.forEach(c => {
            if (c.stopped) {
                c.el.innerText = '🚕💢';
            }
        });
        
        this.container.classList.add('shake');
        setTimeout(() => this.finish(false), 800);
    }

    cleanup() {
        super.cleanup();
        clearInterval(this.spawnInterval);
        this.cars.forEach(c => c.el.remove());
        this.cars = [];
    }
}
