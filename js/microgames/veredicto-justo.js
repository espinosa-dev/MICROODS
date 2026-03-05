import { BaseGame } from './base-game.js';

export class VeredictoJustoGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.timeLeft = 8; // Tiempo límite de 8 segundos según requerimientos
        this.icons = [];
        this.justiciaEliminados = 0;

        // Configuración de dificultad basada en el nivel
        if (this.level === 1) { // Fácil
            this.justiciaCount = 3;
            this.corrupcionCount = 0;
            this.speedMultiplier = 1;
            this.iconSize = 64;
        } else if (this.level === 2) { // Normal
            this.justiciaCount = 5;
            this.corrupcionCount = 2;
            this.speedMultiplier = 1.2;
            this.iconSize = 64;
        } else { // Difícil (nivel 3 o superior)
            this.justiciaCount = 7;
            this.corrupcionCount = 4;
            this.speedMultiplier = 1.5;
            this.iconSize = 48; // Iconos más pequeños
        }
    }

    setupGame() {
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.backgroundColor = '#e8f4f8'; // Fondo temático pacífico/justicia
        this.container.style.width = '100%';
        this.container.style.height = '100%';

        // Obtener dimensiones del contenedor
        this.width = this.container.clientWidth || 800;
        this.height = this.container.clientHeight || 600;

        if (this.width === 0) this.width = window.innerWidth * 0.8;
        if (this.height === 0) this.height = window.innerHeight * 0.6;

        const totalIcons = this.justiciaCount + this.corrupcionCount;

        for (let i = 0; i < totalIcons; i++) {
            const isJusticia = i < this.justiciaCount;
            this.spawnIcon(isJusticia);
        }
    }

    spawnIcon(isJusticia) {
        const img = document.createElement('div');
        const type = isJusticia ? 'justicia' : 'corrupcion';

        // Fallback robusto a emojis para que siempre carguen bien y rápido
        img.innerText = isJusticia ? '⚖️' : '💰';

        img.style.position = 'absolute';
        img.style.width = `${this.iconSize}px`;
        img.style.height = `${this.iconSize}px`;
        img.style.fontSize = `${this.iconSize * 0.8}px`; // Escalar el emoji
        img.style.display = 'flex';
        img.style.alignItems = 'center';
        img.style.justifyContent = 'center';
        img.style.cursor = 'pointer';
        img.style.userSelect = 'none';

        // Posición inicial aleatoria
        let x = Math.random() * (this.width - this.iconSize);
        let y = Math.random() * (this.height - this.iconSize);

        img.style.left = `${x}px`;
        img.style.top = `${y}px`;

        // Velocidad aleatoria
        let vx = (Math.random() * 2 + 1.5) * this.speedMultiplier * (Math.random() > 0.5 ? 1 : -1);
        let vy = (Math.random() * 2 + 1.5) * this.speedMultiplier * (Math.random() > 0.5 ? 1 : -1);

        const iconObj = { el: img, type, x, y, vx, vy, isJusticia, active: true };
        this.icons.push(iconObj);

        // Evento de interacción (clic/tap)
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar clics múltiples accidentales
            if (!this.isActive || !iconObj.active) return;

            if (isJusticia) {
                iconObj.active = false;
                img.style.display = 'none';
                this.justiciaEliminados++;
                this.checkWinCondition();
            } else {
                // Tocar corrupción resulta en pérdida inmediata
                this.finish(false);
            }
        });

        // Prevenir el drag por defecto para facilitar el clic
        img.addEventListener('dragstart', (e) => e.preventDefault());

        this.container.appendChild(img);
    }

    update() {
        if (!this.isActive) return;

        // Actualizar posiciones (físicas de rebote simple)
        this.icons.forEach(icon => {
            if (!icon.active) return;

            icon.x += icon.vx;
            icon.y += icon.vy;

            // Rebotar en los bordes
            if (icon.x <= 0) {
                icon.x = 0;
                icon.vx *= -1;
            } else if (icon.x + this.iconSize >= this.width) {
                icon.x = this.width - this.iconSize;
                icon.vx *= -1;
            }

            if (icon.y <= 0) {
                icon.y = 0;
                icon.vy *= -1;
            } else if (icon.y + this.iconSize >= this.height) {
                icon.y = this.height - this.iconSize;
                icon.vy *= -1;
            }
        });

        this.draw();
    }

    draw() {
        if (!this.isActive) return;

        // Aplicar posiciones calculadas al DOM
        this.icons.forEach(icon => {
            if (!icon.active) return;
            icon.el.style.left = `${icon.x}px`;
            icon.el.style.top = `${icon.y}px`;
        });
    }

    checkWinCondition() {
        if (this.justiciaEliminados >= this.justiciaCount) {
            this.finish(true);
        }
    }
}