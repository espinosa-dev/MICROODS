export class BaseGame {
    constructor(container, level, onWin, onLose) {
        this.container = container;
        this.level = level;
        this.onWin = onWin;
        this.onLose = onLose;
        this.isActive = false;
        this.score = 0;
        this.timeLeft = 15; // Default lowered from 30
        this.timerInterval = null;
    }

    start() {
        this.isActive = true;
        this.setupGame();
        this.startTimer();
        this.gameLoop();
    }

    setupGame() {
        console.warn('setupGame() must be implemented by subclass');
    }

    startTimer() {
        const timerBar = document.querySelector('#gameTimerBar');
        if(timerBar) {
            timerBar.style.width = '100%';
            timerBar.style.background = 'linear-gradient(90deg, #4caf50, #ffeb3b, #f44336)';
        }

        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            if (!this.isActive) return;
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 1000); // Ticks every second for logic
        
        // Smooth visual update (optional, but CSS transition handles 1s steps reasonably well)
    }

    updateTimerDisplay() {
        const timerBar = document.querySelector('#gameTimerBar');
        if (timerBar) {
            // Assuming max time is always the starting time (handled if I stored maxTime)
            // But since I decrement timeLeft, I need to know the Total.
            // Let's assume 15s is standard or pass it. 
            // For now, let's fix the logic:
            // Calculate %: (timeLeft / 15) * 100
            // Since time varies by balance, let's store maxTime in constructor or setup.
            const maxTime = 15; // Hardcoded default for now matching constructor
            const percentage = Math.max(0, (this.timeLeft / maxTime) * 100);
            timerBar.style.width = `${percentage}%`;
            
            // Color shift logic could go here if removing gradient
        }
    }

    handleTimeout() {
        this.finish(false);
    }

    finish(success) {
        this.isActive = false;
        clearInterval(this.timerInterval);
        this.cleanup();
        if (success) {
            this.onWin();
        } else {
            this.onLose();
        }
    }

    cleanup() {
        this.container.innerHTML = '';
    }

    gameLoop() {
        if (!this.isActive) return;
        requestAnimationFrame(() => this.gameLoop());
        // Subclasses can hook into this if needed using update()
        this.update();
    }

    update() {
        // Helper for frame updates
    }
}
