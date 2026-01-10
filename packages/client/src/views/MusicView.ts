import { throttle } from '../utils/throttle';

export class MusicView {
    // ... (поля те же)
    private active = false;
    private audioCtx: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private audioSourceType: 'mic' | 'sys' = 'mic';
    private isSimulation = false; 
    private sensitivity = 130;
    private smoothing = 0.5;
    
    // Throttled sender
    private throttledSend: Function;

    constructor(root: HTMLElement) {
        // Ограничиваем отправку пакетов музыки до 10-12 раз в секунду (80-100мс)
        // Лампа по TCP не вывезет 60fps
        this.throttledSend = throttle((ip: string, bri: number) => {
            fetch(`/api/music/update?ip=${ip}&bri=${bri}`).catch(()=>{});
        }, 80);

        const container = document.createElement('div');
        container.className = "flex flex-col items-center h-full gap-6 pt-6 animate-fade-in w-full max-w-3xl mx-auto";
        
        // ... (HTML тот же, но убедись что слайдеры имеют thumb)
        container.innerHTML = `
            <m3e-card variant="outlined" class="!p-0 overflow-hidden w-full aspect-video relative bg-black border-white/10 rounded-3xl shadow-2xl">
                 <canvas id="visCanvas" class="w-full h-full opacity-80"></canvas>
                 <div class="absolute top-4 left-4 text-[10px] font-mono opacity-60 leading-tight pointer-events-none">
                    <div class="text-primary font-bold mb-1">STREAM INFO</div>
                    <div>BASS: <span id="debugBass">0</span></div>
                    <div>CMD: <span id="debugSent" class="text-gray-500">--</span></div>
                 </div>
            </m3e-card>

            <div class="w-full max-w-md flex flex-col gap-4">
                <div class="bg-surface-container-low p-4 rounded-xl border border-white/5 flex flex-col gap-4">
                    <div>
                        <div class="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                            <span>Чувствительность</span>
                            <span id="sensVal">130</span>
                        </div>
                        <m3e-slider min="1" max="250" step="1" value="130" id="sensSlider" class="w-full" style="display:block;width:100%;">
                            <m3e-slider-thumb></m3e-slider-thumb>
                        </m3e-slider>
                    </div>
                    <div>
                        <div class="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                            <span>Сглаживание</span>
                            <span id="smoothVal">50%</span>
                        </div>
                        <m3e-slider min="0" max="95" step="1" value="50" id="smoothSlider" class="w-full" style="display:block;width:100%;">
                            <m3e-slider-thumb></m3e-slider-thumb>
                        </m3e-slider>
                    </div>
                </div>
                <!-- ... Кнопки запуска ... -->
                <div class="flex items-center gap-4 w-full">
                    <m3e-segmented-button id="srcSelect" class="flex-1">
                        <m3e-button-segment value="mic" checked icon="mic">Микрофон</m3e-button-segment>
                        <m3e-button-segment value="sys" icon="computer">Система</m3e-button-segment>
                    </m3e-segmented-button>
                </div>

                <div class="flex items-center gap-3 bg-surface-container px-4 py-2 rounded-xl border border-white/5">
                    <m3e-switch id="simSwitch"></m3e-switch>
                    <label for="simSwitch" class="text-sm cursor-pointer select-none">Только визуализация (без лампы)</label>
                </div>
                
                <div class="flex gap-4 w-full mt-2">
                    <m3e-fab variant="primary-container" extended size="large" id="btnStart" class="flex-1 w-full">
                        <m3e-icon slot="icon" name="play_arrow"></m3e-icon>
                        <span slot="label">Запустить</span>
                    </m3e-fab>

                    <m3e-fab variant="tertiary-container" extended size="large" id="btnStop" class="flex-1 w-full hidden">
                        <m3e-icon slot="icon" name="stop"></m3e-icon>
                        <span slot="label">Остановить</span>
                    </m3e-fab>
                </div>
            </div>
        `;
        
        root.appendChild(container);
        this.canvas = container.querySelector('#visCanvas');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // ... (Listeners те же, но берем value из event.target.value для M3E slider в этом контексте)
        // Для слайдеров M3E в shadow DOM иногда value надо брать через detail или само свойство
        container.querySelector('#sensSlider')?.addEventListener('input', (e: any) => {
            // M3E Slider emits input event, target has value
            this.sensitivity = parseInt(e.target.value); 
            document.getElementById('sensVal')!.innerText = e.target.value;
        });
        
        container.querySelector('#smoothSlider')?.addEventListener('input', (e: any) => {
            this.smoothing = parseInt(e.target.value) / 100;
            document.getElementById('smoothVal')!.innerText = e.target.value + '%';
        });
        
        // ... (Остальной код запуска/стопа без изменений)
        const segBtn = container.querySelector('#srcSelect');
        segBtn?.addEventListener('change', () => {
            const segments = Array.from(segBtn.querySelectorAll('m3e-button-segment')) as any[];
            const selected = segments.find(s => s.checked);
            if(selected) this.audioSourceType = selected.value;
        });

        container.querySelector('#simSwitch')?.addEventListener('change', (e: any) => {
            this.isSimulation = e.target.checked;
        });

        container.querySelector('#btnStart')?.addEventListener('click', () => this.start());
        container.querySelector('#btnStop')?.addEventListener('click', () => this.stop());
    }

