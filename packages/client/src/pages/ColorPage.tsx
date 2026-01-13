import React, { useEffect, useRef, useState } from 'react';
import { useDevice } from '../context/DeviceContext';
import { ColorPicker } from '../components/ColorPicker';
import { debounce } from '../utils/timing';

export const ColorPage: React.FC = () => {
    const { state, actions } = useDevice();
    const [hex, setHex] = useState('FFFFFF');
    const [bright, setBright] = useState(50);
    const sliderRef = useRef<any>(null);

    // Debounced actions
    const debouncedColor = React.useMemo(() => debounce((val: string) => actions.setColor(parseInt(val, 16)), 200), [actions]);
    const debouncedBri = React.useMemo(() => debounce((val: number) => actions.setBright(val), 300), [actions]);

    // Sync from state (network)
    useEffect(() => {
        if (state) {
            // state[1] = bright, state[3] = rgb int
            if (state[1]) setBright(parseInt(state[1]));
            if (state[3]) {
                const h = parseInt(state[3]).toString(16).toUpperCase().padStart(6, '0');
                setHex(h);
            }
        }
    }, [state]);

    // Attach listener
    useEffect(() => {
        const el = sliderRef.current;
        if (!el) return;
        const handler = (e: any) => {
            const val = parseInt(e.target.value);
            setBright(val);
            debouncedBri(val);
        };
        el.addEventListener('input', handler);
        return () => el.removeEventListener('input', handler);
    }, [debouncedBri]);

    const handleColorChange = (h: string) => {
        setHex(h);
        debouncedColor(h);
    };

    const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setHex(val); // Allow typing
        if (/^[0-9A-Fa-f]{6}$/.test(val)) {
            debouncedColor(val);
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 h-full justify-center animate-fade-in w-full max-w-xl mx-auto">
            <ColorPicker color={hex} onColorChange={handleColorChange} onColorChangeEnd={(h) => actions.setColor(parseInt(h, 16))} />

            <div className="bg-surface-container-high p-4 rounded-2xl flex items-center gap-3 border border-white/10">
                <span className="text-gray-500 font-bold">#</span>
                <input
                    type="text"
                    maxLength={6}
                    className="bg-transparent uppercase font-mono text-xl w-24 outline-none text-center text-white"
                    placeholder="FFFFFF"
                    value={hex}
                    onChange={handleHexInput}
                />
            </div>

            <div className="w-full bg-surface-container-low p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between mb-2 px-1">
                    <span className="text-xs font-bold uppercase text-gray-500">Яркость</span>
                    <span className="text-xs font-bold text-white">{bright}%</span>
                </div>
                <div className="w-full overflow-hidden">
                    <m3e-slider
                        ref={sliderRef}
                        min="1" max="100" step="1"
                        className="block w-full"
                        value={bright}
                    >
                        <m3e-slider-thumb value={bright}></m3e-slider-thumb>
                    </m3e-slider>
                </div>
            </div>
        </div>
    );
};
