import iro from '@jaames/iro';
import { throttle } from '../utils/throttle'; // Импортируем утилиту

export class ColorView {
    private colorPicker: any;
    private slider: any;
    private hexInput: HTMLInputElement | null = null;
    private throttledAct: Function;

    constructor(root: HTMLElement, initialState: any[] = []) {
        const container = document.createElement('div');
        container.className = "flex flex-col items-center gap-8 h-full justify-center animate-fade-in w-full max-w-xl mx-auto";
        container.innerHTML = `
            <div id="picker" class="bg-black/40 p-8 rounded-full border border-white/5 shadow-2xl"></div>
            
            <div class="bg-surface-container-high p-4 rounded-2xl flex items-center gap-3 border border-white/10">
                <span class="text-gray-500 font-bold">#</span>
                <input type="text" id="hexInput" maxlength="6" class="bg-transparent uppercase font-mono text-xl w-24 outline-none text-center text-white" placeholder="FFFFFF">
            </div>

            <div class="w-full bg-surface-container-low p-6 rounded-3xl border border-white/5">
                <div class="flex justify-between mb-2 px-1">
                    <span class="text-xs font-bold uppercase text-gray-500">Яркость</span>
                    <span class="text-xs font-bold text-white" id="briVal">50%</span>
                </div>
                <!-- FIX: Slider Styles & Thumb -->
                <div class="w-full h-10 flex items-center">
                    <m3e-slider min="1" max="100" step="1" id="brightSlider" labelled style="width: 100%; display: block;">
                        <m3e-slider-thumb value="50"></m3e-slider-thumb>
                    </m3e-slider>
                </div>
            </div>
        `;
        root.appendChild(container);

        // Создаем "заторможенную" версию функции отправки
        this.throttledAct = throttle((t: string, v: string) => this.act(t, v), 150);

        this.hexInput = container.querySelector('#hexInput');
        this.slider = container.querySelector('#brightSlider');
        const thumb = container.querySelector('m3e-slider-thumb') as any;
        const briLabel = container.querySelector('#briVal');

        // Init State
        if(initialState) this.update(initialState);

        this.colorPicker = new iro.ColorPicker(container.querySelector("#picker"), {
            width: 320,
            layout: [{ component: iro.ui.Wheel }],
            borderWidth: 4,
            borderColor: "#1d1b20"
        });

        this.colorPicker.on('input:end', (c: any) => {
            const hex = c.hexString.substring(1);
            if(this.hexInput) this.hexInput.value = hex;
            this.act('color', parseInt(hex, 16).toString()); // Release = instant send
        });
        
        // Optional: Throttle drag color changes if you want real-time dragging
        /* this.colorPicker.on('input:move', (c: any) => {
             const hex = c.hexString.substring(1);
             this.throttledAct('color', parseInt(hex, 16).toString());
        }); */

        this.hexInput?.addEventListener('change', (e: any) => {
            const hex = e.target.value;
            if(/^[0-9A-Fa-f]{6}$/.test(hex)) {
                this.colorPicker.color.hexString = "#" + hex;
                this.act('color', parseInt(hex, 16).toString());
            }
        });

        this.slider?.addEventListener('input', (e: any) => {
            // UI Update Immediate
            const val = thumb.value; 
            if(briLabel) briLabel.textContent = `${val}%`;
            // Throttled API
            this.throttledAct('bright', val);
        });
    }

    update(data: any[]) {
        const thumb = this.slider?.querySelector('m3e-slider-thumb') as any;
        if(data[1] && thumb) {
            thumb.value = parseInt(data[1]);
            const label = document.querySelector('#briVal');
            if(label) label.textContent = `${data[1]}%`;
        }
        if(data[3] && this.colorPicker) {
            const hex = parseInt(data[3]).toString(16).padStart(6, '0');
            this.colorPicker.color.hexString = "#" + hex;
            if(this.hexInput) this.hexInput.value = hex;
        }
    }

    async act(type: string, val: string) {
        const ip = localStorage.getItem('bulb_ip');
        if(!ip) return;
        await fetch(`/api/act?ip=${ip}&type=${type}&val=${val}`);
    }
}