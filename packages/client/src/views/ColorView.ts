import iro from '@jaames/iro';

export class ColorView {
    constructor(root: HTMLElement) {
        const container = document.createElement('div');
        container.className = "flex flex-col items-center gap-12 h-full justify-center animate-fade-in w-full max-w-xl mx-auto";
        container.innerHTML = `
            <div id="picker" class="bg-black/40 p-8 rounded-full border border-white/5 shadow-2xl"></div>
            
            <div class="w-full">
                <div class="flex justify-between mb-2 px-1">
                    <m3e-icon name="brightness_low" class="text-gray-500"></m3e-icon>
                    <span class="text-xs font-bold uppercase tracking-widest text-gray-500">Яркость</span>
                    <m3e-icon name="brightness_high" class="text-white"></m3e-icon>
                </div>
                <!-- w-full и labelled для отображения значения -->
                <m3e-slider min="1" max="100" step="1" id="brightSlider" labelled class="w-full">
                    <m3e-slider-thumb value="50"></m3e-slider-thumb>
                </m3e-slider>
            </div>
        `;
        root.appendChild(container);

        const colorPicker = new iro.ColorPicker(container.querySelector("#picker"), {
            width: 320,
            layout: [{ component: iro.ui.Wheel }],
            borderWidth: 4,
            borderColor: "#1d1b20"
        });

        colorPicker.on('input:end', (c: any) => {
            const hex = c.hexString.substring(1);
            const val = parseInt(hex, 16);
            this.act('color', val.toString());
        });

        const slider = container.querySelector('#brightSlider');
        const thumb = container.querySelector('m3e-slider-thumb');

        slider?.addEventListener('change', () => {
            this.act('bright', (thumb as any).value);
        });
    }

    async act(type: string, val: string) {
        const ip = localStorage.getItem('bulb_ip');
        if(!ip) return;
        await fetch(`/api/act?ip=${ip}&type=${type}&val=${val}`);
    }
}