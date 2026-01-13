import { ScenesView } from '../views/ScenesView';
import { ColorView } from '../views/ColorView';
import { TempView } from '../views/TempView';
import { MusicView } from '../views/MusicView';
import { BuilderView } from '../views/BuilderView';
import { SettingsView, ThemeConfig } from '../views/SettingsView';
import { NativeDialog } from './NativeDialog';

const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const DEFAULT_THEME: ThemeConfig = {
    color: '#D0BCFF',
    scheme: 'dark',
    density: 0,
    motion: 'standard'
};

export class App {
    private container: HTMLElement;
    private contentArea: HTMLElement;
    private currentView: any = null;
    private lastState: any[] = [];
    private pollInterval: any;
    private themeConfig: ThemeConfig;

    constructor(root: HTMLElement) {
        const savedTheme = localStorage.getItem('yeelight_theme');
        this.themeConfig = savedTheme ? JSON.parse(savedTheme) : DEFAULT_THEME;

        root.innerHTML = `
            <m3e-theme 
                scheme="${this.themeConfig.scheme}" 
                color="${this.themeConfig.color}" 
                density="${this.themeConfig.density}" 
                motion="${this.themeConfig.motion}"
                class="flex h-screen w-full bg-background text-on-surface overflow-hidden relative flex-col md:flex-row transition-colors duration-500"
                id="mainTheme">
                
                <m3e-nav-rail id="mainRail" class="hidden md:flex border-r border-outline-variant/10">
                    <m3e-icon-button slot="menu-button" toggle>
                        <m3e-icon name="menu"></m3e-icon>
                        <m3e-icon slot="selected" name="menu_open"></m3e-icon>
                        <m3e-nav-rail-toggle for="mainRail"></m3e-nav-rail-toggle>
                    </m3e-icon-button>
                    ${this.renderNavItems('rail')}
                </m3e-nav-rail>

                <div class="flex-1 flex flex-col h-full min-w-0 bg-background transition-all overflow-hidden">
                    <header class="h-20 px-4 md:px-8 flex items-center justify-between border-b border-outline-variant/10 bg-surface gap-4 shrink-0 z-10">
                        <div class="flex items-center gap-3">
                            <span class="text-title-medium md:text-title-large font-bold whitespace-nowrap hidden sm:block">Yeelight</span>
                            <div class="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-variant/50 border border-outline-variant/10" id="statusBadge">
                                <span class="w-2 h-2 rounded-full bg-error"></span>
                                <span class="text-xs font-mono opacity-70 uppercase tracking-widest">Offline</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 flex-1 justify-end">
                            <m3e-icon-button id="btnRefresh" variant="standard" class="text-on-surface-variant hidden sm:flex">
                                <m3e-icon name="refresh"></m3e-icon>
                            </m3e-icon-button>

                            <div class="flex items-center bg-surface-variant rounded-xl px-3 h-10 md:h-12 border border-outline-variant/20 hover:border-outline/50 transition-colors w-32 md:w-48 group focus-within:border-primary">
                                <input type="text" id="ipInput" class="bg-transparent border-none outline-none text-sm font-mono text-on-surface-variant w-full text-center placeholder:text-on-surface-variant/30" placeholder="192.168.1.X">
                            </div>
                            
                            <m3e-icon-button id="btnSaveDevice" variant="tonal" class="shrink-0" title="Сохранить устройство">
                                <m3e-icon name="save"></m3e-icon>
                            </m3e-icon-button>

                            <div class="w-px h-8 bg-outline-variant/20 mx-1 hidden sm:block"></div>

                            <div class="flex items-center gap-2 bg-surface-container-high rounded-full pl-4 pr-1 py-1 border border-outline-variant/10">
                                <span class="text-label-small font-bold uppercase tracking-wider mr-1 hidden sm:block">Свет</span>
                                <m3e-switch id="powerSwitch" icons="selected"></m3e-switch>
                            </div>
                        </div>
                    </header>

                    <main id="viewContainer" class="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar pb-24 md:pb-8"></main>
                </div>

                <m3e-nav-bar class="md:hidden border-t border-outline-variant/10 shrink-0 z-20">
                    ${this.renderNavItems('bar')}
                </m3e-nav-bar>
            </m3e-theme>
        `;
        
        this.container = root.querySelector('#mainTheme') as HTMLElement;
        this.contentArea = root.querySelector('#viewContainer') as HTMLElement;

        this.initLogic();
        this.navigate('scenes');
        
        this.syncState();
        this.pollInterval = setInterval(() => this.syncState(), 2000);
    }

