import { BaseGame } from './base-game.js';

export class AulaEquipadaGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.targetScore = this.getStudentCount();
        this.currentScore = 0;
        this.students = [];
        this.materials = [];
        this.distractors = [];

        // Difficulty parameters
        this.studentCount = this.getStudentCount();
        this.materialTypes = ['libro', 'lapiz', 'tablet'];
        this.hasDistractors = level >= 3;
        this.movesObjects = level >= 2;
    }

    getStudentCount() {
        if (this.level === 1) return 2;
        if (this.level === 2) return 4;
        return Math.min(6, 4 + (this.level - 2));
    }

    setupGame() {
        this.container.innerHTML = '';
        this.container.className = 'aula-game';

        // Add custom styles for this game
        const style = document.createElement('style');
        style.textContent = `
            .aula-game {
                position: relative;
                width: 100%;
                height: 100%;
                background: #f0f4f8;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 20px;
                box-sizing: border-box;
                overflow: hidden;
            }
            .students-container {
                display: flex;
                justify-content: space-around;
                align-items: flex-end;
                flex-grow: 1;
                margin-bottom: 50px;
            }
            .student {
                position: relative;
                width: 80px;
                height: 120px;
                background: #ffccbc;
                border-radius: 10px 10px 0 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                padding-bottom: 10px;
                transition: transform 0.2s;
            }
            .student.satisfied {
                background: #c8e6c9;
            }
            .thought-bubble {
                position: absolute;
                top: -60px;
                width: 50px;
                height: 50px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                font-size: 24px;
            }
            .thought-bubble::after {
                content: '';
                position: absolute;
                bottom: -10px;
                left: 20px;
                border-width: 10px 10px 0 0;
                border-style: solid;
                border-color: white transparent transparent transparent;
            }
            .materials-container {
                display: flex;
                justify-content: center;
                gap: 20px;
                height: 80px;
                background: #fff;
                border-radius: 15px;
                padding: 10px;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            }
            .material {
                width: 60px;
                height: 60px;
                background: #e3f2fd;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
                cursor: grab;
                user-select: none;
                transition: transform 0.1s;
                position: relative;
            }
            .material:active {
                cursor: grabbing;
            }
            .material.dragging {
                opacity: 0.5;
            }
        `;
        this.container.appendChild(style);

        // UI for Score
        const ui = document.createElement('div');
        ui.className = 'game-ui-top-left';
        ui.innerHTML = `Estudiantes: <span id="satisfiedCount">0</span>/${this.studentCount}`;
        this.container.appendChild(ui);

        // Students Area
        const studentsContainer = document.createElement('div');
        studentsContainer.className = 'students-container';
        this.container.appendChild(studentsContainer);

        for (let i = 0; i < this.studentCount; i++) {
            const need = this.materialTypes[Math.floor(Math.random() * this.materialTypes.length)];
            const student = document.createElement('div');
            student.className = 'student';
            student.dataset.need = need;
            student.innerHTML = `
                <div class="thought-bubble">${this.getIcon(need)}</div>
                <div class="student-body">👤</div>
            `;

            // Drop zone logic
            student.addEventListener('dragover', (e) => e.preventDefault());
            student.addEventListener('drop', (e) => this.handleDrop(e, student));

            studentsContainer.appendChild(student);
            this.students.push(student);
        }

        // Materials Area
        const materialsContainer = document.createElement('div');
        materialsContainer.className = 'materials-container';
        this.container.appendChild(materialsContainer);

        const activeMaterials = [...this.materialTypes];
        if (this.hasDistractors) {
            activeMaterials.push('juguete');
        }

        activeMaterials.sort(() => Math.random() - 0.5).forEach(type => {
            const material = document.createElement('div');
            material.className = `material ${type}`;
            material.draggable = true;
            material.dataset.type = type;
            material.innerText = this.getIcon(type);

            material.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', type);
                material.classList.add('dragging');
            });

            material.addEventListener('dragend', () => {
                material.classList.remove('dragging');
            });

            materialsContainer.appendChild(material);
            this.materials.push(material);
        });

        if (this.movesObjects) {
            this.startMovingMaterials();
        }
    }

    startMovingMaterials() {
        this.moveInterval = setInterval(() => {
            if (!this.isActive) return;
            const container = this.container.querySelector('.materials-container');
            const items = Array.from(container.children);
            items.sort(() => Math.random() - 0.5).forEach(item => container.appendChild(item));
        }, 3000);
    }

    getIcon(type) {
        switch (type) {
            case 'libro': return '📚';
            case 'lapiz': return '✏️';
            case 'tablet': return '📱';
            case 'juguete': return '🧸';
            default: return '❓';
        }
    }

    handleDrop(e, student) {
        e.preventDefault();
        if (student.classList.contains('satisfied')) return;

        const materialType = e.dataTransfer.getData('text/plain');
        const neededType = student.dataset.need;

        if (materialType === neededType) {
            student.classList.add('satisfied');
            student.querySelector('.thought-bubble').innerText = '✅';
            this.currentScore++;
            document.getElementById('satisfiedCount').innerText = this.currentScore;

            if (this.currentScore >= this.studentCount) {
                this.finish(true);
            }
        } else {
            // Shake effect on error
            student.style.transform = 'translateX(10px)';
            setTimeout(() => student.style.transform = 'translateX(-10px)', 50);
            setTimeout(() => student.style.transform = 'translateX(0)', 100);
        }
    }

    cleanup() {
        super.cleanup();
        if (this.moveInterval) clearInterval(this.moveInterval);
    }
}