import { debounce } from '../utils/timing';

export class TempView {
    private sliderTemp: any;
    private sliderBri: any;
    private display: HTMLElement | null = null;
    
    private debouncedTemp: Function;
    private debouncedBri: Function;

    constructor(root: HTMLElement, initialState: any[] = []) {
        this.debouncedTemp = debounce((val: string) => this.act('temp', val), 300);
        this.debouncedBri = debounce((val: string) => this.act('bright', val), 300);

        const container = document.createElement('div');
        container.className = "flex flex-col items-center justify-center h-full gap-10 animate-fade-in max-w-xl mx-auto w-full p-4";
        
        container.innerHTML = `
            <!-- EDITABLE DISPLAY -->
            <div class="relative group">
                <div class="text-7xl md:text-9xl font-thin text-on-surface tracking-wider font-mono text-center transition-all outline-none border-b-2 border-transparent focus:border-primary/50 cursor-text hover:text-primary/90" 
                     id="tempDisplay" contenteditable="true" spellcheck="false">4000</div>
                <span class="absolute top-2 -right-6 md:-right-8 text-2xl text-on-surface-variant font-bold select-none">K</span>
                <div class="absolute -bottom-6 w-full text-center text-xs text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Нажми для ввода
                </div>
            </div>
            
            <div class="w-full flex flex-col gap-8 bg-surface-container-low p-8 rounded-[32px] border border-white/5 shadow-xl">
                
                <!-- TEMP SLIDER -->
                <div class="flex flex-col gap-3">
                    <div class="flex justify-between px-1">
                        <span class="text-label-medium font-bold text-orange-300">1700K</span>
                        <span class="text-label-medium font-bold text-blue-300">6500K</span>
                    </div>
                    <div class="relative w-full h-12 flex items-center justify-center">
                        <!-- Gradient Track -->
                        <div class="absolute w-full h-6 rounded-full pointer-events-none shadow-inner border border-white/5" 
                             style="background: linear-gradient(90deg, #ff9329 0%, #ffffff 50%, #a3cfff 100%);"></div>
                        
                        <m3e-slider min="1700" max="6500" step="100" id="tempSlider" value="4000" 
                            class="w-full relative z-10" 
                            style="display:block; width:100%; --md-sys-color-primary: transparent; --md-sys-color-surface-container-highest: transparent;" 
                            labelled>
                            <m3e-slider-thumb style="--md-sys-color-primary: #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.3);"></m3e-slider-thumb>
                        </m3e-slider>
                    </div>
                </div>

                <!-- BRIGHTNESS SLIDER -->
                <div class="flex flex-col gap-3">
                    <div class="flex justify-between px-1 items-end">
                        <div class="flex items-center gap-2 text-on-surface-variant">
                            <m3e-icon name="brightness_6"></m3e-icon>
                            <span class="text-label-medium font-bold uppercase tracking-wider">Яркость</span>
                        </div>
                        <span class="text-title-medium font-mono text-primary font-bold" id="briVal">50%</span>
                    </div>
                    <m3e-slider min="1" max="100" step="1" id="briSlider" value="50" style="display:block; width:100%;">
                        <m3e-slider-thumb></m3e-slider-thumb>
                    </m3e-slider>
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
        this.display = container.querySelector('#tempDisplay');
        const briLabel = container.querySelector('#briVal');

        if (initialState) this.update(initialState);

        // --- EVENTS ---

        // 1. Temperature Slider
        this.sliderTemp?.addEventListener('input', (e: any) => {
            const val = e.target.value;
            this.updateUI(val, false); 
            this.debouncedTemp(val);
        });

        // 2. Editable Display
        this.display?.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.display?.blur();
            }
        });

        this.display?.addEventListener('blur', () => {
            let val = parseInt(this.display?.innerText || '4000');
            if (isNaN(val)) val = 4000;
            if (val < 1700) val = 1700; else if (val > 6500) val = 6500;
            
            this.updateUI(val, true);
            this.act('temp', val.toString());
        });

        // 3. Brightness
        this.sliderBri?.addEventListener('input', (e: any) => {
            const val = e.target.value;
            if(briLabel) briLabel.textContent = `${val}%`;
            this.debouncedBri(val);
        });

        // 4. Presets
        container.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val')!;
                this.updateUI(parseInt(val), true);
                this.act('temp', val); // Instant
            });
        });
    }

    renderPreset(k: number, name: string, color: string) {
        return `
        <button class="preset-btn flex flex-col items-center gap-3 group cursor-pointer active:scale-95 transition-transform" data-val="${k}">
            <div class="w-14 h-14 rounded-2xl shadow-lg border-2 border-transparent group-hover:border-primary transition-all relative overflow-hidden" style="background-color: ${color}">
                <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span class="text-label-small font-bold text-on-surface-variant group-hover:text-on-surface uppercase tracking-wide">${name}</span>
        </button>`;
    }

    updateUI(val: number, updateSlider = true) {
        if(this.display) this.display.innerText = val.toString();
        if(updateSlider && this.sliderTemp) {
            this.sliderTemp.value = val;
            const thumb = this.sliderTemp.querySelector('m3e-slider-thumb');
            if(thumb) thumb.value = val;
        }
    }

    update(data: any[]) {
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