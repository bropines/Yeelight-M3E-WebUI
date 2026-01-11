import { throttle } from '../utils/throttle';

// Хелпер: HSL -> RGB Int
function hslToRgbInt(h: number, s: number, l: number): number {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const r = Math.round(f(0) * 255);
    const g = Math.round(f(8) * 255);
    const b = Math.round(f(4) * 255);
    return (r << 16) + (g << 8) + b;
}

export class MusicView {
    // --- STATIC STATE (Глобальный движок) ---
    private static active = false;
    private static audioCtx: AudioContext | null = null;
    private static analyser: AnalyserNode | null = null;
    private static source: MediaStreamAudioSourceNode | null = null;
    private static dataArray: Uint8Array | null = null;
    
    // Ссылка на текущий открытый UI (для отрисовки)
    private static uiInstance: MusicView | null = null;

    // Настройки
    private static params = {
        sensitivity: 130,
        smoothing: 0.5,
        freqRange: [0, 30],
        fftSize: 256,
        audioSourceType: 'mic' as 'mic' | 'sys',
        isSimulation: false,
        colorMode: 'static' as 'static' | 'sync' | 'rainbow',
        // Новые параметры цвета
        hueOffset: 260,   // Начальный цвет (градусы 0-360)
        hueDensity: 60    // Ширина спектра (градусы 0-360)
    };

    // Throttled Sender (статический, чтобы не пересоздавать)
    private static sendToLamp = throttle((ip: string, bri: number, color: number | null) => {
        let url = `/api/music/update?ip=${ip}&bri=${bri}`;
        if (color !== null) url += `&color=${color}`;
        fetch(url).catch(()=>{});
    }, 80);

    // Локальные поля UI
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private rainbowHue = 0;

