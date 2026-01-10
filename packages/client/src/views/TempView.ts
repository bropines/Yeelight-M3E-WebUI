export class TempView {
    constructor(root: HTMLElement) {
        const container = document.createElement('div');
        container.className = "flex flex-col items-center justify-center h-full gap-12 animate-fade-in max-w-xl mx-auto w-full";
        
        container.innerHTML = `
            <div class="text-8xl font-thin text-white tracking-wider font-mono" id="tempDisplay">4000K</div>
            
            <div class="w-full flex flex-col gap-2">
                <div class="flex justify-between px-1 mb-2">
                    <span class="text-xs font-bold uppercase text-orange-300">Теплый (1700K)</span>
                    <span class="text-xs font-bold uppercase text-blue-300">Холодный (6500K)</span>
                </div>
                
                <!-- M3E Slider -->
                <m3e-slider min="1700" max="6500" step="100" id="tempSlider" labelled>
                    <m3e-slider-thumb value="4000"></m3e-slider-thumb>
                </m3e-slider>
            </div>

            <!-- Presets -->
            <div class="flex gap-4 mt-8">
                <m3e-chip-set>
                    <m3e-chip class="preset-chip" data-val="1700">Свеча</m3e-chip>
                    <m3e-chip class="preset-chip" data-val="3500">Закат</m3e-chip>
                    <m3e-chip class="preset-chip" data-val="4000">Нейтральный</m3e-chip>
                    <m3e-chip class="preset-chip" data-val="6500">Дневной</m3e-chip>
                </m3e-chip-set>
            </div>
        `;

        root.appendChild(container);

        const slider = container.querySelector('#tempSlider');
        const thumb = container.querySelector('m3e-slider-thumb');
        const display = container.querySelector('#tempDisplay')!;

        // Listener for Slider
        slider?.addEventListener('input', (e: any) => {
            // M3E slider event target is the slider itself, value is in the thumb or dispatched event detail
            // Usually we check the thumb value
            const val = (thumb as any).value;
            display.textContent = `${val}K`;
        });

        slider?.addEventListener('change', (e: any) => {
            const val = (thumb as any).value;
            this.act('temp', val);
        });

        // Presets
        container.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const val = chip.getAttribute('data-val')!;
                (thumb as any).value = val;
                display.textContent = `${val}K`;
                this.act('temp', val);
            });
        });
    }

    async act(type: string, val: string) {
        const ip = localStorage.getItem('bulb_ip');
        if (ip) await fetch(`/api/act?ip=${ip}&type=${type}&val=${val}`);
    }
}