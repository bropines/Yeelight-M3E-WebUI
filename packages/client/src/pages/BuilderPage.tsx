import React, { useState, useEffect } from 'react';
import jsyaml from 'js-yaml';
import { useDevice } from '../context/DeviceContext';
import { Dialog } from '../components/Dialog';
import { ColorPicker } from '../components/ColorPicker';
import { BUILDER_CONFIG } from '@yeelight/shared';

// Types for steps
interface FlowStep {
    type: string;
    dur: number;
    bri?: number;
    val?: string;
    start?: string;
    end?: string;
}

export const BuilderPage: React.FC = () => {
    const { ip } = useDevice();
    const [steps, setSteps] = useState<FlowStep[]>([]);
    const [yamlText, setYamlText] = useState('');
    const [isLooping, setIsLooping] = useState(false);

    // Dialog State
    const [colorDialogOpen, setColorDialogOpen] = useState(false);
    const [activeEdit, setActiveEdit] = useState<{idx: number, key: string} | null>(null);
    const [pickerColor, setPickerColor] = useState('#FFFFFF');

    // Sync steps -> yaml
    useEffect(() => {
        try {
            const dump = jsyaml.dump(steps);
            setYamlText(dump);
        } catch(e) {}
    }, [steps]);

    const handleYamlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setYamlText(val);
        try {
            const parsed = jsyaml.load(val);
            if(Array.isArray(parsed)) {
                setSteps(parsed as FlowStep[]);
            }
        } catch(e) {}
    };

    const addStep = (id: string) => {
        const conf = BUILDER_CONFIG.find((c: any) => c.id === id);
        if(conf) {
            setSteps([...steps, JSON.parse(JSON.stringify(conf.defaults))]);
        }
    };

    const updateStep = (idx: number, key: string, val: any) => {
        const newSteps = [...steps];
        newSteps[idx] = { ...newSteps[idx], [key]: val };
        setSteps(newSteps);
    };

    const removeStep = (idx: number) => {
        setSteps(steps.filter((_, i) => i !== idx));
    };

    const duplicateStep = (idx: number) => {
        const newSteps = [...steps];
        newSteps.splice(idx + 1, 0, JSON.parse(JSON.stringify(steps[idx])));
        setSteps(newSteps);
    };

    const swapGradient = (idx: number) => {
         const newSteps = [...steps];
         const s = newSteps[idx];
         if(s.start && s.end) {
             const temp = s.start;
             s.start = s.end;
             s.end = temp;
             setSteps(newSteps);
         }
    };

    const openColorPicker = (idx: number, key: string, currentColor: string) => {
        setActiveEdit({ idx, key });
        setPickerColor(currentColor || '#FFFFFF');
        setColorDialogOpen(true);
    };

    const saveColor = () => {
        if (activeEdit) {
            updateStep(activeEdit.idx, activeEdit.key, pickerColor);
            setColorDialogOpen(false);
        }
    };

    const runFlow = async () => {
        if(!ip) return;
        await fetch(`/api/custom_flow?ip=${ip}`, {
            method: 'POST',
            body: JSON.stringify({
                steps: steps,
                loop: isLooping
            })
        });
    };

    const stopFlow = async () => {
        if(ip) await fetch(`/api/act?ip=${ip}&type=stop`);
    };

    return (
        <div className="flex flex-col md:flex-row h-full gap-6 animate-fade-in pb-20 md:pb-0">
             {/* LEFT: Visual Builder */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden relative">
                 {/* Toolbar */}
                 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar shrink-0">
                    {BUILDER_CONFIG.map((item: any) => (
                        <button key={item.id}
                            onClick={() => addStep(item.id)}
                            className="bg-surface-container-high border border-white/10 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition shrink-0 active:scale-95"
                        >
                            <m3e-icon name={item.icon} className={item.color}></m3e-icon>
                            <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                        </button>
                    ))}
                 </div>

                 {/* List */}
                 <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar rounded-2xl pb-4">
                    {steps.length === 0 && (
                        <div className="text-center opacity-30 mt-20 text-sm flex flex-col items-center gap-2">
                            <m3e-icon name="playlist_add" className="text-4xl"></m3e-icon>
                            <span>Добавьте шаги</span>
                        </div>
                    )}
                    {steps.map((step, idx) => {
                         const conf = BUILDER_CONFIG.find((c: any) => c.id === step.type);
                         return (
                             <div key={idx} className="bg-surface-container px-4 py-3 rounded-xl border border-white/5 flex flex-wrap md:flex-nowrap items-center gap-4 group animate-fade-in hover:border-white/20 hover:bg-surface-container-high transition-all shadow-sm">
                                {/* Icon */}
                                <div className="flex items-center gap-3 w-40 shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                                        <m3e-icon name={conf?.icon} className={`${conf?.color} text-[20px]`}></m3e-icon>
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-bold uppercase tracking-wider text-on-surface truncate" title={conf?.label}>{conf?.label || step.type}</span>
                                        <span className="text-[10px] opacity-40 font-mono">STEP {idx + 1}</span>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex-1 flex items-center gap-4 overflow-x-auto custom-scrollbar min-w-0">
                                     {(step.type === 'color' || step.type === 'flash' || step.type === 'pulse') && (
                                         <ColorTrigger value={step.val!} onClick={() => openColorPicker(idx, 'val', step.val!)} />
                                     )}
                                     {step.type === 'gradient' && (
                                         <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5 w-full max-w-[300px]">
                                             <ColorTrigger compact value={step.start!} onClick={() => openColorPicker(idx, 'start', step.start!)} />
                                             <div className="flex-1 h-1 bg-gradient-to-r from-white/10 to-white/10 rounded-full mx-2 relative">
                                                 <div className="absolute inset-0 rounded-full opacity-50" style={{background: `linear-gradient(to right, ${step.start}, ${step.end})`}}></div>
                                             </div>
                                             <button onClick={() => swapGradient(idx)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition shrink-0" title="Поменять местами">
                                                 <m3e-icon name="sync_alt" className="text-[16px]"></m3e-icon>
                                             </button>
                                             <ColorTrigger compact value={step.end!} onClick={() => openColorPicker(idx, 'end', step.end!)} />
                                         </div>
                                     )}
                                </div>

                                {/* Params */}
                                <div className="flex items-center gap-3 ml-auto shrink-0">
                                    <div className="flex items-center bg-black/20 rounded-lg px-3 h-10 border border-white/5 focus-within:border-primary/50 transition-colors group/inp" title="Длительность">
                                        <m3e-icon name="timer" className="text-[16px] opacity-40 mr-2 group-focus-within/inp:text-primary"></m3e-icon>
                                        <input type="number" className="bg-transparent w-16 text-sm text-white outline-none font-mono text-right"
                                            value={step.dur} onChange={(e) => updateStep(idx, 'dur', parseInt(e.target.value))} />
                                        <span className="text-[10px] opacity-40 ml-1 font-bold">MS</span>
                                    </div>

                                    {step.type !== 'sleep' && (
                                    <div className="flex items-center bg-black/20 rounded-lg px-3 h-10 border border-white/5 focus-within:border-primary/50 transition-colors group/inp" title="Яркость">
                                        <m3e-icon name="brightness_6" className="text-[16px] opacity-40 mr-2 group-focus-within/inp:text-primary"></m3e-icon>
                                        <input type="number" min="1" max="100" className="bg-transparent w-12 text-sm text-white outline-none font-mono text-center"
                                            value={step.bri || 100} onChange={(e) => updateStep(idx, 'bri', parseInt(e.target.value))} />
                                        <span className="text-[10px] opacity-40 ml-1 font-bold">%</span>
                                    </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 border-l border-white/10 pl-3 ml-2 shrink-0">
                                    <button onClick={() => duplicateStep(idx)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-on-surface-variant transition active:scale-90" title="Дублировать">
                                        <m3e-icon name="content_copy" className="text-[20px]"></m3e-icon>
                                    </button>
                                    <button onClick={() => removeStep(idx)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-400 transition active:scale-90" title="Удалить">
                                        <m3e-icon name="delete" className="text-[20px]"></m3e-icon>
                                    </button>
                                </div>
                             </div>
                         );
                    })}
                 </div>
            </div>

             {/* RIGHT: Config */}
            <div className="w-full md:w-80 flex flex-col bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden shadow-xl shrink-0 h-64 md:h-auto">
                 <div className="bg-surface-container px-4 py-3 text-xs font-bold text-gray-400 border-b border-white/5 flex justify-between items-center shrink-0">
                    <span>CONFIG</span>
                    <div className="flex gap-2">
                        <m3e-icon-button className="text-error" title="Остановить и сбросить" onClick={stopFlow}>
                            <m3e-icon name="stop_circle"></m3e-icon>
                        </m3e-icon-button>
                        <m3e-button variant="filled" className="scale-90 origin-right" onClick={runFlow}>
                            <m3e-icon slot="icon" name="play_arrow"></m3e-icon>
                            ЗАПУСК
                        </m3e-button>
                    </div>
                 </div>

                 <div className="p-4 border-b border-white/5 bg-surface-container/50">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                            <m3e-icon name="all_inclusive" className="text-primary"></m3e-icon>
                            Бесконечный повтор
                        </label>
                        <m3e-switch
                            ref={(el: any) => {
                                if(el) {
                                    el.selected = isLooping;
                                    el.onchange = (e: any) => setIsLooping(e.target.selected);
                                }
                            }}
                        ></m3e-switch>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <textarea
                        className="w-full h-full bg-transparent p-4 text-xs font-mono text-gray-300 outline-none resize-none leading-relaxed absolute inset-0"
                        spellCheck="false"
                        placeholder="YAML Code..."
                        value={yamlText}
                        onChange={handleYamlChange}
                    ></textarea>
                </div>
            </div>

            <Dialog
                open={colorDialogOpen}
                title="Выбор цвета"
                onClose={() => setColorDialogOpen(false)}
                actions={
                    <>
                        <m3e-button variant="text" onClick={() => setColorDialogOpen(false)}>Отмена</m3e-button>
                        <m3e-button variant="filled" onClick={saveColor}>Применить</m3e-button>
                    </>
                }
            >
                <div className="flex flex-col items-center gap-6 py-6 px-6">
                    <ColorPicker color={pickerColor} onColorChange={(c) => setPickerColor('#'+c)} />
                    <div className="flex items-center gap-3 bg-surface-variant/50 px-4 py-3 rounded-xl border border-white/5 w-full">
                        <span className="text-gray-500 font-bold text-lg">#</span>
                        <input type="text" className="bg-transparent border-none outline-none font-mono text-xl w-full text-center uppercase text-white placeholder-white/20"
                            maxLength={6}
                            value={pickerColor.replace('#','')}
                            onChange={(e) => setPickerColor('#'+e.target.value)}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

const ColorTrigger: React.FC<{value: string, compact?: boolean, onClick: () => void}> = ({value, compact, onClick}) => {
    if(compact) {
        return (
            <button className="w-8 h-8 rounded-lg border border-white/20 shadow-sm hover:scale-105 transition-transform cursor-pointer shrink-0"
                style={{backgroundColor: value}}
                onClick={onClick}
                title={value}>
            </button>
        );
    }
    return (
        <button className="h-10 pl-1.5 pr-4 rounded-xl border border-white/10 bg-black/20 flex items-center gap-3 hover:bg-white/5 transition-all cursor-pointer group active:scale-95"
            onClick={onClick}>
            <div className="w-7 h-7 rounded-lg shadow-sm border border-white/20 group-hover:scale-105 transition-transform" style={{backgroundColor: value}}></div>
            <span className="text-sm font-mono text-white/90 uppercase tracking-widest">{value}</span>
        </button>
    );
}