    constructor(root: HTMLElement) {
        MusicView.uiInstance = this; // Регестрируем себя как активный UI

        const p = MusicView.params;

        const container = document.createElement('div');
        container.className = "flex flex-col items-center h-full gap-6 pt-6 animate-fade-in w-full px-4 md:px-8 pb-24 md:pb-0 overflow-hidden";
        
        container.innerHTML = `
            <!-- CANVAS -->
            <m3e-card variant="outlined" class="!p-0 w-full h-60 relative bg-black border-white/10 rounded-3xl shadow-2xl shrink-0 overflow-hidden">
                 <canvas id="visCanvas" class="w-full h-full opacity-100"></canvas>
                 <div class="absolute top-4 left-4 text-[10px] font-mono opacity-80 leading-tight pointer-events-none z-10 mix-blend-difference">
                    <div class="text-primary font-bold mb-1">STREAM INFO</div>
                    <div>VOL: <span id="debugBass">0</span></div>
                    <div>BINS: <span id="debugBins">${p.fftSize/2}</span></div>
                    <div>CMD: <span id="debugSent" class="text-gray-400">--</span></div>
                 </div>
            </m3e-card>

            <!-- CONTROLS -->
            <div class="w-full flex-1 overflow-y-auto custom-scrollbar">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
                    
                    <!-- COLUMN 1: Audio Settings -->
                    <div class="bg-surface-container-low p-5 rounded-2xl border border-white/5 flex flex-col gap-6 h-fit">
                        
                        <!-- Range -->
                        <div>
                            <div class="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                                <span>Триггер диапазон</span>
                                <span id="freqVal" class="text-primary">${p.freqRange[0]}% - ${p.freqRange[1]}%</span>
                            </div>
                            <m3e-slider min="0" max="100" step="1" id="freqSlider" class="w-full" style="display:block;width:100%;">
                                <m3e-slider-thumb value="${p.freqRange[0]}"></m3e-slider-thumb>
                                <m3e-slider-thumb value="${p.freqRange[1]}"></m3e-slider-thumb>
                            </m3e-slider>
                        </div>

                        <!-- Sensitivity & Smoothing -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <div class="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                                    <span>Порог</span>
                                    <span id="sensVal">${p.sensitivity}</span>
                                </div>
                                <m3e-slider min="1" max="250" step="1" value="${p.sensitivity}" id="sensSlider" class="w-full" style="display:block;width:100%;">
                                    <m3e-slider-thumb></m3e-slider-thumb>
                                </m3e-slider>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                                    <span>Сглаж.</span>
                                    <span id="smoothVal">${Math.round(p.smoothing * 100)}%</span>
                                </div>
                                <m3e-slider min="0" max="95" step="1" value="${p.smoothing * 100}" id="smoothSlider" class="w-full" style="display:block;width:100%;">
                                    <m3e-slider-thumb></m3e-slider-thumb>
                                </m3e-slider>
                            </div>
                        </div>

                        <!-- Color Config (New) -->
                        <div>
                            <div class="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                                <span>Настройка Спектра</span>
                            </div>
                            <div class="flex flex-col gap-4 bg-black/20 p-3 rounded-xl">
                                <div>
                                    <div class="flex justify-between text-[10px] uppercase opacity-50 mb-1">
                                        <span>Смещение цвета</span>
                                        <span id="hueOffVal">${p.hueOffset}°</span>
                                    </div>
                                    <m3e-slider min="0" max="360" step="1" value="${p.hueOffset}" id="hueOffSlider" class="w-full" style="display:block;width:100%;">
                                        <m3e-slider-thumb></m3e-slider-thumb>
                                    </m3e-slider>
                                </div>
                                <div>
                                    <div class="flex justify-between text-[10px] uppercase opacity-50 mb-1">
                                        <span>Плотность спектра</span>
                                        <span id="hueDenVal">${p.hueDensity}°</span>
                                    </div>
                                    <m3e-slider min="0" max="360" step="5" value="${p.hueDensity}" id="hueDenSlider" class="w-full" style="display:block;width:100%;">
                                        <m3e-slider-thumb></m3e-slider-thumb>
                                    </m3e-slider>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- COLUMN 2 -->
                    <div class="flex flex-col gap-4 h-fit">
                        
                        <!-- Mode -->
                        <div class="bg-surface-container-low p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                            <span class="text-xs font-bold uppercase text-gray-500">Режим работы</span>
                            <m3e-segmented-button id="colorModeSelect" class="w-full">
                                <m3e-button-segment value="static" ${p.colorMode === 'static' ? 'checked' : ''}>Статичный</m3e-button-segment>
                                <m3e-button-segment value="sync" ${p.colorMode === 'sync' ? 'checked' : ''}>Спектр</m3e-button-segment>
                                <m3e-button-segment value="rainbow" ${p.colorMode === 'rainbow' ? 'checked' : ''}>Радуга</m3e-button-segment>
                            </m3e-segmented-button>
                        </div>

                        <!-- Source & Sim -->
                        <div class="flex gap-4">
                            <div class="bg-surface-container-low p-1 rounded-2xl border border-white/5 flex-1">
                                <m3e-segmented-button id="srcSelect" class="w-full">
                                    <m3e-button-segment value="mic" ${p.audioSourceType === 'mic' ? 'checked' : ''} icon="mic">Мик</m3e-button-segment>
                                    <m3e-button-segment value="sys" ${p.audioSourceType === 'sys' ? 'checked' : ''} icon="computer">ПК</m3e-button-segment>
                                </m3e-segmented-button>
                            </div>
                            <div class="bg-surface-container-low px-4 rounded-2xl border border-white/5 flex items-center justify-center">
                                <m3e-switch id="simSwitch" ${p.isSimulation ? 'checked' : ''} icons="selected" title="Только визуал"></m3e-switch>
                            </div>
                        </div>

                        <!-- FFT & Start -->
                        <div class="mt-auto pt-2 flex flex-col gap-4">
                            <div class="flex items-center gap-2 px-2">
                                <span class="text-[10px] font-bold uppercase text-gray-500">Детализация:</span>
                                <m3e-slider min="0" max="5" step="1" value="${Math.log2(p.fftSize) - 6}" id="fftSlider" discrete class="flex-1" style="display:block;">
                                    <m3e-slider-thumb></m3e-slider-thumb>
                                </m3e-slider>
                                <span class="text-[10px] font-bold text-primary w-8 text-right" id="fftVal">${p.fftSize / 2}</span>
                            </div>

                            <div class="relative h-14">
                                <m3e-fab variant="primary-container" extended size="large" id="btnStart" class="w-full absolute inset-0 ${MusicView.active ? 'hidden' : ''}">
                                    <m3e-icon slot="icon" name="play_arrow"></m3e-icon>
                                    <span slot="label" class="font-bold text-lg">ЗАПУСТИТЬ</span>
                                </m3e-fab>

                                <m3e-fab variant="tertiary-container" extended size="large" id="btnStop" class="w-full absolute inset-0 ${!MusicView.active ? 'hidden' : ''}">
                                    <m3e-icon slot="icon" name="stop"></m3e-icon>
                                    <span slot="label" class="font-bold text-lg">ОСТАНОВИТЬ</span>
                                </m3e-fab>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;
        
        root.appendChild(container);
        this.canvas = container.querySelector('#visCanvas');
        
        setTimeout(() => this.resizeCanvas(), 0);
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Listeners
        this.initListeners(container);
    }

    // --- UI LISTENERS ---
    initListeners(container: HTMLElement) {
        const p = MusicView.params;

        // Color Mode
        const colorModeBtn = container.querySelector('#colorModeSelect');
        colorModeBtn?.addEventListener('change', () => {
            const segments = Array.from(colorModeBtn.querySelectorAll('m3e-button-segment')) as any[];
            const selected = segments.find(s => s.checked);
            if(selected) p.colorMode = selected.value;
        });

        // Hue Sliders
        container.querySelector('#hueOffSlider')?.addEventListener('input', (e: any) => {
            p.hueOffset = parseInt(e.target.value);
            document.getElementById('hueOffVal')!.innerText = e.target.value + '°';
        });
        container.querySelector('#hueDenSlider')?.addEventListener('input', (e: any) => {
            p.hueDensity = parseInt(e.target.value);
            document.getElementById('hueDenVal')!.innerText = e.target.value + '°';
        });

        // Range
        const freqSlider = container.querySelector('#freqSlider');
        freqSlider?.addEventListener('input', () => {
            const thumbs = Array.from(freqSlider.querySelectorAll('m3e-slider-thumb')) as any[];
            p.freqRange = [Math.min(parseInt(thumbs[0].value), parseInt(thumbs[1].value)), Math.max(parseInt(thumbs[0].value), parseInt(thumbs[1].value))];
            document.getElementById('freqVal')!.innerText = `${p.freqRange[0]}% - ${p.freqRange[1]}%`;
        });

        // Sensitivity & Smoothing
        container.querySelector('#sensSlider')?.addEventListener('input', (e: any) => {
            p.sensitivity = parseInt(e.target.value); 
            document.getElementById('sensVal')!.innerText = e.target.value;
        });
        container.querySelector('#smoothSlider')?.addEventListener('input', (e: any) => {
            p.smoothing = parseInt(e.target.value) / 100;
            if (MusicView.analyser) MusicView.analyser.smoothingTimeConstant = p.smoothing;
            document.getElementById('smoothVal')!.innerText = e.target.value + '%';
        });

        // FFT
        container.querySelector('#fftSlider')?.addEventListener('change', (e: any) => {
            const map = [64, 128, 256, 512, 1024, 2048];
            p.fftSize = map[parseInt(e.target.value)];
            document.getElementById('fftVal')!.innerText = (p.fftSize / 2).toString();
            if (MusicView.analyser) {
                MusicView.analyser.fftSize = p.fftSize;
                MusicView.dataArray = new Uint8Array(MusicView.analyser.frequencyBinCount);
            }
        });
        
        // Source & Sim
        container.querySelector('#srcSelect')?.addEventListener('change', (e: any) => {
            const selected = Array.from(e.target.querySelectorAll('m3e-button-segment')).find((s: any) => s.checked) as any;
            if(selected) p.audioSourceType = selected.value;
        });
        container.querySelector('#simSwitch')?.addEventListener('change', (e: any) => p.isSimulation = e.target.checked);

        // Actions
        container.querySelector('#btnStart')?.addEventListener('click', () => this.start());
        container.querySelector('#btnStop')?.addEventListener('click', () => this.stop());
    }

    resizeCanvas() {
        if(this.canvas) {
            const rect = this.canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                const dpr = window.devicePixelRatio || 1;
                this.canvas.width = rect.width * dpr;
                this.canvas.height = rect.height * dpr;
                this.ctx = this.canvas.getContext('2d');
                if (this.ctx) this.ctx.scale(dpr, dpr);
            }
        }
    }

    async start() {
        const p = MusicView.params;
        try {
            const ip = localStorage.getItem('bulb_ip');
            if(!ip && !p.isSimulation) return alert("Нет IP лампы");

            if (!p.isSimulation) await fetch(`/api/music/start?ip=${ip}`);

            if (!MusicView.audioCtx || MusicView.audioCtx.state === 'closed') {
                let stream;
                if (p.audioSourceType === 'mic') {
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                } else {
                    stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
                }
                
                MusicView.audioCtx = new AudioContext();
                MusicView.analyser = MusicView.audioCtx.createAnalyser();
                MusicView.analyser.fftSize = p.fftSize;
                MusicView.analyser.smoothingTimeConstant = p.smoothing;
                MusicView.source = MusicView.audioCtx.createMediaStreamSource(stream);
                MusicView.source.connect(MusicView.analyser);
                
                MusicView.dataArray = new Uint8Array(MusicView.analyser.frequencyBinCount);
            }

            MusicView.active = true;
            this.updateButtons();
            
            // ЗАПУСК ГЛОБАЛЬНОГО ЦИКЛА
            MusicView.globalLoop();

        } catch(e: any) {
            alert("Ошибка: " + e.message);
        }
    }

    stop() {
        MusicView.active = false;
        // Отпускаем микрофон
        if (MusicView.source) MusicView.source.disconnect();
        if (MusicView.audioCtx) MusicView.audioCtx.close();
        MusicView.audioCtx = null;
        
        this.updateButtons();
        if(this.ctx && this.canvas) {
             const rect = this.canvas.parentElement!.getBoundingClientRect();
             this.ctx.clearRect(0,0, rect.width, rect.height);
        }
    }

    updateButtons() {
        document.querySelector('#btnStart')?.classList.toggle('hidden', MusicView.active);
        document.querySelector('#btnStop')?.classList.toggle('hidden', !MusicView.active);
    }

    // --- STATIC ENGINE LOOP (Работает всегда, даже при смене вкладок) ---
    private static globalLoop() {
        if (!this.active || !this.analyser) return;
        requestAnimationFrame(() => this.globalLoop());

        // 1. ANALYZE
        const p = this.params;
        this.analyser.getByteFrequencyData(this.dataArray!);

        const totalBins = this.dataArray!.length;
        const startBin = Math.floor((p.freqRange[0] / 100) * totalBins);
        const endBin = Math.floor((p.freqRange[1] / 100) * totalBins);
        
        let totalRangeVol = 0;
        let countRange = 0;
        let dominantBinIndex = -1;
        let maxVal = 0;

        for(let i = 0; i < totalBins; i++) {
            const val = this.dataArray![i];
            
            // Logic for Lamp Trigger
            if (i >= startBin && i <= endBin) {
                totalRangeVol += val;
                countRange++;
                if (val > maxVal && val > p.sensitivity) {
                    maxVal = val;
                    dominantBinIndex = i;
                }
            }
        }

        // 2. SEND TO LAMP
        const avgVol = countRange > 0 ? totalRangeVol / countRange : 0;
        
        if(avgVol > p.sensitivity) {
             const range = 255 - p.sensitivity;
             const val = avgVol - p.sensitivity;
             const bri = Math.min(100, Math.floor((val / range) * 90) + 10);
             
             let colorInt: number | null = null;

             if (p.colorMode === 'sync' && dominantBinIndex !== -1) {
                 // Рассчитываем цвет на основе настроек
                 const relIndex = dominantBinIndex / totalBins; 
                 // Hue = Offset + (Position * Density)
                 const hue = (p.hueOffset + (relIndex * p.hueDensity)) % 360;
                 colorInt = hslToRgbInt(hue, 100, 50);
             } 
             else if (p.colorMode === 'rainbow') {
                 // Авто-радуга: просто инкрементим статический счетчик (где хранить? в uiInstance или static?)
                 // Проще вычислять от времени
                 const hue = (Date.now() / 20) % 360; 
                 colorInt = hslToRgbInt(hue, 100, 50);
             }

             if (!p.isSimulation) {
                 const ip = localStorage.getItem('bulb_ip');
                 if(ip) this.sendToLamp(ip, bri, colorInt);
             }
        }

        // 3. DRAW UI (If active)
        if (this.uiInstance && this.uiInstance.ctx && document.body.contains(this.uiInstance.canvas!)) {
            this.uiInstance.drawFrame(avgVol, dominantBinIndex);
        }
    }

    // --- LOCAL DRAW FRAME ---
    drawFrame(avgVol: number, dominantBinIndex: number) {
        const p = MusicView.params;
        const rect = this.canvas!.parentElement!.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        // Clear
        this.ctx!.fillStyle = '#000000';
        this.ctx!.fillRect(0, 0, w, h);

        // Threshold Line
        const thresholdY = h - (p.sensitivity / 255) * h;
        this.ctx!.beginPath();
        this.ctx!.moveTo(0, thresholdY);
        this.ctx!.lineTo(w, thresholdY);
        this.ctx!.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx!.lineWidth = 1;
        this.ctx!.setLineDash([4, 4]);
        this.ctx!.stroke();
        this.ctx!.setLineDash([]);

        // Range BG
        const startX = (p.freqRange[0] / 100) * w;
        const endX = (p.freqRange[1] / 100) * w;
        
        // Gradient BG based on settings
        const bgGrad = this.ctx!.createLinearGradient(0, 0, w, 0);
        bgGrad.addColorStop(0, `hsl(${p.hueOffset}, 80%, 20%)`);
        bgGrad.addColorStop(1, `hsl(${(p.hueOffset + p.hueDensity)%360}, 80%, 20%)`);
        
        this.ctx!.fillStyle = 'rgba(255,255,255,0.02)';
        this.ctx!.fillRect(startX, 0, endX - startX, h);

        // Bars
        const totalBins = MusicView.dataArray!.length;
        const startBin = Math.floor((p.freqRange[0] / 100) * totalBins);
        const endBin = Math.floor((p.freqRange[1] / 100) * totalBins);
        const barWidth = w / totalBins; 

        for(let i = 0; i < totalBins; i++) {
            const val = MusicView.dataArray![i];
            const barHeight = (val / 255) * h;
            const x = i * barWidth;
            
            const isActiveFreq = i >= startBin && i <= endBin;
            
            // Hue calc based on settings
            const relIndex = i / totalBins;
            const hue = (p.hueOffset + (relIndex * p.hueDensity)) % 360;

            if (isActiveFreq) {
                if (val > p.sensitivity) {
                    this.ctx!.fillStyle = '#FFFFFF'; 
                    this.ctx!.shadowBlur = 10;
                    this.ctx!.shadowColor = `hsl(${hue}, 100%, 50%)`;
                } else {
                    this.ctx!.fillStyle = `hsl(${hue}, 90%, 60%)`;
                    this.ctx!.shadowBlur = 0;
                }
            } else {
                this.ctx!.fillStyle = 'rgba(255, 255, 255, 0.1)'; 
                this.ctx!.shadowBlur = 0;
            }

            const drawWidth = Math.max(0.5, barWidth - 1);
            this.ctx!.fillRect(x, h - barHeight, drawWidth, barHeight);
        }
        this.ctx!.shadowBlur = 0;

        // Debug Info Update
        const bassNode = document.getElementById('debugBass');
        const sentNode = document.getElementById('debugSent');
        if(bassNode) bassNode.innerText = Math.floor(avgVol).toString();
        if(sentNode) {
            if (avgVol > p.sensitivity) {
                sentNode.innerText = p.isSimulation ? 'SIM' : `SENT (${p.colorMode})`;
                sentNode.className = "text-primary font-bold";
            } else {
                sentNode.innerText = "--";
                sentNode.className = "text-gray-600";
            }
        }
    }
}