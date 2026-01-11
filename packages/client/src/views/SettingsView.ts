import { throttle } from '../utils/throttle';

export interface ThemeConfig {
    color: string;
    scheme: 'light' | 'dark' | 'auto';
    density: number; // -3 to 1
    motion: 'standard' | 'expressive';
}

export class SettingsView {
    private config: ThemeConfig;
    private onUpdate: (conf: ThemeConfig) => void;

    constructor(root: HTMLElement, currentConfig: ThemeConfig, onUpdate: (conf: ThemeConfig) => void) {
        this.config = { ...currentConfig };
        this.onUpdate = onUpdate;

        const container = document.createElement('div');
        container.className = "flex flex-col gap-6 animate-fade-in w-full max-w-2xl mx-auto p-4 h-full overflow-y-auto custom-scrollbar pb-24";
        
        container.innerHTML = `
            <m3e-heading variant="headline" size="medium">Настройки интерфейса</m3e-heading>

            <!-- 1. COLOR SCHEME -->
            <m3e-card variant="outlined" class="flex flex-col gap-4">
                <m3e-heading slot="header" variant="title" size="medium">Цветовая схема</m3e-heading>
                <div slot="content" class="flex flex-col gap-4">
                    
                    <div class="flex flex-col gap-2">
                        <span class="text-label-large">Основной цвет (Seed Color)</span>
                        <div class="flex items-center gap-4">
                            <input type="color" id="themeColorPicker" class="w-16 h-12 bg-transparent cursor-pointer border-0 p-0" value="${this.config.color}">
                            <span class="text-body-medium font-mono opacity-70" id="themeColorHex">${this.config.color}</span>
                        </div>
                    </div>

                    <m3e-divider></m3e-divider>

                    <div class="flex flex-col gap-2">
                        <span class="text-label-large">Режим</span>
                        <m3e-segmented-button id="schemeSelect" class="w-full">
                            <m3e-button-segment value="auto" ${this.config.scheme === 'auto' ? 'checked' : ''} icon="brightness_auto">Auto</m3e-button-segment>
                            <m3e-button-segment value="light" ${this.config.scheme === 'light' ? 'checked' : ''} icon="light_mode">Light</m3e-button-segment>
                            <m3e-button-segment value="dark" ${this.config.scheme === 'dark' ? 'checked' : ''} icon="dark_mode">Dark</m3e-button-segment>
                        </m3e-segmented-button>
                    </div>
                </div>
            </m3e-card>

            <!-- 2. DENSITY & MOTION -->
            <m3e-card variant="outlined" class="flex flex-col gap-4">
                <m3e-heading slot="header" variant="title" size="medium">Интерфейс</m3e-heading>
                <div slot="content" class="flex flex-col gap-6">
                    
                    <!-- Density -->
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between">
                            <span class="text-label-large">Плотность (Density)</span>
                            <span class="text-label-medium opacity-70" id="densityVal">${this.config.density}</span>
                        </div>
                        <m3e-slider min="-3" max="1" step="1" value="${this.config.density}" id="densitySlider" discrete labelled style="width:100%; display:block;">
                            <m3e-slider-thumb></m3e-slider-thumb>
                        </m3e-slider>
                        <div class="flex justify-between text-label-small opacity-50 px-1">
                            <span>Compact</span>
                            <span>Spacious</span>
                        </div>
                    </div>

                    <!-- Motion -->
                    <div class="flex flex-col gap-2">
                        <span class="text-label-large">Анимации (Motion)</span>
                        <m3e-segmented-button id="motionSelect" class="w-full">
                            <m3e-button-segment value="standard" ${this.config.motion === 'standard' ? 'checked' : ''}>Standard</m3e-button-segment>
                            <m3e-button-segment value="expressive" ${this.config.motion === 'expressive' ? 'checked' : ''}>Expressive</m3e-button-segment>
                        </m3e-segmented-button>
                    </div>

                </div>
            </m3e-card>

            <!-- 3. PREVIEW -->
            <m3e-card variant="filled" class="flex flex-col gap-4">
                <m3e-heading slot="header" variant="title" size="medium">Предпросмотр</m3e-heading>
                <div slot="content" class="flex flex-wrap gap-4 items-center justify-center py-4">
                    <m3e-button variant="filled">Filled</m3e-button>
                    <m3e-button variant="tonal">Tonal</m3e-button>
                    <m3e-button variant="outlined">Outlined</m3e-button>
                    <m3e-fab variant="primary" size="medium"><m3e-icon name="edit"></m3e-icon></m3e-fab>
                    <m3e-switch checked icons="both"></m3e-switch>
                </div>
            </m3e-card>
        `;

        root.appendChild(container);
        this.initLogic(container);
    }

    private initLogic(container: HTMLElement) {
        // Color Picker
        const colorPicker = container.querySelector('#themeColorPicker') as HTMLInputElement;
        const colorLabel = container.querySelector('#themeColorHex') as HTMLElement;
        
        colorPicker.addEventListener('input', (e: any) => {
            const val = e.target.value;
            colorLabel.innerText = val;
            this.config.color = val;
            this.notify();
        });

        // Scheme
        const schemeSelect = container.querySelector('#schemeSelect');
        schemeSelect?.addEventListener('change', () => {
            const selected = Array.from(schemeSelect.querySelectorAll('m3e-button-segment')).find((s: any) => s.checked) as any;
            if(selected) {
                this.config.scheme = selected.value;
                this.notify();
            }
        });

        // Motion
        const motionSelect = container.querySelector('#motionSelect');
        motionSelect?.addEventListener('change', () => {
            const selected = Array.from(motionSelect.querySelectorAll('m3e-button-segment')).find((s: any) => s.checked) as any;
            if(selected) {
                this.config.motion = selected.value;
                this.notify();
            }
        });

        // Density
        const densitySlider = container.querySelector('#densitySlider');
        densitySlider?.addEventListener('change', (e: any) => {
            this.config.density = parseInt(e.target.value);
            container.querySelector('#densityVal')!.textContent = this.config.density.toString();
            this.notify();
        });
    }

    private notify() {
        this.onUpdate(this.config);
    }
}