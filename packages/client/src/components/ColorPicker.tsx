import React, { useEffect, useRef } from 'react';
import iro from '@jaames/iro';

interface ColorPickerProps {
    color?: string;
    onColorChange?: (color: string) => void;
    onColorChangeEnd?: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onColorChange, onColorChangeEnd }) => {
    const elRef = useRef<HTMLDivElement>(null);
    const pickerRef = useRef<any>(null);

    useEffect(() => {
        if (!elRef.current) return;

        // Prevent double init
        if (pickerRef.current) return;

        const p = new iro.ColorPicker(elRef.current, {
            width: 280,
            layout: [{ component: iro.ui.Wheel }],
            borderWidth: 3,
            borderColor: "#ffffff20",
            color: color ? (color.startsWith('#') ? color : '#' + color) : '#ffffff'
        });

        pickerRef.current = p;

        p.on('input:move', (c: any) => {
             const hex = c.hexString.substring(1).toUpperCase();
             onColorChange?.(hex);
        });

        p.on('input:end', (c: any) => {
            const hex = c.hexString.substring(1).toUpperCase();
            onColorChangeEnd?.(hex);
        });
    }, []);

    // Sync external color updates
    useEffect(() => {
        if (pickerRef.current && color) {
             const hex = color.startsWith('#') ? color : '#' + color;
             // Check if already set to avoid jumpiness
             if (pickerRef.current.color.hexString.toLowerCase() !== hex.toLowerCase()) {
                 pickerRef.current.color.hexString = hex;
             }
        }
    }, [color]);

    return <div ref={elRef} className="bg-black/20 p-6 rounded-full border border-white/5 shadow-2xl" />;
};