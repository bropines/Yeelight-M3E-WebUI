import { ScenesView } from '../views/ScenesView';
import { ColorView } from '../views/ColorView';
import { TempView } from '../views/TempView';
import { MusicView } from '../views/MusicView';
import { BuilderView } from '../views/BuilderView';

export class App {
    private container: HTMLElement;
    private contentArea: HTMLElement;
    private currentView: any = null;
    private currentTab: string = 'scenes';

    constructor(root: HTMLElement) {
        root.innerHTML = `
            <m3e-theme scheme="dark" color="#D0BCFF" class="flex h-screen w-full text-gray-200 overflow-hidden relative">
                <!-- Save Dialog -->
                <m3e-dialog id="saveDialog" headline="Сохранить устройство">
                    <form slot="content" id="saveForm" class="flex flex-col gap-4 mt-2">
                        <m3e-form-field class="w-full">
                            <label slot="label">IP Адрес</label>
                            <input type="text" id="dlgIp" readonly>
                        </m3e-form-field>
                        <m3e-form-field class="w-full">
                            <label slot="label">Название</label>
                            <input type="text" id="dlgName" placeholder="Например: Люстра">
                        </m3e-form-field>
                    </form>
                    <div slot="actions">
                        <m3e-button variant="text" id="dlgCancel">Отмена</m3e-button>
                        <m3e-button variant="filled" id="dlgSave">Сохранить</m3e-button>
                    </div>
                </m3e-dialog>
            </m3e-theme>
        `;
        
        this.container = root.querySelector('m3e-theme') as HTMLElement;
        this.contentArea = document.createElement("main");
        this.contentArea.className = "flex-1 bg-surface p-4 md:p-8 overflow-y-auto relative custom-scrollbar";

        this.render();
        this.initLogic();
        
        // Sync on start
        setTimeout(() => this.syncState(), 500);
    }

    render() {
        const sidebar = document.createElement("aside");
        sidebar.className = "w-80 bg-surface-container-low flex flex-col p-6 gap-6 border-r border-white/5 z-20 shadow-2xl shrink-0";
        
        sidebar.innerHTML = `
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
                    <m3e-icon name="lightbulb" style="font-size: 32px;"></m3e-icon>
                </div>
                <div>
                    <h1 class="font-bold text-xl tracking-tight">Yeelight</h1>
                    <div class="flex items-center gap-2 text-xs opacity-60 font-mono mt-1" id="statusBadge">
                        <span class="w-2 h-2 rounded-full bg-red-500"></span>
                        <span>Offline</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-surface-container-high rounded-2xl p-2 flex gap-2 items-center border border-white/5">
                <input type="text" placeholder="192.168.1.X" class="bg-transparent w-full text-sm text-white outline-none px-3 font-mono h-10 placeholder:opacity-30" id="ipInput">
                <m3e-icon-button variant="tonal" id="btnSaveDevice">
                    <m3e-icon name="save"></m3e-icon>
                </m3e-icon-button>
            </div>

            <!-- Stored Devices List (Optional placeholder) -->
            <div id="devicesList" class="flex flex-col gap-1 max-h-20 overflow-y-auto hidden"></div>

            <div class="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high border border-white/5">
                <div class="flex items-center gap-3">
                    <m3e-icon name="power_settings_new"></m3e-icon>
                    <span class="font-bold text-sm">Питание</span>
                </div>
                <m3e-switch id="powerSwitch" icons="selected"></m3e-switch>
            </div>

            <nav class="flex flex-col gap-2 mt-2 flex-1 overflow-y-auto pr-1 custom-scrollbar" id="navMenu">
                ${this.renderNavItem('scenes', 'auto_awesome', 'Сцены')}
                ${this.renderNavItem('color', 'palette', 'Цвет')}
                ${this.renderNavItem('temp', 'thermostat', 'Белый')}
                ${this.renderNavItem('music', 'mic', 'Музыка')}
                ${this.renderNavItem('builder', 'build', 'Сборка')}
            </nav>
        `;

        this.container.appendChild(sidebar);
        this.container.appendChild(this.contentArea);
    }

