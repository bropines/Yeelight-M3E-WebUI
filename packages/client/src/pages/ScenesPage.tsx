import React from 'react';
import { useDevice } from '../context/DeviceContext';

export const ScenesPage: React.FC = () => {
    const { actions } = useDevice();

    const SCENES = [
        { id: 'fire', icon: 'local_fire_department', label: 'Огонь', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
        { id: 'police', icon: 'local_police', label: 'Полиция', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { id: 'disco', icon: 'music_note', label: 'Диско', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { id: 'sunrise', icon: 'wb_twilight', label: 'Рассвет', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    ];

    const handleStop = async () => {
        await actions.stop();
        await actions.setTemp(4000);
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in w-full max-w-4xl mx-auto h-full justify-center p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SCENES.map(scene => (
                    <button
                        key={scene.id}
                        onClick={() => actions.scene(scene.id)}
                        className={`
                            h-40 ${scene.bg} border ${scene.border} rounded-3xl
                            flex flex-col items-center justify-center gap-3
                            hover:brightness-110 active:scale-95 transition-all
                            cursor-pointer group relative overflow-hidden
                        `}
                    >
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <m3e-icon name={scene.icon} className={`text-5xl ${scene.color} group-hover:scale-110 transition-transform mb-1`}></m3e-icon>
                        <span className={`${scene.color} font-bold text-xl tracking-wide`}>{scene.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex justify-center mt-4">
                <m3e-button variant="outlined" className="text-error" style={{'--md-sys-color-outline': 'var(--md-sys-color-error)'}} onClick={handleStop}>
                    <m3e-icon slot="icon" name="stop_circle"></m3e-icon>
                    Сбросить эффекты
                </m3e-button>
            </div>
        </div>
    );
};