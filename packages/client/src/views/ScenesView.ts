export class ScenesView {
    constructor(root: HTMLElement) {
        const container = document.createElement('div');
        container.className = "flex flex-col gap-6 animate-fade-in w-full max-w-4xl mx-auto";
        
        container.innerHTML = `
            <!-- Stop Panel: используем темные стили -->
            <m3e-card variant="outlined" class="!bg-error-container/20 !border-error/30 !flex-row items-center justify-between p-6">
                 <div class="flex items-center gap-4">
                    <m3e-icon name="stop_circle" class="text-error text-3xl"></m3e-icon>
                    <div>
                        <div class="text-error font-bold text-lg">Остановить эффекты</div>
                        <div class="text-xs opacity-60">Вернуть обычный режим</div>
                    </div>
                 </div>
                 <m3e-button variant="tonal" id="stopBtn" class="!bg-error/20 !text-error">Стоп</m3e-button>
            </m3e-card>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                ${this.renderSceneCard('fire', 'local_fire_department', 'Огонь', 'text-orange-400', 'bg-orange-500/10', 'border-orange-500/20')}
                ${this.renderSceneCard('police', 'local_police', 'Полиция', 'text-blue-400', 'bg-blue-500/10', 'border-blue-500/20')}
                ${this.renderSceneCard('disco', 'music_note', 'Диско', 'text-purple-400', 'bg-purple-500/10', 'border-purple-500/20')}
                ${this.renderSceneCard('sunrise', 'wb_twilight', 'Рассвет', 'text-yellow-400', 'bg-yellow-500/10', 'border-yellow-500/20')}
            </div>
        `;

        root.appendChild(container);

        container.querySelector('#stopBtn')?.addEventListener('click', () => this.run('stop'));
        container.querySelectorAll('.scene-card').forEach(btn => {
            btn.addEventListener('click', () => this.run(btn.getAttribute('data-scene')!));
        });
    }

    renderSceneCard(id: string, icon: string, label: string, colorClass: string, bgClass: string, borderClass: string) {
        return `
        <button data-scene="${id}" class="scene-card h-40 ${bgClass} border ${borderClass} rounded-3xl flex flex-col items-center justify-center gap-3 hover:scale-[0.98] active:scale-95 transition-all cursor-pointer group">
            <m3e-icon name="${icon}" class="text-5xl ${colorClass} group-hover:scale-110 transition-transform"></m3e-icon>
            <span class="${colorClass} font-bold text-lg tracking-wide">${label}</span>
        </button>`;
    }

    async run(name: string) {
        const ip = localStorage.getItem('bulb_ip');
        if(ip) await fetch(`/api/scene?ip=${ip}&name=${name}`);
    }
}