    renderNavItem(id: string, icon: string, label: string) {
        // Tab style navigation
        return `
        <button data-tab="${id}" class="nav-item relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 text-sm font-medium text-left group overflow-hidden">
            <div class="absolute inset-0 bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-10 active-bg"></div>
            <m3e-icon name="${icon}" class="text-2xl relative z-10"></m3e-icon>
            <span class="relative z-10">${label}</span>
        </button>`;
    }

    initLogic() {
        const ipInput = document.getElementById('ipInput') as HTMLInputElement;
        ipInput.value = localStorage.getItem('bulb_ip') || '';
        
        ipInput.addEventListener('change', () => {
            localStorage.setItem('bulb_ip', ipInput.value);
            this.syncState();
        });

        // Power
        document.getElementById('powerSwitch')?.addEventListener('change', () => this.api('toggle'));

        // Save Dialog Logic
        const dialog = document.getElementById('saveDialog') as any;
        const dlgIp = document.getElementById('dlgIp') as HTMLInputElement;
        const dlgName = document.getElementById('dlgName') as HTMLInputElement;

        document.getElementById('btnSaveDevice')?.addEventListener('click', () => {
            dlgIp.value = ipInput.value;
            // Load existing name if any
            const saved = JSON.parse(localStorage.getItem('yeelight_devices') || '{}');
            dlgName.value = saved[ipInput.value] || '';
            dialog.open = true;
        });

        document.getElementById('dlgCancel')?.addEventListener('click', () => dialog.open = false);
        document.getElementById('dlgSave')?.addEventListener('click', () => {
            if(dlgIp.value) {
                const saved = JSON.parse(localStorage.getItem('yeelight_devices') || '{}');
                saved[dlgIp.value] = dlgName.value || 'My Lamp';
                localStorage.setItem('yeelight_devices', JSON.stringify(saved));
                alert("Сохранено!");
                dialog.open = false;
            }
        });

        // Nav Logic
        this.container.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => this.navigate(btn.getAttribute('data-tab')!));
        });

        this.navigate('scenes');
    }

    async navigate(tab: string) {
        if(this.currentView && typeof this.currentView.stop === 'function') this.currentView.stop();
        this.contentArea.innerHTML = '';
        this.currentTab = tab;

        // Visual Active State (Tabs)
        this.container.querySelectorAll('.nav-item').forEach(el => {
            const isActive = el.getAttribute('data-tab') === tab;
            const bg = el.querySelector('.active-bg') as HTMLElement;
            
            if(isActive) {
                el.classList.add('text-on-secondary-container', 'bg-secondary-container');
                el.classList.remove('text-gray-400');
                bg.classList.add('opacity-100'); // Full opacity for active bg
            } else {
                el.classList.remove('text-on-secondary-container', 'bg-secondary-container');
                el.classList.add('text-gray-400');
                bg.classList.remove('opacity-100');
            }
        });

        switch(tab) {
            case 'scenes': this.currentView = new ScenesView(this.contentArea); break;
            case 'color': this.currentView = new ColorView(this.contentArea); break;
            case 'temp': this.currentView = new TempView(this.contentArea); break;
            case 'music': this.currentView = new MusicView(this.contentArea); break;
            case 'builder': this.currentView = new BuilderView(this.contentArea); break;
        }
        
        // Update view with current state if available
        this.syncState();
    }

    async syncState() {
        const ip = localStorage.getItem('bulb_ip');
        if(!ip) return;
        
        try {
            const res = await fetch(`/api/status?ip=${ip}`);
            if(!res.ok) throw new Error();
            const data = await res.json(); 
            // data: [power, bright, ct, rgb, color_mode]

            // Global UI updates
            const pwr = document.querySelector('#powerSwitch') as any;
            if(pwr) pwr.checked = (data[0] === 'on');
            
            const badge = document.querySelector('#statusBadge');
            if(badge) badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span><span>Online</span>`;

            // Pass data to current view if it has update method
            if(this.currentView && typeof this.currentView.update === 'function') {
                this.currentView.update(data);
            }

        } catch(e) {
            const badge = document.querySelector('#statusBadge');
            if(badge) badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500"></span><span>Offline</span>`;
        }
    }

    async api(type: string, val = '') {
        const ip = localStorage.getItem('bulb_ip');
        if(!ip) return;
        try { await fetch(`/api/act?ip=${ip}&type=${type}&val=${val}`); } catch(e) {}
    }
}