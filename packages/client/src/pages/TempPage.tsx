import React, { useEffect, useRef, useState } from 'react';
import { useDevice } from '../context/DeviceContext';
import { debounce } from '../utils/timing';

export const TempPage: React.FC = () => {
    const { state, actions } = useDevice();
    const [temp, setTemp] = useState(4000);
    const [bright, setBright] = useState(50);

    // Use refs for debounced calls
    const debouncedTemp = useRef(debounce((val: number) => actions.setTemp(val), 300)).current;
    const debouncedBri = useRef(debounce((val: number) => actions.setBright(val), 300)).current;

    useEffect(() => {
        if (state) {
            if (state[1]) setBright(parseInt(state[1]));
            if (state[2]) setTemp(parseInt(state[2]));
        }
    }, [state]);

    const handleTempSlider = (e: any) => {
        const val = parseInt(e.target.value);
        setTemp(val);
        debouncedTemp(val);
    };

    const handleBriSlider = (e: any) => {
        const val = parseInt(e.target.value);
        setBright(val);
        debouncedBri(val);
    };

    const handlePreset = (val: number) => {
        setTemp(val);
        actions.setTemp(val); // Instant
    };

    // Editable display
    const handleTempInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let val = parseInt(e.target.value);
        if (isNaN(val)) val = 4000;
        if (val < 1700) val = 1700; else if (val > 6500) val = 6500;
        setTemp(val);
        actions.setTemp(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    const renderPreset = (k: number, name: string, color: string) => (
        <button
            key={k}
            className="flex flex-col items-center gap-3 group cursor-pointer active:scale-95 transition-transform"
            onClick={() => handlePreset(k)}
        >
            <div className="w-14 h-14 rounded-2xl shadow-lg border-2 border-transparent group-hover:border-primary transition-all relative overflow-hidden" style={{backgroundColor: color}}>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-label-small font-bold text-on-surface-variant group-hover:text-on-surface uppercase tracking-wide">{name}</span>
        </button>
    );

    return (
        <div className="flex flex-col items-center justify-center h-full gap-10 animate-fade-in max-w-xl mx-auto w-full p-4">

            {/* EDITABLE DISPLAY */}
            <div className="relative group flex justify-center">
                <input
                    type="number"
                    value={temp}
                    onChange={e => setTemp(parseInt(e.target.value))}
                    onBlur={handleTempInputBlur}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent text-7xl md:text-9xl font-thin text-on-surface tracking-wider font-mono text-center transition-all outline-none border-b-2 border-transparent focus:border-primary/50 cursor-text hover:text-primary/90 w-[4ch] appearance-none m-0 p-0"
                    style={{MozAppearance: 'textfield'}} // Hide spinners
                />
                <span className="absolute top-2 -right-6 md:-right-8 text-2xl text-on-surface-variant font-bold select-none">K</span>
                <div className="absolute -bottom-6 w-full text-center text-xs text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Нажми для ввода
                </div>
            </div>

            <div className="w-full flex flex-col gap-8 bg-surface-container-low p-8 rounded-[32px] border border-white/5 shadow-xl">

                {/* TEMP SLIDER */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between px-1">
                        <span className="text-label-medium font-bold text-orange-300">1700K</span>
                        <span className="text-label-medium font-bold text-blue-300">6500K</span>
                    </div>
                    <div className="relative w-full h-12 flex items-center justify-center">
                        <div className="absolute w-full h-6 rounded-full pointer-events-none shadow-inner border border-white/5"
                             style={{background: 'linear-gradient(90deg, #ff9329 0%, #ffffff 50%, #a3cfff 100%)'}}></div>

                        <m3e-slider
                            min="1700" max="6500" step="100"
                            value={temp}
                            className="w-full relative z-10"
                            style={{display: 'block', width: '100%', '--md-sys-color-primary': 'transparent', '--md-sys-color-surface-container-highest': 'transparent'}}
                            labelled
                            onInput={handleTempSlider}
                        >
                            <m3e-slider-thumb style={{'--md-sys-color-primary': '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.3)'}} value={temp}></m3e-slider-thumb>
                        </m3e-slider>
                    </div>
                </div>

                {/* BRIGHTNESS SLIDER */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between px-1 items-end">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                            <m3e-icon name="brightness_6"></m3e-icon>
                            <span className="text-label-medium font-bold uppercase tracking-wider">Яркость</span>
                        </div>
                        <span className="text-title-medium font-mono text-primary font-bold">{bright}%</span>
                    </div>
                    <m3e-slider min="1" max="100" step="1" value={bright} style={{display: 'block', width: '100%'}} onInput={handleBriSlider}>
                        <m3e-slider-thumb value={bright}></m3e-slider-thumb>
                    </m3e-slider>
                </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-4 w-full">
                {renderPreset(1700, 'Свеча', '#ff9329')}
                {renderPreset(3500, 'Закат', '#ffc58f')}
                {renderPreset(4000, 'Нейтрал', '#ffe4ce')}
                {renderPreset(6500, 'Дневной', '#d6eaff')}
            </div>
        </div>
    );
};