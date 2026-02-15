import { BaseGame } from './base-game.js';

export class SaveEnergyGame extends BaseGame {
    constructor(container, level, onWin, onLose) {
        super(container, level, onWin, onLose);
        this.maxOnTime = 10; // Seconds required to win (cumulative off time?) or just survive X seconds?
        // Spec says: "Objective: Turn off devices. Victory: Keep all off for X time." 
        // Let's interpret as: Survive for 20 seconds without 3 devices being on simultaneously.
        this.survivalTime = 20; 
        this.elapsedTime = 0;
        
        this.devices = [];
        this.deviceTypes = ['light', 'tv', 'router'];
        
        this.maxActive = 3;
        this.turnOnRate = Math.max(500, 2000 - (level * 200)); 
    }

    setupGame() {
        this.container.innerHTML = '';
        this.container.className = 'energy-game';

        // Grid
        const grid = document.createElement('div');
        grid.className = 'energy-grid';
        
        // 3x3 Grid of rooms/devices
        for(let i=0; i<9; i++) {
            const device = document.createElement('div');
            device.className = 'device off';
            device.id = `device-${i}`;
            device.onclick = () => this.toggleDevice(i);
            
            // Icon
            const icon = document.createElement('div');
            icon.className = 'device-icon';
            icon.innerText = ''; // Set when on
            device.appendChild(icon);
            
            grid.appendChild(device);
            
            this.devices.push({
                id: i,
                element: device,
                state: 'off',
                icon: icon
            });
        }
        this.container.appendChild(grid);

        // UI
        const ui = document.createElement('div');
        ui.className = 'game-ui-top-left';
        ui.innerHTML = `Tiempo restante: <span id="energyTimer">${this.survivalTime}</span>s <br> Consumo: <span id="activeCount" style="color:green">0</span>/${this.maxActive}`;
        this.container.appendChild(ui);

        this.startGameLoop();
    }

    startGameLoop() {
        this.gameInterval = setInterval(() => {
            if(!this.isActive) return;
            
            // Timer logic
            this.elapsedTime++;
            const remaining = this.survivalTime - Math.floor(this.elapsedTime/10); // 10 ticks = 1 sec approx (100ms interval)
            // Wait, setInterval logic:
        }, 100);

        // Actually, let's use BaseGame timer for the "Time Left"
        // And use interval for random turn-ons
        
        this.turnOnInterval = setInterval(() => {
            if(!this.isActive) return;
            this.turnRandomDeviceOn();
        }, this.turnOnRate);
        
        // Check active count
        this.checkInterval = setInterval(() => {
            if(!this.isActive) return;
            const activeCount = this.devices.filter(d => d.state === 'on').length;
            document.getElementById('activeCount').innerText = activeCount;
            
            if(activeCount >= this.maxActive) {
                document.getElementById('activeCount').style.color = 'red';
                // Maybe fail immediately or give grace period? Spec: "Si hay 3 dispositivos encendidos al mismo tiempo -> Derrota"
                this.finish(false);
            } else {
                document.getElementById('activeCount').style.color = 'green';
            }
            
            // Win condition is time based, handled by BaseGame timer?
            // BaseGame timer calls handleTimeout -> finish(false). 
            // We need finish(true) on timeout for this game.
        }, 200);
    }
    
    // Override BaseGame logic for timer: Time running out is GOOD here.
    handleTimeout() {
        this.finish(true);
    }

    turnRandomDeviceOn() {
        const offDevices = this.devices.filter(d => d.state === 'off');
        if(offDevices.length > 0) {
            const device = offDevices[Math.floor(Math.random() * offDevices.length)];
            this.turnOn(device);
        }
    }

    turnOn(device) {
        device.state = 'on';
        device.element.classList.remove('off');
        device.element.classList.add('on');
        
        const type = this.deviceTypes[Math.floor(Math.random() * this.deviceTypes.length)];
        device.icon.innerText = this.getIcon(type);
    }

    toggleDevice(index) {
        const device = this.devices[index];
        if(device.state === 'on') {
            device.state = 'off';
            device.element.classList.remove('on');
            device.element.classList.add('off');
            device.icon.innerText = '';
            
            this.score++; // Maybe score is devices turned off?
            // Spec says "Victory: Keep all off for X time".
            // So score doesn't matter much unless we want to track it.
        }
    }

    getIcon(type) {
        if(type === 'light') return '💡';
        if(type === 'tv') return '📺';
        if(type === 'router') return '📡';
        return '';
    }

    cleanup() {
        super.cleanup();
        clearInterval(this.turnOnInterval);
        clearInterval(this.checkInterval);
        clearInterval(this.gameInterval);
    }
}
