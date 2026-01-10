export class MusicView {
    private active = false;
    private audioCtx: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private audioSourceType: 'mic' | 'sys' = 'mic';

    constructor(root: HTMLElement) {
        const container = document.createElement('div');
        container.className = "flex flex-col items-center h-full gap-8 pt-10 animate-fade-in w-full max-w-3xl mx-auto";
        
        container.innerHTML = `
            <!-- Visualizer -->
            <m3e-card variant="outlined" class="!p-0 overflow-hidden w-full aspect-video relative bg-black border-white/10 rounded-3xl">
                 <canvas id="visCanvas" class="w-full h-full opacity-80"></canvas>
                 <div class="absolute top-4 left-4 text-[10px] font-mono opacity-40 leading-tight pointer-events-none">
                    <div>DEBUG STREAM</div>
                    <div>BASS LEVEL: <span id="debugBass" class="text-primary font-bold">0</span></div>
                 </div>
            </m3e-card>

            <!-- Controls -->
            <div class="w-full max-w-md flex flex-col gap-8 items-center">
                
                <!-- Source Selector (Segmented Button) -->
                <!-- Класс w-full растянет его -->
                <m3e-segmented-button id="srcSelect" class="w-full">
                    <m3e-button-segment value="mic" checked icon="mic">Микрофон</m3e-button-segment>
                    <m3e-button-segment value="sys" icon="computer">Система</m3e-button-segment>
                </m3e-segmented-button>
                
                <div class="flex gap-4 w-full">
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
        if(this.canvas) {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            this.ctx = this.canvas.getContext('2d');
        }

        const segBtn = container.querySelector('#srcSelect');
        segBtn?.addEventListener('change', (e: any) => {
            const segments = Array.from(segBtn.querySelectorAll('m3e-button-segment')) as any[];
            const selected = segments.find(s => s.checked);
            if(selected) this.audioSourceType = selected.value;
        });

        container.querySelector('#btnStart')?.addEventListener('click', () => this.start());
        container.querySelector('#btnStop')?.addEventListener('click', () => this.stop());
    }

    async start() {
        try {
            const ip = localStorage.getItem('bulb_ip');
            if(!ip) return alert("Нет IP лампы");

            await fetch(`/api/music/start?ip=${ip}`);

            let stream;
            if (this.audioSourceType === 'mic') {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } else {
                stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
            }
            
            this.audioCtx = new AudioContext();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 128;
            this.source = this.audioCtx.createMediaStreamSource(stream);
            this.source.connect(this.analyser);
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.active = true;

            document.querySelector('#btnStart')?.classList.add('hidden');
            document.querySelector('#btnStop')?.classList.remove('hidden');
            
            this.loop();
        } catch(e: any) {
            alert("Ошибка аудио: " + e.message);
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
        
        this.analyser.getByteFrequencyData(this.dataArray!);
        
        const w = this.canvas!.width;
        const h = this.canvas!.height;
        this.ctx!.fillStyle = '#000';
        this.ctx!.fillRect(0, 0, w, h);

        const barWidth = (w / this.dataArray!.length) * 2;
        let x = 0;
        let totalBass = 0;

        for(let i = 0; i < this.dataArray!.length; i++) {
            const val = this.dataArray![i];
            const barHeight = (val / 255) * h;
            if (i < 4) totalBass += val;
            const hue = i * 2 + 250;
            this.ctx!.fillStyle = `hsl(${hue}, 100%, 70%)`;
            this.ctx!.fillRect(x, h - barHeight, barWidth - 1, barHeight);
            x += barWidth;
        }

        const avgBass = totalBass / 4;
        const bassNode = document.getElementById('debugBass');
        if(bassNode) bassNode.innerText = Math.floor(avgBass).toString();

        if(avgBass > 140) {
             const bri = Math.min(100, Math.floor(((avgBass - 140) / 115) * 100));
             const ip = localStorage.getItem('bulb_ip');
             if(ip) fetch(`/api/music/update?ip=${ip}&bri=${bri}`).catch(()=>{});
        }
    }
}