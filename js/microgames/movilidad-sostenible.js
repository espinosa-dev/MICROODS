import { BaseGame } from './base-game.js';

export class MovilidadSostenibleGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.timeLeft = 8; // Requirement: 8 seconds
        this.vehicles = [];
        this.obstacles = [];
        this.smogClouds = [];
        this.sustainableInLane = 0;

        // Difficulty configuration based on level
        if (this.level === 1) { // Easy
            this.sustainableCount = 3;
            this.pollutingCount = 0;
            this.laneWidth = 200; // Wide lane
            this.potholeCount = 0;
            this.smogCount = 0;
        } else if (this.level === 2) { // Normal
            this.sustainableCount = 5;
            this.pollutingCount = 2;
            this.laneWidth = 150; // Standard lane
            this.potholeCount = 3;
            this.smogCount = 0;
        } else { // Hard (level 3+)
            this.sustainableCount = 5;
            this.pollutingCount = 3;
            this.laneWidth = 150; // Standard lane
            this.potholeCount = 3;
            this.smogCount = 4;
        }

        // Dragging state
        this.draggedVehicle = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }

    setupGame() {
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.backgroundColor = '#607d8b'; // Asphalt color
        this.container.style.width = '100%';
        this.container.style.height = '100%';

        this.width = this.container.clientWidth || 800;
        this.height = this.container.clientHeight || 600;

        if (this.width === 0) this.width = window.innerWidth * 0.8;
        if (this.height === 0) this.height = window.innerHeight * 0.6;

        // Create Green Lane (Target area) on the right side
        this.laneX = this.width - this.laneWidth;
        const lane = document.createElement('div');
        lane.style.position = 'absolute';
        lane.style.right = '0';
        lane.style.top = '0';
        lane.style.width = `${this.laneWidth}px`;
        lane.style.height = '100%';
        lane.style.backgroundColor = 'rgba(76, 175, 80, 0.4)'; // Semi-transparent green
        lane.style.borderLeft = '4px dashed #fff';
        lane.style.boxSizing = 'border-box';
        lane.style.zIndex = '1';
        this.container.appendChild(lane);

        // Spawn Potholes (obstacles) for levels >= 2
        for (let i = 0; i < this.potholeCount; i++) {
            this.spawnObstacle();
        }

        // Spawn Vehicles
        for (let i = 0; i < this.sustainableCount; i++) {
            this.spawnVehicle(true);
        }
        for (let i = 0; i < this.pollutingCount; i++) {
            this.spawnVehicle(false);
        }

        // Spawn Smog Clouds for levels >= 3
        for (let i = 0; i < this.smogCount; i++) {
            this.spawnSmog();
        }

        // Set up global mouse/touch events for dragging
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.container.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    spawnObstacle() {
        const obs = document.createElement('div');
        obs.style.position = 'absolute';
        const size = 60;
        obs.style.width = `${size}px`;
        obs.style.height = `${size}px`;
        obs.style.backgroundColor = '#424242'; // Dark gray for pothole
        obs.style.borderRadius = '50%';
        obs.style.zIndex = '2';

        // Random position, left of the green lane
        const x = Math.random() * (this.laneX - size - 20) + 10;
        const y = Math.random() * (this.height - size - 20) + 10;

        obs.style.left = `${x}px`;
        obs.style.top = `${y}px`;

        this.container.appendChild(obs);
        this.obstacles.push({ x, y, size });
    }

    spawnSmog() {
        const smog = document.createElement('div');
        smog.style.position = 'absolute';
        const size = 120;
        smog.style.width = `${size}px`;
        smog.style.height = `${size}px`;
        smog.style.borderRadius = '50%';

        // Smog appearance
        smog.style.background = 'radial-gradient(circle, rgba(169,169,169,0.9) 0%, rgba(105,105,105,0.7) 60%, rgba(169,169,169,0) 100%)';
        smog.style.zIndex = '10'; // Above everything
        smog.style.cursor = 'pointer';

        // Random position anywhere
        const x = Math.random() * (this.width - size);
        const y = Math.random() * (this.height - size);

        smog.style.left = `${x}px`;
        smog.style.top = `${y}px`;

        // Interaction: click to dissipate
        const dissipateSmog = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!this.isActive) return;
            smog.style.transition = 'opacity 0.3s ease';
            smog.style.opacity = '0';
            setTimeout(() => {
                if (smog.parentNode) smog.parentNode.removeChild(smog);
            }, 300);
        };

        smog.addEventListener('mousedown', dissipateSmog);
        smog.addEventListener('touchstart', dissipateSmog, { passive: false });

        this.container.appendChild(smog);
        this.smogClouds.push(smog);
    }

    spawnVehicle(isSustainable) {
        const el = document.createElement('div');
        const size = 64;

        // Styles
        el.style.position = 'absolute';
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.fontSize = `${size * 0.7}px`;
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.cursor = 'grab';
        el.style.userSelect = 'none';
        el.style.zIndex = '5'; // Above lane and obstacles, below smog

        // Choose icons based on type
        if (isSustainable) {
            const icons = ['🚲', '🛴', '🚋']; // Bike, Scooter, Tram/Bus
            el.innerText = icons[Math.floor(Math.random() * icons.length)];
            el.style.backgroundColor = 'rgba(76, 175, 80, 0.2)'; // Hint of green
        } else {
            const icons = ['🚗💨', '🚙💨']; // Polluting cars
            el.innerText = icons[Math.floor(Math.random() * icons.length)];
            el.style.backgroundColor = 'rgba(244, 67, 54, 0.2)'; // Hint of red
        }
        el.style.borderRadius = '10px';

        // Random position, left of the green lane, avoiding edges slightly
        const startAreaWidth = this.laneX - size;
        const x = Math.random() * startAreaWidth;
        const y = Math.random() * (this.height - size);

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        const vehicleObj = { el, isSustainable, x, y, size, inLane: false, startX: x, startY: y };
        this.vehicles.push(vehicleObj);

        // Events for drag start
        el.addEventListener('mousedown', (e) => this.startDrag(e, vehicleObj));
        el.addEventListener('touchstart', (e) => this.startDrag(e, vehicleObj), { passive: false });

        // Prevent default drag
        el.addEventListener('dragstart', (e) => e.preventDefault());

        this.container.appendChild(el);
    }

    startDrag(e, vehicle) {
        if (!this.isActive || vehicle.inLane) return; // Don't drag if already placed in lane

        e.preventDefault();
        e.stopPropagation();

        this.draggedVehicle = vehicle;
        this.draggedVehicle.el.style.cursor = 'grabbing';
        this.draggedVehicle.el.style.zIndex = '6'; // Bring to front while dragging

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        const rect = this.draggedVehicle.el.getBoundingClientRect();
        this.dragOffsetX = clientX - rect.left;
        this.dragOffsetY = clientY - rect.top;
    }

    onMouseMove(e) {
        if (!this.isActive || !this.draggedVehicle) return;
        this.handleMove(e.clientX, e.clientY);
    }

    onTouchMove(e) {
        if (!this.isActive || !this.draggedVehicle) return;
        e.preventDefault(); // Prevent scrolling while dragging
        this.handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }

    handleMove(clientX, clientY) {
        const containerRect = this.container.getBoundingClientRect();

        // Calculate new position relative to container
        let newX = clientX - containerRect.left - this.dragOffsetX;
        let newY = clientY - containerRect.top - this.dragOffsetY;

        // Boundaries
        newX = Math.max(0, Math.min(newX, this.width - this.draggedVehicle.size));
        newY = Math.max(0, Math.min(newY, this.height - this.draggedVehicle.size));

        this.draggedVehicle.x = newX;
        this.draggedVehicle.y = newY;

        this.draggedVehicle.el.style.left = `${newX}px`;
        this.draggedVehicle.el.style.top = `${newY}px`;

        // Check collision with obstacles (potholes)
        for (const obs of this.obstacles) {
            if (this.checkCollision(this.draggedVehicle, obs)) {
                // If hits a pothole, drop it and send it back to start (or just let it drop)
                this.draggedVehicle.el.style.cursor = 'grab';
                this.draggedVehicle.el.style.zIndex = '5';

                // Return to start position
                this.draggedVehicle.x = this.draggedVehicle.startX;
                this.draggedVehicle.y = this.draggedVehicle.startY;
                this.draggedVehicle.el.style.left = `${this.draggedVehicle.x}px`;
                this.draggedVehicle.el.style.top = `${this.draggedVehicle.y}px`;

                // Flash red to indicate obstacle hit
                const bg = this.draggedVehicle.el.style.backgroundColor;
                this.draggedVehicle.el.style.backgroundColor = 'rgba(255,0,0,0.5)';
                setTimeout(() => {
                    if (this.draggedVehicle) this.draggedVehicle.el.style.backgroundColor = bg;
                }, 200);

                this.draggedVehicle = null;
                break;
            }
        }
    }

    onMouseUp(e) {
        if (!this.isActive || !this.draggedVehicle) return;
        this.endDrag();
    }

    onTouchEnd(e) {
        if (!this.isActive || !this.draggedVehicle) return;
        this.endDrag();
    }

    endDrag() {
        // Check if dropped in Green Lane
        const vehCenterX = this.draggedVehicle.x + (this.draggedVehicle.size / 2);

        if (vehCenterX >= this.laneX) {
            // Dropped in lane
            if (this.draggedVehicle.isSustainable) {
                // Good! Lock it in place
                this.draggedVehicle.inLane = true;
                this.draggedVehicle.el.style.cursor = 'default';
                this.draggedVehicle.el.style.backgroundColor = 'rgba(76, 175, 80, 0.8)'; // Solid green
                this.sustainableInLane++;
                this.checkWinCondition();
            } else {
                // Bad! Polluting vehicle in green lane -> lose instantly
                this.finish(false);
            }
        }

        if (this.draggedVehicle) {
            this.draggedVehicle.el.style.cursor = this.draggedVehicle.inLane ? 'default' : 'grab';
            this.draggedVehicle.el.style.zIndex = '5';
            this.draggedVehicle = null;
        }
    }

    checkCollision(veh, obs) {
        // Simple circle collision
        const r1 = veh.size / 2;
        const r2 = obs.size / 2;
        const x1 = veh.x + r1;
        const y1 = veh.y + r1;
        const x2 = obs.x + r2;
        const y2 = obs.y + r2;

        const dx = x1 - x2;
        const dy = y1 - y2;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Shrink hitbox slightly to make it forgiving
        return distance < (r1 + r2) * 0.8;
    }

    update() {
        // Logic updates (physics, animations) could go here
        // We use event-driven for drag, so no continuous update needed
    }

    checkWinCondition() {
        if (this.sustainableInLane >= this.sustainableCount) {
            this.finish(true);
        }
    }
}