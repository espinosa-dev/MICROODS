import { BaseGame } from './base-game.js';

export class SustainableGardenGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.targetScore = level >= 3 ? 10 : 5;
        this.plants = [];
        this.tools = ['water', 'sun', 'fertilizer'];
        this.selectedTool = 'water';
        this.deadPlants = 0;
        this.maxDeadPlants = 3;

        this.gridSize = level >= 3 ? 9 : 6;
        this.needRate = Math.max(1000, 3000 - (level * 200));
    }

    setupGame() {
        this.container.innerHTML = '';
        this.container.className = 'garden-game';


        const toolsContainer = document.createElement('div');
        toolsContainer.className = 'garden-tools';

        this.tools.forEach(tool => {
            const btn = document.createElement('button');
            btn.className = `tool-btn ${tool} ${this.selectedTool === tool ? 'selected' : ''}`;
            btn.innerHTML = this.getToolIcon(tool);
            btn.onclick = () => this.selectTool(tool, btn);
            toolsContainer.appendChild(btn);
        });

        this.container.appendChild(toolsContainer);


        const grid = document.createElement('div');
        grid.className = 'garden-grid';

        for (let i = 0; i < this.gridSize; i++) {
            const plant = document.createElement('div');
            plant.className = 'garden-plant healthy';
            plant.onclick = () => this.interactPlant(i);

            const status = document.createElement('div');
            status.className = 'plant-status';
            plant.appendChild(status);

            grid.appendChild(plant);

            this.plants.push({
                id: i,
                element: plant,
                statusEl: status,
                state: 'healthy',
                timer: null
            });
        }
        this.container.appendChild(grid);


        const stats = document.createElement('div');
        stats.className = 'game-ui-top-left';
        stats.innerHTML = `Plantas salvadas: <span id="gardenScore">0</span>/${this.targetScore} <br> Marchitas: <span id="deadScore" style="color:darkred">0</span>/${this.maxDeadPlants}`;
        this.container.appendChild(stats);

        this.startLifeCycle();
    }

    getToolIcon(tool) {
        if (tool === 'water') return '<img src="../../img/icons/water.png" alt="water" class="icon">';
        if (tool === 'sun') return '<img src="../../img/icons/sun.png" alt="sun" class="icon">';
        if (tool === 'fertilizer') return '<img src="../../img/icons/fertilizer.png" alt="fertilizer" class="icon">';
        return '';
    }

    selectTool(tool, btnElement) {
        this.selectedTool = tool;
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('selected'));
        btnElement.classList.add('selected');
    }

    startLifeCycle() {
        this.lifeInterval = setInterval(() => {
            if (!this.isActive) return;

            const healthyPlants = this.plants.filter(p => p.state === 'healthy');
            if (healthyPlants.length > 0) {
                const randomPlant = healthyPlants[Math.floor(Math.random() * healthyPlants.length)];
                this.triggerNeed(randomPlant);
            }
        }, this.needRate);
    }

    triggerNeed(plant) {
        const needs = ['water', 'sun', 'fertilizer'];
        const need = needs[Math.floor(Math.random() * needs.length)];

        plant.state = need;
        plant.element.className = `garden-plant ${need}`;
        plant.statusEl.innerHTML = this.getToolIcon(need);

        plant.timer = setTimeout(() => {
            if (plant.state === need && this.isActive) {
                this.killPlant(plant);
            }
        }, 3000);
    }

    interactPlant(index) {
        const plant = this.plants[index];

        if (plant.state === 'dead' || plant.state === 'healthy') return;

        if (plant.state === this.selectedTool) {
            this.healPlant(plant);
        } else {
            plant.element.classList.add('shake');
            setTimeout(() => plant.element.classList.remove('shake'), 300);
        }
    }

    healPlant(plant) {
        clearTimeout(plant.timer);
        plant.state = 'healthy';
        plant.element.className = 'garden-plant healthy';
        plant.statusEl.innerText = '😊';

        setTimeout(() => {
            if (plant.state === 'healthy') plant.statusEl.innerText = '';
        }, 1000);

        this.score++;
        document.getElementById('gardenScore').innerText = this.score;

        if (this.score >= this.targetScore) {
            this.finish(true);
        }
    }

    killPlant(plant) {
        plant.state = 'dead';
        plant.element.className = 'garden-plant dead';
        plant.statusEl.innerText = '💀';

        this.deadPlants++;
        document.getElementById('deadScore').innerText = this.deadPlants;

        if (this.deadPlants >= this.maxDeadPlants) {
            this.finish(false);
        }
    }

    cleanup() {
        super.cleanup();
        clearInterval(this.lifeInterval);
        this.plants.forEach(p => clearTimeout(p.timer));
    }
}
