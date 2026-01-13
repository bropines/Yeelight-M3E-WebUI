import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDevice } from '../context/DeviceContext';
import { throttle } from '../utils/throttle';

// Helpers
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

interface MusicParams {
    sensitivity: number;
    smoothing: number; // 0-1
    freqRange: [number, number];
    fftSize: number;
    audioSourceType: 'mic' | 'sys';
    isSimulation: boolean;
    colorMode: 'static' | 'sync' | 'rainbow';
    hueOffset: number;
    hueDensity: number;
}

const DEFAULT_PARAMS: MusicParams = {
    sensitivity: 130,
    smoothing: 0.5,
    freqRange: [0, 30],
    fftSize: 256,
    audioSourceType: 'mic',
    isSimulation: false,
    colorMode: 'static',
    hueOffset: 260,
    hueDensity: 60
};

export const MusicPage: React.FC = () => {
    const { ip } = useDevice();
    const [params, setParams] = useState<MusicParams>(DEFAULT_PARAMS);
    const [isActive, setIsActive] = useState(false);

    // Audio Context Refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const reqIdRef = useRef<number | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);

    // Canvas Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Refs for sliders
    const freqSliderRef = useRef<any>(null);
    const sensSliderRef = useRef<any>(null);
    const smoothSliderRef = useRef<any>(null);
    const hueOffSliderRef = useRef<any>(null);
    const hueDenSliderRef = useRef<any>(null);
    const fftSliderRef = useRef<any>(null);

    // Helper to attach slider listeners
    const useSlider = (ref: any, callback: (val: any, target: any) => void) => {
        useEffect(() => {
            const el = ref.current;
            if(!el) return;
            const handler = (e: any) => callback(e.target.value, e.target);
            el.addEventListener('input', handler);
            // also listen for change if needed, but input is usually enough for m3e
            el.addEventListener('change', handler);
            return () => {
                el.removeEventListener('input', handler);
                el.removeEventListener('change', handler);
            };
        }, []);
    };

    useSlider(freqSliderRef, (val, target) => {
        // Range slider logic if needed, or simple value
        // M3E slider with two thumbs? It's complex. Let's assume standard behavior or custom logic
        const thumbs = Array.from(target.querySelectorAll('m3e-slider-thumb')) as any[];
        if(thumbs.length >= 2) {
            const v1 = parseInt(thumbs[0].value);
            const v2 = parseInt(thumbs[1].value);
            setParams(p => ({...p, freqRange: [Math.min(v1, v2), Math.max(v1, v2)]}));
        }
    });

    useSlider(sensSliderRef, (val) => setParams(p => ({...p, sensitivity: parseInt(val)})));
    useSlider(smoothSliderRef, (val) => setParams(p => ({...p, smoothing: parseInt(val)/100})));
    useSlider(hueOffSliderRef, (val) => setParams(p => ({...p, hueOffset: parseInt(val)})));
    useSlider(hueDenSliderRef, (val) => setParams(p => ({...p, hueDensity: parseInt(val)})));
    useSlider(fftSliderRef, (val) => {
        const map = [64, 128, 256, 512, 1024, 2048];
        setParams(p => ({...p, fftSize: map[parseInt(val)]}));
    });


    // Throttled Sender
    const sendToLamp = useCallback(throttle((targetIp: string, bri: number, color: number | null) => {
        let url = `/api/music/update?ip=${targetIp}&bri=${bri}`;
        if (color !== null) url += `&color=${color}`;
        fetch(url).catch(()=>{});
    }, 80), []);

    // Update Analyser when params change
    useEffect(() => {
        if (analyserRef.current) {
            analyserRef.current.smoothingTimeConstant = params.smoothing;
            if (analyserRef.current.fftSize !== params.fftSize) {
                analyserRef.current.fftSize = params.fftSize;
                dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
            }
        }
    }, [params.smoothing, params.fftSize]);

    // Main Loop
    const loop = useCallback(() => {
        if (!isActive || !analyserRef.current || !dataArrayRef.current) return;

        reqIdRef.current = requestAnimationFrame(loop);

        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;
        const p = params;

        analyser.getByteFrequencyData(dataArray);

        const totalBins = dataArray.length;
        const startBin = Math.floor((p.freqRange[0] / 100) * totalBins);
        const endBin = Math.floor((p.freqRange[1] / 100) * totalBins);

        let totalRangeVol = 0;
        let countRange = 0;
        let dominantBinIndex = -1;
        let maxVal = 0;

        for(let i = 0; i < totalBins; i++) {
            const val = dataArray[i];
            if (i >= startBin && i <= endBin) {
                totalRangeVol += val;
                countRange++;
                if (val > maxVal && val > p.sensitivity) {
                    maxVal = val;
                    dominantBinIndex = i;
                }
            }
        }

        const avgVol = countRange > 0 ? totalRangeVol / countRange : 0;

        if(avgVol > p.sensitivity) {
             const range = 255 - p.sensitivity;
             const val = avgVol - p.sensitivity;
             const bri = Math.min(100, Math.floor((val / range) * 90) + 10);

             let colorInt: number | null = null;

             if (p.colorMode === 'sync' && dominantBinIndex !== -1) {
                 const relIndex = dominantBinIndex / totalBins;
                 const hue = (p.hueOffset + (relIndex * p.hueDensity)) % 360;
                 colorInt = hslToRgbInt(hue, 100, 50);
             }
             else if (p.colorMode === 'rainbow') {
                 const hue = (Date.now() / 20) % 360;
                 colorInt = hslToRgbInt(hue, 100, 50);
             }

             if (!p.isSimulation && ip) {
                 sendToLamp(ip, bri, colorInt);
             }
        }

        drawCanvas(dataArray, avgVol, dominantBinIndex);

    }, [isActive, params, ip, sendToLamp]);

    useEffect(() => {
        if (isActive) {
            reqIdRef.current = requestAnimationFrame(loop);
        } else {
            if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
        }
        return () => {
            if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
        };
    }, [isActive, loop]);

    const drawCanvas = (dataArray: Uint8Array, avgVol: number, dominantBinIndex: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const p = params;
        const w = canvas.width;
        const h = canvas.height;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // Threshold
        const thresholdY = h - (p.sensitivity / 255) * h;
        ctx.beginPath();
        ctx.moveTo(0, thresholdY);
        ctx.lineTo(w, thresholdY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Range BG
        const startX = (p.freqRange[0] / 100) * w;
        const endX = (p.freqRange[1] / 100) * w;

        const bgGrad = ctx.createLinearGradient(0, 0, w, 0);
        bgGrad.addColorStop(0, `hsl(${p.hueOffset}, 80%, 20%)`);
        bgGrad.addColorStop(1, `hsl(${(p.hueOffset + p.hueDensity)%360}, 80%, 20%)`);

        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        ctx.fillRect(startX, 0, endX - startX, h);

        const totalBins = dataArray.length;
        const startBin = Math.floor((p.freqRange[0] / 100) * totalBins);
        const endBin = Math.floor((p.freqRange[1] / 100) * totalBins);
        const barWidth = w / totalBins;

        for(let i = 0; i < totalBins; i++) {
            const val = dataArray[i];
            const barHeight = (val / 255) * h;
            const x = i * barWidth;
            const isActiveFreq = i >= startBin && i <= endBin;
            const relIndex = i / totalBins;
            const hue = (p.hueOffset + (relIndex * p.hueDensity)) % 360;

            if (isActiveFreq) {
                if (val > p.sensitivity) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
                } else {
                    ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
                    ctx.shadowBlur = 0;
                }
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.shadowBlur = 0;
            }

            const drawWidth = Math.max(0.5, barWidth - 1);
            ctx.fillRect(x, h - barHeight, drawWidth, barHeight);
        }
        ctx.shadowBlur = 0;

        // Manual DOM updates
        const bassNode = document.getElementById('dbg_bass');
        if(bassNode) bassNode.innerText = Math.floor(avgVol).toString();

        const sentEl = document.getElementById('dbg_sent');
        if(sentEl) {
             if (avgVol > p.sensitivity) {
                sentEl.innerText = p.isSimulation ? 'SIM' : `SENT (${p.colorMode})`;
                sentEl.className = "text-primary font-bold";
            } else {
                sentEl.innerText = "--";
                sentEl.className = "text-gray-400";
            }
        }
    };

    const handleStart = async () => {
        try {
            if(!ip && !params.isSimulation) return alert("Нет IP лампы");
            if (!params.isSimulation) await fetch(`/api/music/start?ip=${ip}`);

            if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
                const stream = params.audioSourceType === 'mic'
                    ? await navigator.mediaDevices.getUserMedia({ audio: true })
                    : await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });

                audioCtxRef.current = new AudioContext();
                analyserRef.current = audioCtxRef.current.createAnalyser();
                analyserRef.current.fftSize = params.fftSize;
                analyserRef.current.smoothingTimeConstant = params.smoothing;

                sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);
                sourceRef.current.connect(analyserRef.current);

                dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
            }
            setIsActive(true);
        } catch (e: any) {
            alert("Error: " + e.message);
        }
    };

    const handleStop = () => {
        setIsActive(false);
        if (sourceRef.current) sourceRef.current.disconnect();
        if (audioCtxRef.current) audioCtxRef.current.close();
        audioCtxRef.current = null;
    };

    // Canvas resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if(canvas && canvas.parentElement) {
                const rect = canvas.parentElement.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                const ctx = canvas.getContext('2d');
                if(ctx) ctx.scale(dpr, dpr);
            }
        };
        setTimeout(handleResize, 100);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const updateParam = (key: keyof MusicParams, val: any) => {
        setParams(prev => ({...prev, [key]: val}));
    };

    return (
        <div className="flex flex-col items-center h-full gap-6 pt-6 animate-fade-in w-full px-4 md:px-8 pb-24 md:pb-0 overflow-hidden">
             {/* CANVAS */}
            <m3e-card variant="outlined" className="!p-0 w-full h-60 relative bg-black border-white/10 rounded-3xl shadow-2xl shrink-0 overflow-hidden">
                 <canvas ref={canvasRef} className="w-full h-full opacity-100"></canvas>
                 <div className="absolute top-4 left-4 text-[10px] font-mono opacity-80 leading-tight pointer-events-none z-10 mix-blend-difference">
                    <div className="text-primary font-bold mb-1">STREAM INFO</div>
                    <div>VOL: <span id="dbg_bass">0</span></div>
                    <div>BINS: <span id="dbg_bins">{params.fftSize/2}</span></div>
                    <div>CMD: <span id="dbg_sent" className="text-gray-400">--</span></div>
                 </div>
            </m3e-card>

            <div className="w-full flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
                     {/* COLUMN 1 */}
                    <div className="bg-surface-container-low p-5 rounded-2xl border border-white/5 flex flex-col gap-6 h-fit">
                         {/* Freq Range */}
                         <div>
                            <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                                <span>Триггер диапазон</span>
                                <span className="text-primary">{params.freqRange[0]}% - {params.freqRange[1]}%</span>
                            </div>
                            <div className="w-full overflow-hidden">
                                <m3e-slider
                                    ref={freqSliderRef}
                                    min="0" max="100" step="1" className="w-full block"
                                >
                                    <m3e-slider-thumb value={params.freqRange[0]}></m3e-slider-thumb>
                                    <m3e-slider-thumb value={params.freqRange[1]}></m3e-slider-thumb>
                                </m3e-slider>
                            </div>
                        </div>

                        {/* Sensitivity & Smoothing */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                                    <span>Порог</span>
                                    <span>{params.sensitivity}</span>
                                </div>
                                <div className="w-full overflow-hidden">
                                    <m3e-slider ref={sensSliderRef} min="1" max="250" step="1" value={params.sensitivity} className="w-full block">
                                        <m3e-slider-thumb value={params.sensitivity}></m3e-slider-thumb>
                                    </m3e-slider>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                                    <span>Сглаж.</span>
                                    <span>{Math.round(params.smoothing * 100)}%</span>
                                </div>
                                <div className="w-full overflow-hidden">
                                    <m3e-slider ref={smoothSliderRef} min="0" max="95" step="1" value={params.smoothing * 100} className="w-full block">
                                        <m3e-slider-thumb value={params.smoothing * 100}></m3e-slider-thumb>
                                    </m3e-slider>
                                </div>
                            </div>
                        </div>

                         {/* Hue Config */}
                        <div>
                            <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                                <span>Настройка Спектра</span>
                            </div>
                            <div className="flex flex-col gap-4 bg-black/20 p-3 rounded-xl">
                                <div>
                                    <div className="flex justify-between text-[10px] uppercase opacity-50 mb-1">
                                        <span>Смещение цвета</span>
                                        <span>{params.hueOffset}°</span>
                                    </div>
                                    <div className="w-full overflow-hidden">
                                        <m3e-slider ref={hueOffSliderRef} min="0" max="360" step="1" value={params.hueOffset} className="w-full block">
                                            <m3e-slider-thumb value={params.hueOffset}></m3e-slider-thumb>
                                        </m3e-slider>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] uppercase opacity-50 mb-1">
                                        <span>Плотность спектра</span>
                                        <span>{params.hueDensity}°</span>
                                    </div>
                                    <div className="w-full overflow-hidden">
                                        <m3e-slider ref={hueDenSliderRef} min="0" max="360" step="5" value={params.hueDensity} className="w-full block">
                                            <m3e-slider-thumb value={params.hueDensity}></m3e-slider-thumb>
                                        </m3e-slider>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 2 */}
                    <div className="flex flex-col gap-4 h-fit">
                        {/* Mode */}
                        <div className="bg-surface-container-low p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                            <span className="text-xs font-bold uppercase text-gray-500">Режим работы</span>
                            <m3e-segmented-button className="w-full"
                                ref={(el: any) => {
                                    if(el) {
                                        el.onchange = (e: any) => {
                                            const segments = Array.from(e.target.querySelectorAll('m3e-button-segment')) as any[];
                                            const sel = segments.find(s => s.checked);
                                            if(sel) updateParam('colorMode', sel.value);
                                        };
                                    }
                                }}
                            >
                                <m3e-button-segment value="static" selected={params.colorMode === 'static' ? '' : undefined}>Статичный</m3e-button-segment>
                                <m3e-button-segment value="sync" selected={params.colorMode === 'sync' ? '' : undefined}>Спектр</m3e-button-segment>
                                <m3e-button-segment value="rainbow" selected={params.colorMode === 'rainbow' ? '' : undefined}>Радуга</m3e-button-segment>
                            </m3e-segmented-button>
                        </div>

                        {/* Source & Sim */}
                        <div className="flex gap-4">
                            <div className="bg-surface-container-low p-1 rounded-2xl border border-white/5 flex-1">
                                <m3e-segmented-button className="w-full"
                                    ref={(el: any) => {
                                        if(el) {
                                            el.onchange = (e: any) => {
                                                const segments = Array.from(e.target.querySelectorAll('m3e-button-segment')) as any[];
                                                const sel = segments.find(s => s.checked);
                                                if(sel) updateParam('audioSourceType', sel.value);
                                            };
                                        }
                                    }}
                                >
                                    <m3e-button-segment value="mic" selected={params.audioSourceType === 'mic' ? '' : undefined} icon="mic">Мик</m3e-button-segment>
                                    <m3e-button-segment value="sys" selected={params.audioSourceType === 'sys' ? '' : undefined} icon="computer">ПК</m3e-button-segment>
                                </m3e-segmented-button>
                            </div>
                            <div className="bg-surface-container-low px-4 rounded-2xl border border-white/5 flex items-center justify-center">
                                <m3e-switch title="Только визуал" icons="selected"
                                     ref={(el: any) => {
                                         if(el) {
                                             el.selected = params.isSimulation;
                                             el.onchange = (e: any) => updateParam('isSimulation', e.target.selected);
                                         }
                                     }}
                                ></m3e-switch>
                            </div>
                        </div>

                         {/* FFT & Start */}
                        <div className="mt-auto pt-2 flex flex-col gap-4">
                            <div className="flex items-center gap-2 px-2">
                                <span className="text-[10px] font-bold uppercase text-gray-500">Детализация:</span>
                                <div className="w-full overflow-hidden flex-1">
                                    <m3e-slider
                                        ref={fftSliderRef}
                                        min="0" max="5" step="1" value={Math.log2(params.fftSize) - 6} discrete className="block w-full"
                                    >
                                        <m3e-slider-thumb></m3e-slider-thumb>
                                    </m3e-slider>
                                </div>
                                <span className="text-[10px] font-bold text-primary w-8 text-right">{params.fftSize / 2}</span>
                            </div>

                            <div className="relative h-14">
                                {!isActive && (
                                    <m3e-fab variant="primary-container" extended size="large" className="w-full absolute inset-0" onClick={handleStart}>
                                        <m3e-icon slot="icon" name="play_arrow"></m3e-icon>
                                        <span slot="label" className="font-bold text-lg">ЗАПУСТИТЬ</span>
                                    </m3e-fab>
                                )}
                                {isActive && (
                                    <m3e-fab variant="tertiary-container" extended size="large" className="w-full absolute inset-0" onClick={handleStop}>
                                        <m3e-icon slot="icon" name="stop"></m3e-icon>
                                        <span slot="label" className="font-bold text-lg">ОСТАНОВИТЬ</span>
                                    </m3e-fab>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
