export class ScenesView {
    constructor(root: HTMLElement) {
        const container = document.createElement('div');
        container.className = "flex flex-col gap-8 animate-fade-in w-full max-w-4xl mx-auto h-full justify-center p-4";
        
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${this.renderSceneCard('fire', 'local_fire_department', 'Огонь', 'text-orange-400', 'bg-orange-500/10', 'border-orange-500/20')}
                ${this.renderSceneCard('police', 'local_police', 'Полиция', 'text-blue-400', 'bg-blue-500/10', 'border-blue-500/20')}
                ${this.renderSceneCard('disco', 'music_note', 'Диско', 'text-purple-400', 'bg-purple-500/10', 'border-purple-500/20')}
                ${this.renderSceneCard('sunrise', 'wb_twilight', 'Рассвет', 'text-yellow-400', 'bg-yellow-500/10', 'border-yellow-500/20')}
            </div>

            <!-- Кнопка сброса: используем стандартные стили M3E с классом цвета -->
            <div class="flex justify-center mt-4">
                <m3e-button variant="outlined" id="stopBtn" class="text-error" style="--md-sys-color-outline: var(--md-sys-color-error);">
                    <m3e-icon slot="icon" name="stop_circle"></m3e-icon>
                    Сбросить эффекты
                </m3e-button>
            </div>
        `;

        root.appendChild(container);

        container.querySelector('#stopBtn')?.addEventListener('click', () => this.stopEffects());
        container.querySelectorAll('.scene-card').forEach(btn => {
            btn.addEventListener('click', () => this.run(btn.getAttribute('data-scene')!));
        });
    }

    renderSceneCard(id: string, icon: string, label: string, colorClass: string, bgClass: string, borderClass: string) {
        return `
        <button data-scene="${id}" class="scene-card h-40 ${bgClass} border ${borderClass} rounded-3xl flex flex-col items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all cursor-pointer group relative overflow-hidden">
            <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <m3e-icon name="${icon}" class="text-5xl ${colorClass} group-hover:scale-110 transition-transform mb-1"></m3e-icon>
            <span class="${colorClass} font-bold text-xl tracking-wide">${label}</span>
        </button>`;
    }

    async run(name: string) {
        const ip = localStorage.getItem('bulb_ip');
        if(ip) await fetch(`/api/scene?ip=${ip}&name=${name}`);
    }

    async stopEffects() {
        const ip = localStorage.getItem('bulb_ip');
        if(!ip) return;
        await fetch(`/api/act?ip=${ip}&type=stop`);
        await fetch(`/api/act?ip=${ip}&type=temp&val=4000`);
    }
}