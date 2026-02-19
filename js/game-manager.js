import { saveScore, getLeaderboard } from './firebase.js';

export class GameManager {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.playerName = "Jugador";
        this.gameContainer = document.querySelector('.ventana');
        this.currentMicrogame = null;
        this.isGameOver = false;

        // Game Rotation Logic
        this.gameSequence = ['eco-run', 'sea-hook', 'sustainable-garden', 'recycle-sort', 'save-energy'];
        this.currentGameIndex = 0;

        // Bind methods
        this.handleGameWin = this.handleGameWin.bind(this);
        this.handleGameLoss = this.handleGameLoss.bind(this);
    }

    init() {
        this.showStartScreen();
    }

    showStartScreen() {
        this.gameContainer.innerHTML = `
            <div class="game-overlay">
                <h1 class="overlay-title">MICRO ODS</h1>
                <p class="overlay-message">¡Completa los desafíos para salvar el planeta!</p>
                <input type="text" id="playerNameInput" placeholder="Tu Nombre" style="padding: 10px; font-size: 20px; margin-bottom: 20px; font-family: 'Pixels';">
                <button class="game-btn" id="startBtn">COMENZAR</button>
            </div>
        `;

        document.getElementById('startBtn').addEventListener('click', () => {
            const input = document.getElementById('playerNameInput');
            if (input.value.trim() !== "") {
                this.playerName = input.value.trim();
                this.resetGlobalState();
                this.startSequence();
            } else {
                alert("Por favor, introduce un nombre.");
            }
        });
    }

    resetGlobalState() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.isGameOver = false;
        this.currentGameIndex = 0;
        this.updateHUD();
    }

    createHUD() {
        const hudContainer = document.querySelector('.game-info-bar');
        if (!hudContainer) return;

        hudContainer.innerHTML = '';

        const hud = document.createElement('div');
        hud.className = 'game-hud';
        hud.innerHTML = `
            <div class="hud-item">
                <img src="../../img/heart.png" alt="Vidas" class="hud-icon-img">
                <span id="livesDisplay">${this.lives}</span>
            </div>
            <div class="hud-item">
                <span>NIVEL <span id="levelDisplay">${this.level}</span></span>
            </div>
            <div class="hud-item">
                <img src="../../img/puntos.gif" alt="Puntos" class="hud-icon-img">
                <span id="scoreDisplay">${this.score}</span>
            </div>
        `;
        hudContainer.appendChild(hud);
    }

    updateHUD() {
        const livesEl = document.getElementById('livesDisplay');
        const scoreEl = document.getElementById('scoreDisplay');
        const levelEl = document.getElementById('levelDisplay');

        if (livesEl) livesEl.textContent = this.lives;
        if (scoreEl) scoreEl.textContent = this.score;
        if (levelEl) levelEl.textContent = this.level;
    }

    startSequence() {
        this.gameContainer.innerHTML = '';
        this.createHUD();
        this.loadNextMicrogame();
    }

    async loadNextMicrogame() {
        if (this.lives <= 0) {
            this.triggerGameOver();
            return;
        }

        const gameId = this.gameSequence[this.currentGameIndex];


        let GameClass = null;

        try {
            switch (gameId) {
                case 'eco-run':
                    const { EcoRunGame } = await import('./microgames/eco-run.js');
                    GameClass = EcoRunGame;
                    break;
                case 'sea-hook':
                    const { SeaHookGame } = await import('./microgames/sea-hook.js');
                    GameClass = SeaHookGame;
                    break;
                case 'sustainable-garden':
                    const { SustainableGardenGame } = await import('./microgames/sustainable-garden.js');
                    GameClass = SustainableGardenGame;
                    break;
                case 'recycle-sort':
                    const { RecycleSortGame } = await import('./microgames/recycle-sort.js');
                    GameClass = RecycleSortGame;
                    break;
                case 'save-energy':
                    const { SaveEnergyGame } = await import('./microgames/save-energy.js');
                    GameClass = SaveEnergyGame;
                    break;
            }
        } catch (e) {
            console.error("Error loading game:", e);
            alert("Error cargando microjuego: " + gameId);
            return;
        }

        this.gameContainer.innerHTML = '';
        this.createHUD();

        const gameLayer = document.createElement('div');
        gameLayer.className = 'game-layer';
        gameLayer.style.width = '100%';
        gameLayer.style.height = '100%';
        this.gameContainer.appendChild(gameLayer);

        this.currentMicrogame = new GameClass(gameLayer, this.level, this.handleGameWin, this.handleGameLoss);
        this.currentMicrogame.start();
    }

    handleGameWin() {
        this.score++;

        this.currentGameIndex = Math.floor(Math.random() * this.gameSequence.length);

        if (this.score % 5 === 0) {
            this.level++;
        }

        this.updateHUD();

        const successMsg = document.createElement('div');
        successMsg.className = 'game-overlay';
        successMsg.style.background = 'rgba(0,100,0,0.8)';
        successMsg.innerHTML = '<h1 style="color:white">¡BIEN!</h1>';
        this.gameContainer.appendChild(successMsg);

        setTimeout(() => {
            this.loadNextMicrogame();
        }, 1000);
    }

    handleGameLoss() {
        this.lives--;
        this.updateHUD();

        const failMsg = document.createElement('div');
        failMsg.className = 'game-overlay';
        failMsg.style.background = 'rgba(100,0,0,0.8)';
        failMsg.innerHTML = '<h1 style="color:white">¡OOPS!</h1>';
        this.gameContainer.appendChild(failMsg);

        setTimeout(() => {
            this.loadNextMicrogame();
        }, 1000);
    }

    async triggerGameOver() {
        this.isGameOver = true;
        this.gameContainer.innerHTML = `
            <div class="game-overlay">
                <h1 class="overlay-title" style="color: var(--color-accent-danger)">GAME OVER</h1>
                <p class="overlay-message">Puntuación Final: ${this.score}</p>
                <div id="leaderboardLoading">Guardando puntuación...</div>
                <div id="btnDisplay" style="margin-top: 10px;">
                    <button class="game-btn" id="restartBtn" style="display:none; margin-top:20px;">JUGAR OTRA VEZ</button>
                    <button class="goBack-btn" id="homeBtn" style="display:none; margin-top:20px;">VOLVER AL INICIO</button>
                </div>
            </div>
        `;

        try {
            await saveScore(this.playerName, this.score, this.level);
            const loadingEl = document.getElementById('leaderboardLoading');
            if (loadingEl) loadingEl.textContent = "¡Puntuación Guardada!";

            const leaders = await getLeaderboard();
            let leaderHTML = '<ul style="text-align:left; font-size: 18px; list-style:none; padding:0; margin-top:20px;">';
            leaders.forEach((l, i) => {
                if (i < 3) {
                    leaderHTML += `<li style="margin-bottom:5px;">${i + 1}. ${l.name}: ${l.score}</li>`;
                }
            });
            leaderHTML += '</ul>';

            const lbDiv = document.createElement('div');
            lbDiv.innerHTML = leaderHTML;
            const overlay = document.querySelector('.game-overlay');
            if (overlay) overlay.appendChild(lbDiv);

        } catch (e) {
            console.error(e);
            const loadingEl = document.getElementById('leaderboardLoading');
            if (loadingEl) loadingEl.textContent = "Error al guardar (Firebase puede fallar en local).";
        }

        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.style.display = 'inline-block';
            restartBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }

        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            homeBtn.style.display = 'inline-block';
            homeBtn.addEventListener('click', () => {
                window.location.href = '../../index.html';
            });
        }

        const btnDisplay = document.getElementById('btnDisplay');
        if (btnDisplay) {
            btnDisplay.style.display = 'inline-block';
        }
    }
}
