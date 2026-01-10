import { throttle } from '../utils/throttle';

export class TempView {
    private sliderTemp: any;
    private sliderBri: any;
    private numberInput: HTMLInputElement | null = null;
    private display: HTMLElement | null = null;
    private throttledAct: Function;

    constructor(root: HTMLElement, initialState: any[] = []) {
        const container = document.createElement('div');
        container.className = "flex flex-col items-center justify-center h-full gap-8 animate-fade-in max-w-xl mx-auto w-full p-4";
        
        container.innerHTML = `
            <div class="text-7xl md:text-8xl font-thin text-on-surface tracking-wider font-mono text-center" id="tempDisplay">4000K</div>
            
            <div class="w-full flex flex-col gap-6 bg-surface-container-low p-6 rounded-3xl border border-white/5">
                
                <!-- TEMP SLIDER -->
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between px-1">
                        <span class="text-label-small font-bold text-orange-300">1700K</span>
                        <span class="text-label-small font-bold text-blue-300">6500K</span>
                    </div>
                    <div class="relative w-full h-10 flex items-center justify-center">
                        <div class="absolute w-full h-4 rounded-full pointer-events-none" 
                             style="background: linear-gradient(90deg, #ff9329 0%, #ffffff 50%, #a3cfff 100%); opacity: 0.8;"></div>
                        <m3e-slider min="1700" max="6500" step="100" id="tempSlider" value="4000" 
                            class="w-full relative z-10" 
                            style="display:block; width:100%; --md-sys-color-primary: transparent; --md-sys-color-surface-container-highest: transparent;" 
                            labelled>
                            <m3e-slider-thumb style="--md-sys-color-primary: #fff;"></m3e-slider-thumb>
                        </m3e-slider>
                    </div>
                </div>

                <!-- BRIGHTNESS SLIDER -->
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between px-1">
                        <span class="text-label-small font-bold text-on-surface-variant">ЯРКОСТЬ</span>
                        <span class="text-label-small font-bold text-on-surface" id="briVal">50%</span>
                    </div>
                    <m3e-slider min="1" max="100" step="1" id="briSlider" value="50" style="display:block; width:100%;">
                        <m3e-slider-thumb></m3e-slider-thumb>
                    </m3e-slider>
                </div>

                <!-- Manual Input -->
                <div class="flex justify-center">
                    <div class="bg-surface-variant rounded-xl flex items-center px-4 py-2 border border-outline/10 w-32">
                        <input type="number" id="manualInput" min="1700" max="6500" class="bg-transparent text-center w-full outline-none font-mono text-title-medium text-on-surface" value="4000">
                        <span class="text-label-small text-on-surface-variant ml-1">K</span>
                    </div>
                </div>
            </div>

            <!-- Presets -->
            <div class="grid grid-cols-4 gap-4 w-full">
                ${this.renderPreset(1700, 'Свеча', '#ff9329')}
                ${this.renderPreset(3500, 'Закат', '#ffc58f')}
                ${this.renderPreset(4000, 'Нейтрал', '#ffe4ce')}
                ${this.renderPreset(6500, 'Дневной', '#d6eaff')}
            </div>
        `;

        root.appendChild(container);

        this.sliderTemp = container.querySelector('#tempSlider');
        this.sliderBri = container.querySelector('#briSlider');
        this.numberInput = container.querySelector('#manualInput');
        this.display = container.querySelector('#tempDisplay');
        const briLabel = container.querySelector('#briVal');

        this.throttledAct = throttle((t: string, v: string) => this.act(t, v), 100);

        // Init State
        if (initialState) this.update(initialState);

        // TEMP Events
        this.sliderTemp?.addEventListener('input', (e: any) => this.updateUI(e.target.value, false));
        this.sliderTemp?.addEventListener('change', (e: any) => this.act('temp', e.target.value));

        this.numberInput?.addEventListener('change', (e: any) => {
            let val = parseInt(e.target.value);
            if(val < 1700) val = 1700; else if(val > 6500) val = 6500;
            this.updateUI(val, true);
            this.act('temp', val.toString());
        });

        // BRIGHT Events
        this.sliderBri?.addEventListener('input', (e: any) => {
            const val = parseInt(e.target.value);
            if(briLabel) briLabel.textContent = `${val}%`;
            this.throttledAct('bright', val.toString());
        });

        container.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val')!;
                this.updateUI(parseInt(val), true);
                this.act('temp', val);
            });
        });
    }

    renderPreset(k: number, name: string, color: string) {
        return `
        <button class="preset-btn flex flex-col items-center gap-2 group cursor-pointer" data-val="${k}">
            <div class="w-12 h-12 rounded-full shadow-lg border-2 border-transparent group-hover:border-primary transition-all transform group-active:scale-90" style="background-color: ${color}"></div>
            <span class="text-label-small font-medium text-on-surface-variant group-hover:text-on-surface">${name}</span>
        </button>`;
    }

    updateUI(val: number, updateSlider = true) {
        if(this.display) this.display.textContent = `${val}K`;
        if(this.numberInput) this.numberInput.value = val.toString();
        if(updateSlider && this.sliderTemp) {
            this.sliderTemp.value = val;
            const thumb = this.sliderTemp.querySelector('m3e-slider-thumb');
            if(thumb) thumb.value = val;
        }
    }

    update(data: any[]) {
        // [power, bright, ct, rgb...]
        if(data[2]) this.updateUI(parseInt(data[2]));
        
        if(data[1] && this.sliderBri) {
            this.sliderBri.value = parseInt(data[1]);
            const thumb = this.sliderBri.querySelector('m3e-slider-thumb');
            if(thumb) thumb.value = parseInt(data[1]);
            const label = document.querySelector('#briVal');
            if(label) label.textContent = `${data[1]}%`;
        }
    }

    async act(type: string, val: string) {
        const ip = localStorage.getItem('bulb_ip');
        if (ip) await fetch(`/api/act?ip=${ip}&type=${type}&val=${val}`);
    }
}