    renderNavItems(type: 'rail' | 'bar') {
        const items = [
            { id: 'scenes', icon: 'auto_awesome', label: 'Сцены' },
            { id: 'color', icon: 'palette', label: 'Цвет' },
            { id: 'temp', icon: 'thermostat', label: 'Белый' },
            { id: 'music', icon: 'mic', label: 'Музыка' },
            { id: 'builder', icon: 'build', label: 'Сборка' },
            { id: 'settings', icon: 'settings', label: 'Настр.' },
        ];

        return items.map((item, idx) => `
            <m3e-nav-item data-tab="${item.id}" ${idx === 0 ? 'active' : ''}>
                <m3e-icon slot="${type === 'bar' ? 'active-icon' : 'icon'}" name="${item.icon}"></m3e-icon>
                ${type === 'bar' ? `<m3e-icon slot="icon" name="${item.icon}"></m3e-icon>` : ''}
                ${item.label}
            </m3e-nav-item>
        `).join('');
    }

    initLogic() {
        const ipInput = document.getElementById('ipInput') as HTMLInputElement;
        const currentIp = localStorage.getItem('bulb_ip') || '';
        ipInput.value = currentIp;

        ipInput.addEventListener('input', () => {
            const val = ipInput.value.trim();
            if (IP_REGEX.test(val)) {
                ipInput.classList.remove('text-error');
                localStorage.setItem('bulb_ip', val);
                this.syncState();
            } else {
                ipInput.classList.add('text-error');
            }
        });

                // --- FIX: DESYNC ON TAB SWITCH ---
        // Когда вкладка становится активной - мгновенный опрос
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                console.log("👀 Tab active: Force sync");
                this.syncState();
                
                // Перезапуск поллинга, если браузер его убил
                clearInterval(this.pollInterval);
                this.pollInterval = setInterval(() => this.syncState(), 2000);
            }
        });

        const pwrSwitch = document.getElementById('powerSwitch') as any;
        pwrSwitch?.addEventListener('change', (e: any) => {
            const newState = e.target.checked;
            if (this.lastState.length > 0) {
                this.lastState[0] = newState ? 'on' : 'off';
            }
            this.api('toggle');
        });
        
        document.getElementById('btnRefresh')?.addEventListener('click', () => this.syncState());

        // --- NEW DIALOG LOGIC ---
        document.getElementById('btnSaveDevice')?.addEventListener('click', async () => {
            if(!ipInput.value || !IP_REGEX.test(ipInput.value)) return;
            
            const currentIp = ipInput.value;
            const saved = JSON.parse(localStorage.getItem('yeelight_devices') || '{}');
            const currentName = saved[currentIp] || '';

            // M3 Styled Inputs
            const dialogContent = `
                <div class="flex flex-col gap-4 pt-2">
                    
                    <!-- IP READONLY FIELD -->
                    <div class="flex flex-col gap-1">
                        <div class="relative bg-surface-variant/30 rounded-t-lg rounded-b-none border-b border-outline-variant hover:bg-surface-variant/50 transition-colors h-14 px-4 flex flex-col justify-center opacity-60">
                            <span class="text-[12px] text-primary font-medium leading-4">IP Адрес</span>
                            <input type="text" value="${currentIp}" readonly 
                                class="bg-transparent border-none outline-none text-on-surface text-body-large font-mono p-0 pointer-events-none">
                            <m3e-icon name="wifi" class="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"></m3e-icon>
                        </div>
                    </div>

                    <!-- NAME INPUT FIELD -->
                    <div class="flex flex-col gap-1">
                        <div class="relative bg-surface-variant/30 rounded-t-lg rounded-b-none border-b border-on-surface hover:bg-surface-variant/50 focus-within:bg-surface-variant/50 transition-colors h-14 px-4 flex flex-col justify-center group">
                            <span class="text-[12px] text-on-surface-variant group-focus-within:text-primary font-medium leading-4 transition-colors">Название устройства</span>
                            <input type="text" id="dlgNameInput" placeholder="Например: Люстра" value="${currentName}" 
                                class="bg-transparent border-none outline-none text-on-surface text-body-large p-0 placeholder:text-on-surface-variant/30">
                            <m3e-icon name="edit" class="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors"></m3e-icon>
                        </div>
                    </div>

                </div>
            `;

            const dlg = new NativeDialog("Сохранение", dialogContent, [
                { label: "Отмена", value: "cancel", variant: "text" },
                { label: "Сохранить", value: "save", variant: "filled" }
            ]);

            const result = await dlg.open();
            
            if (result === 'save') {
                const nameInput = dlg.getElement('#dlgNameInput') as HTMLInputElement;
                saved[currentIp] = nameInput.value || 'My Lamp';
                localStorage.setItem('yeelight_devices', JSON.stringify(saved));
                // Optional: Show snackbar confirmation here
            }
        });

        // Navigation
        const navItems = this.container.querySelectorAll('m3e-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                if(!tab) return;
                navItems.forEach(i => {
                    if(i.getAttribute('data-tab') === tab) i.setAttribute('active', '');
                    else i.removeAttribute('active');
                });
                this.navigate(tab);
            });
        });
    }

    applyTheme(conf: ThemeConfig) {
        this.themeConfig = conf;
        localStorage.setItem('yeelight_theme', JSON.stringify(conf));
        this.container.setAttribute('color', conf.color);
        this.container.setAttribute('scheme', conf.scheme);
        this.container.setAttribute('density', conf.density.toString());
        this.container.setAttribute('motion', conf.motion);
    }

    navigate(tab: string) {
        if(this.currentView && typeof this.currentView.stop === 'function') this.currentView.stop();
        this.contentArea.innerHTML = '';

        switch(tab) {
            case 'scenes': this.currentView = new ScenesView(this.contentArea); break;
            case 'color': this.currentView = new ColorView(this.contentArea, this.lastState); break;
            case 'temp': this.currentView = new TempView(this.contentArea, this.lastState); break;
            case 'music': this.currentView = new MusicView(this.contentArea); break;
            case 'builder': this.currentView = new BuilderView(this.contentArea); break;
            case 'settings': this.currentView = new SettingsView(this.contentArea, this.themeConfig, (c) => this.applyTheme(c)); break;
        }
    }

    async syncState() {
        const ip = localStorage.getItem('bulb_ip');
        if(!ip || !IP_REGEX.test(ip)) return;
        
        const badge = document.getElementById('statusBadge');
        const pwrSwitch = document.getElementById('powerSwitch') as any;
        const refreshBtn = document.getElementById('btnRefresh');

        if(refreshBtn) refreshBtn.style.opacity = '0.5';

        try {
            const res = await fetch(`/api/status?ip=${ip}`);
            if(!res.ok) throw new Error();
            const data = await res.json(); 
            this.lastState = data;

            if(pwrSwitch) {
                const isOn = data[0] === 'on';
                if (pwrSwitch.checked !== isOn) {
                    pwrSwitch.selected = isOn;
                    pwrSwitch.checked = isOn;
                }
            }

            if(badge) badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span><span class="opacity-100 font-bold text-green-200">Online</span>`;

            if(this.currentView && typeof this.currentView.update === 'function') {
                this.currentView.update(data);
            }
        } catch(e) {
            if(badge) badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-error"></span><span class="opacity-70">Offline</span>`;
        } finally {
            if(refreshBtn) refreshBtn.style.opacity = '1';
        }
    }

    async api(type: string, val = '') {
        const ip = localStorage.getItem('bulb_ip');
        if(!ip) return;
        try { 
            await fetch(`/api/act?ip=${ip}&type=${type}&val=${val}`);
            if (type !== 'toggle') {
                setTimeout(() => this.syncState(), 150);
            }
        } catch(e) {}
    }
}