    resizeCanvas() {
        if(this.canvas) {
            const rect = this.canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                this.canvas.width = rect.width;
                this.canvas.height = rect.height;
                this.ctx = this.canvas.getContext('2d');
            }
        }
    }

    // ... start() / stop() / loop() ...
    // В loop() используем this.throttledSend вместо прямого fetch
    // ...
    async start() {
        try {
            const ip = localStorage.getItem('bulb_ip');
            if(!ip && !this.isSimulation) return alert("Нет IP лампы");

            if (!this.isSimulation) {
                await fetch(`/api/music/start?ip=${ip}`);
            }

            let stream;
            if (this.audioSourceType === 'mic') {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } else {
                stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
            }
            
            this.audioCtx = new AudioContext();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = this.smoothing;
            this.source = this.audioCtx.createMediaStreamSource(stream);
            this.source.connect(this.analyser);
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.active = true;

            document.querySelector('#btnStart')?.classList.add('hidden');
            document.querySelector('#btnStop')?.classList.remove('hidden');
            
            this.loop();
        } catch(e: any) {
            alert("Ошибка: " + e.message);
        }
    }

    stop() {
        this.active = false;
        this.source?.disconnect();
        this.audioCtx?.close();
        
        document.querySelector('#btnStart')?.classList.remove('hidden');
        document.querySelector('#btnStop')?.classList.add('hidden');
        if(this.ctx && this.canvas) this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    }

    loop() {
        if(!this.active || !this.analyser) return;
        requestAnimationFrame(() => this.loop());
        
        this.analyser.smoothingTimeConstant = this.smoothing;
        this.analyser.getByteFrequencyData(this.dataArray!);
        
        const w = this.canvas!.width;
        const h = this.canvas!.height;
        this.ctx!.fillStyle = '#000';
        this.ctx!.fillRect(0, 0, w, h);

        const thresholdY = h - (this.sensitivity / 255) * h;
        this.ctx!.beginPath();
        this.ctx!.moveTo(0, thresholdY);
        this.ctx!.lineTo(w, thresholdY);
        this.ctx!.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx!.lineWidth = 1;
        this.ctx!.setLineDash([5, 5]);
        this.ctx!.stroke();
        this.ctx!.setLineDash([]);

        const barWidth = (w / this.dataArray!.length) * 2.5;
        let x = 0;
        let totalBass = 0;

        for(let i = 0; i < this.dataArray!.length; i++) {
            const val = this.dataArray![i];
            const barHeight = (val / 255) * h;
            if (i < 4) totalBass += val;

            const hue = i * 4 + 260; 
            if (val > this.sensitivity) {
                this.ctx!.fillStyle = '#fff';
            } else {
                this.ctx!.fillStyle = `hsl(${hue}, 80%, 60%)`;
            }
            this.ctx!.fillRect(x, h - barHeight, barWidth - 1, barHeight);
            x += barWidth;
        }

        const avgBass = totalBass / 4;
        const bassNode = document.getElementById('debugBass');
        const sentNode = document.getElementById('debugSent');
        
        if(bassNode) bassNode.innerText = Math.floor(avgBass).toString();

        if(avgBass > this.sensitivity) {
             const range = 255 - this.sensitivity;
             const val = avgBass - this.sensitivity;
             const bri = Math.min(100, Math.floor((val / range) * 100) + 10);
             
             if (this.isSimulation) {
                 if(sentNode) {
                     sentNode.innerText = `SIM: Bri ${bri}%`;
                     sentNode.className = "text-green-400 font-bold";
                 }
             } else {
                 const ip = localStorage.getItem('bulb_ip');
                 if(ip) {
                     // USE THROTTLE
                     this.throttledSend(ip, bri);
                     
                     if(sentNode) {
                         sentNode.innerText = `SENT: Bri ${bri}%`;
                         sentNode.className = "text-primary font-bold";
                     }
                 }
             }
        } else {
            if(sentNode) {
                sentNode.innerText = "--"; 
                sentNode.className = "text-gray-600";
            }
        }
    }
}