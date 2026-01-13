import iro from '@jaames/iro';
import { debounce } from '../utils/timing';

export class ColorView {
    private colorPicker: any;
    private slider: any;
    private hexInput: HTMLInputElement | null = null;
    
    private debouncedColor: Function;
    private debouncedBri: Function;

    constructor(root: HTMLElement, initialState: any[] = []) {
        // Задержка 200мс для цвета, 300мс для яркости
        this.debouncedColor = debounce((val: string) => this.act('color', val), 200);
        this.debouncedBri = debounce((val: string) => this.act('bright', val), 300);

        const container = document.createElement('div');
        container.className = "flex flex-col items-center gap-8 h-full justify-center animate-fade-in w-full max-w-xl mx-auto";
        container.innerHTML = `
            <div id="picker" class="bg-black/20 p-6 rounded-full border border-white/5 shadow-2xl"></div>
            
            <div class="bg-surface-container-high p-4 rounded-2xl flex items-center gap-3 border border-white/10">
                <span class="text-gray-500 font-bold">#</span>
                <input type="text" id="hexInput" maxlength="6" class="bg-transparent uppercase font-mono text-xl w-24 outline-none text-center text-white" placeholder="FFFFFF">
            </div>

            <div class="w-full bg-surface-container-low p-6 rounded-3xl border border-white/5">
                <div class="flex justify-between mb-2 px-1">
                    <span class="text-xs font-bold uppercase text-gray-500">Яркость</span>
                    <span class="text-xs font-bold text-white" id="briVal">50%</span>
                </div>
                <m3e-slider min="1" max="100" step="1" id="brightSlider" style="width: 100%; display: block;">
                    <m3e-slider-thumb value="50"></m3e-slider-thumb>
                </m3e-slider>
            </div>
        `;
        root.appendChild(container);

        this.hexInput = container.querySelector('#hexInput');
        this.slider = container.querySelector('#brightSlider');
        const briLabel = container.querySelector('#briVal');

        if(initialState) this.update(initialState);

        this.colorPicker = new iro.ColorPicker(container.querySelector("#picker"), {
            width: 280,
            layout: [{ component: iro.ui.Wheel }],
            borderWidth: 3,
            borderColor: "#ffffff20"
        });

        // 1. COLOR LOGIC
        // Движение мыши -> только UI + Debounced запрос
        this.colorPicker.on('input:move', (c: any) => {
            const hex = c.hexString.substring(1).toUpperCase();
            if(this.hexInput) this.hexInput.value = hex;
            
            // Если сеть быстрая, можно включить это:
            // this.debouncedColor(parseInt(hex, 16).toString());
        });

        // Отпускание мыши -> Гарантированная отправка
        this.colorPicker.on('input:end', (c: any) => {
            const hex = c.hexString.substring(1);
            // Тут можно без debounce, пользователь уже закончил действие
            this.act('color', parseInt(hex, 16).toString());
        });

        // 2. HEX INPUT
        this.hexInput?.addEventListener('input', (e: any) => {
            const hex = e.target.value;
            if(/^[0-9A-Fa-f]{6}$/.test(hex)) {
                this.colorPicker.color.hexString = "#" + hex;
                this.debouncedColor(parseInt(hex, 16).toString());
            }
        });

        // 3. BRIGHTNESS
        this.slider?.addEventListener('input', (e: any) => {
            const val = e.target.value;
            if(briLabel) briLabel.textContent = `${val}%`; // UI
            this.debouncedBri(val); // Network
        });
    }

    update(data: any[]) {
        // [power, bright, ct, rgb...]
        const thumb = this.slider?.querySelector('m3e-slider-thumb') as any;
        if(data[1] && thumb) {
            thumb.value = parseInt(data[1]);
            const label = document.querySelector('#briVal');
            if(label) label.textContent = `${data[1]}%`;
        }
        if(data[3] && this.colorPicker) {
            const hex = parseInt(data[3]).toString(16).padStart(6, '0');
            // Проверка, чтобы не сбивать цвет, пока юзер его выбирает (простой фокус чек)
            if (document.activeElement !== this.hexInput) {
                this.colorPicker.color.hexString = "#" + hex;
                if(this.hexInput) this.hexInput.value = hex.toUpperCase();
            }
        }
    }

    async act(type: string, val: string) {
        const ip = localStorage.getItem('bulb_ip');
        if(!ip) return;
        await fetch(`/api/act?ip=${ip}&type=${type}&val=${val}`);
    }
}