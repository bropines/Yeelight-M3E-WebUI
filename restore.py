import os

files = {
    "packages/client/vite.config.ts": r"""
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const rootNodeModules = path.resolve(__dirname, '../../node_modules');

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['lit', 'lit-html', 'lit-element', '@m3e/core'],
    alias: {
      '@yeelight/shared': path.resolve(__dirname, '../shared/index.ts'),
      'lit': path.join(rootNodeModules, 'lit'),
      'lit-html': path.join(rootNodeModules, 'lit-html'),
      'lit-element': path.join(rootNodeModules, 'lit-element'),
      '@m3e/core/layout': path.join(rootNodeModules, '@m3e/core/dist/layout.js'),
      '@m3e/core/bidi': path.join(rootNodeModules, '@m3e/core/dist/bidi.js'),
      '@m3e/core/a11y': path.join(rootNodeModules, '@m3e/core/dist/a11y.js'),
      '@m3e/core/platform': path.join(rootNodeModules, '@m3e/core/dist/platform.js'),
      '@m3e/core/anchoring': path.join(rootNodeModules, '@m3e/core/dist/anchoring.js'),
      '@m3e/core': path.join(rootNodeModules, '@m3e/core/dist/index.js'),
      '@m3e/theme': path.join(rootNodeModules, '@m3e/theme/dist/index.js'),
      '@m3e/card': path.join(rootNodeModules, '@m3e/card/dist/index.js'),
      '@m3e/button': path.join(rootNodeModules, '@m3e/button/dist/index.js'),
      '@m3e/icon': path.join(rootNodeModules, '@m3e/icon/dist/index.js'),
      '@m3e/icon-button': path.join(rootNodeModules, '@m3e/icon-button/dist/index.js'),
      '@m3e/slider': path.join(rootNodeModules, '@m3e/slider/dist/index.js'),
      '@m3e/switch': path.join(rootNodeModules, '@m3e/switch/dist/index.js'),
      '@m3e/segmented-button': path.join(rootNodeModules, '@m3e/segmented-button/dist/index.js'),
      '@m3e/fab': path.join(rootNodeModules, '@m3e/fab/dist/index.js'),
      '@m3e/dialog': path.join(rootNodeModules, '@m3e/dialog/dist/index.js'),
      '@m3e/form-field': path.join(rootNodeModules, '@m3e/form-field/dist/index.js'),
      '@m3e/nav-rail': path.join(rootNodeModules, '@m3e/nav-rail/dist/index.js'),
      '@m3e/nav-bar': path.join(rootNodeModules, '@m3e/nav-bar/dist/index.js'),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
""",
    "packages/client/tsconfig.json": r"""
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
""",
    "packages/client/package.json": r"""
{
  "type": "module",
  "name": "@yeelight/client",
  "version": "1.0.0",
  "dependencies": {
    "@jaames/iro": "^5.5.2",
    "@m3e/all": "*",
    "autoprefixer": "^10.4.16",
    "js-yaml": "^4.1.0",
    "postcss": "^8.4.32",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-router-dom": "^7.12.0",
    "tailwindcss": "^3.4.1",
    "vanilla-colorful": "^0.7.2"
  },
  "devDependencies": {
    "@types/js-yaml": "^4.0.9",
    "@types/node": "^20.10.5",
    "@types/react": "^19.2.8",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.2",
    "typescript": "^5.3.3",
    "vite": "^5.0.10"
  },
  "scripts": {
    "preview": "vite preview",
    "dev": "vite",
    "build": "vite build"
  }
}
""",
    "packages/client/src/vite-env.d.ts": r"""
/// <reference types="vite/client" />

export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'm3e-theme': any;
      'm3e-button': any;
      'm3e-card': any;
      'm3e-dialog': any;
      'm3e-fab': any;
      'm3e-form-field': any;
      'm3e-icon': any;
      'm3e-icon-button': any;
      'm3e-segmented-button': any;
      'm3e-button-segment': any;
      'm3e-slider': any;
      'm3e-slider-thumb': any;
      'm3e-switch': any;
      'm3e-nav-rail': any;
      'm3e-nav-rail-toggle': any;
      'm3e-nav-bar': any;
      'm3e-nav-item': any;
      'm3e-divider': any;
      'm3e-heading': any;
    }
  }
}
""",
    "packages/client/src/types.d.ts": r"""
declare namespace JSX {
  interface IntrinsicElements {
    'm3e-theme': any;
    'm3e-button': any;
    'm3e-card': any;
    'm3e-dialog': any;
    'm3e-fab': any;
    'm3e-form-field': any;
    'm3e-icon': any;
    'm3e-icon-button': any;
    'm3e-segmented-button': any;
    'm3e-button-segment': any;
    'm3e-slider': any;
    'm3e-slider-thumb': any;
    'm3e-switch': any;
    'm3e-nav-rail': any;
    'm3e-nav-rail-toggle': any;
    'm3e-nav-bar': any;
    'm3e-nav-item': any;
    'm3e-divider': any;
    'm3e-heading': any;
  }
}
""",
    "packages/client/src/utils/timing.ts": r"""
export function debounce(func: Function, wait: number) {
  let timeout: any;
  return function(...args: any[]) {
    // @ts-ignore
    const context = this;
    const later = () => {
      clearTimeout(timeout);
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
""",
    "packages/client/src/context/ThemeContext.tsx": r"""
import React, { createContext, useContext, useState } from 'react';

export interface ThemeConfig {
    color: string;
    scheme: 'light' | 'dark' | 'auto';
    density: number; // -3 to 1
    motion: 'standard' | 'expressive';
}

const DEFAULT_THEME: ThemeConfig = {
    color: '#D0BCFF',
    scheme: 'dark',
    density: 0,
    motion: 'standard'
};

interface ThemeContextType {
    theme: ThemeConfig;
    setTheme: (theme: ThemeConfig) => void;
    updateTheme: (partial: Partial<ThemeConfig>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeConfig>(() => {
        const saved = localStorage.getItem('yeelight_theme');
        return saved ? JSON.parse(saved) : DEFAULT_THEME;
    });

    const setTheme = (newTheme: ThemeConfig) => {
        setThemeState(newTheme);
        localStorage.setItem('yeelight_theme', JSON.stringify(newTheme));
    };

    const updateTheme = (partial: Partial<ThemeConfig>) => {
        setTheme((prev: ThemeConfig) => {
             const next = { ...prev, ...partial };
             localStorage.setItem('yeelight_theme', JSON.stringify(next));
             return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
""",
    "packages/client/src/context/DeviceContext.tsx": r"""
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// [power, bright, ct, rgb, color_mode]
export type DeviceState = [string, string, string, string, string];

interface DeviceContextType {
    ip: string;
    setIp: (ip: string) => void;
    state: DeviceState | null;
    isOnline: boolean;
    sync: () => Promise<void>;
    actions: {
        toggle: () => Promise<void>;
        setBright: (val: number) => Promise<void>;
        setTemp: (val: number) => Promise<void>;
        setColor: (val: number) => Promise<void>;
        stop: () => Promise<void>;
        scene: (name: string) => Promise<void>;
    };
    deviceNames: Record<string, string>;
    saveDeviceName: (ip: string, name: string) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ip, setIpState] = useState(() => localStorage.getItem('bulb_ip') || '');
    const [state, setState] = useState<DeviceState | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [deviceNames, setDeviceNames] = useState<Record<string, string>>(() =>
        JSON.parse(localStorage.getItem('yeelight_devices') || '{}')
    );

    const pollRef = useRef<any>(null);

    const setIp = (newIp: string) => {
        setIpState(newIp);
        localStorage.setItem('bulb_ip', newIp);
    };

    const saveDeviceName = (ip: string, name: string) => {
        const newNames = { ...deviceNames, [ip]: name };
        setDeviceNames(newNames);
        localStorage.setItem('yeelight_devices', JSON.stringify(newNames));
    };

    const sync = useCallback(async () => {
        if (!ip || !IP_REGEX.test(ip)) {
            setIsOnline(false);
            return;
        }

        try {
            const res = await fetch(`/api/status?ip=${ip}`);
            if (!res.ok) throw new Error('Status failed');
            const data = await res.json();
            setState(data);
            setIsOnline(true);
        } catch (e) {
            setIsOnline(false);
        }
    }, [ip]);

    // Polling logic
    useEffect(() => {
        sync();
        pollRef.current = setInterval(sync, 2000);

        // Visibility change logic
        const onVisChange = () => {
            if (document.visibilityState === "visible") {
                sync();
                clearInterval(pollRef.current);
                pollRef.current = setInterval(sync, 2000);
            }
        };
        document.addEventListener("visibilitychange", onVisChange);

        return () => {
            clearInterval(pollRef.current);
            document.removeEventListener("visibilitychange", onVisChange);
        };
    }, [sync]);

    const api = async (type: string, val = '') => {
        if (!ip) return;
        try {
            await fetch(`/api/act?ip=${ip}&type=${type}&val=${val}`);
            if (type !== 'toggle') {
                setTimeout(sync, 150);
            } else {
                 if(state) {
                     const newState = [...state] as DeviceState;
                     newState[0] = newState[0] === 'on' ? 'off' : 'on';
                     setState(newState);
                 }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const actions = {
        toggle: () => api('toggle'),
        setBright: (val: number) => api('bright', val.toString()),
        setTemp: (val: number) => api('temp', val.toString()),
        setColor: (val: number) => api('color', val.toString()),
        stop: () => api('stop'),
        scene: async (name: string) => {
             if(ip) await fetch(`/api/scene?ip=${ip}&name=${name}`);
        }
    };

    return (
        <DeviceContext.Provider value={{ ip, setIp, state, isOnline, sync, actions, deviceNames, saveDeviceName }}>
            {children}
        </DeviceContext.Provider>
    );
};

export const useDevice = () => {
    const context = useContext(DeviceContext);
    if (!context) throw new Error('useDevice must be used within a DeviceProvider');
    return context;
};
""",
    "packages/client/src/components/ColorPicker.tsx": r"""
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
""",
    "packages/client/src/components/Dialog.tsx": r"""
import React, { useRef, useEffect } from 'react';

interface DialogProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, title, onClose, children, actions }) => {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [open]);

    return (
        <dialog ref={ref} className="
            bg-[#2b2930] text-[#e6e1e5] p-0 rounded-[28px]
            backdrop:bg-black/60 backdrop:backdrop-blur-[2px]
            shadow-2xl border border-white/5 outline-none
            min-w-[320px] max-w-[90vw]
            open:animate-in open:fade-in open:zoom-in-95 duration-200
            fixed inset-0 m-auto z-[100]
        " onClose={onClose} onClick={(e) => {
             const rect = ref.current?.getBoundingClientRect();
             if (rect && (e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right)) {
                 onClose();
             }
        }}>
            <div className="flex flex-col w-full overflow-hidden">
                <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
                    <span className="text-[24px] leading-8 text-on-surface">{title}</span>
                    <m3e-icon-button density="-1" onClick={onClose} className="text-on-surface-variant">
                        <m3e-icon name="close"></m3e-icon>
                    </m3e-icon-button>
                </div>

                <div className="px-6 pb-2 flex flex-col gap-4 overflow-y-auto max-h-[60vh] w-full box-border">
                    {children}
                </div>

                {actions && (
                    <div className="px-6 py-6 flex justify-end gap-2 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </dialog>
    );
};
""",
    "packages/client/src/components/EditDeviceDialog.tsx": r"""
import React, { useRef, useEffect, useState } from 'react';

interface EditDeviceDialogProps {
    open: boolean;
    ip: string;
    currentName: string;
    onClose: () => void;
    onSave: (name: string) => void;
}

export const EditDeviceDialog: React.FC<EditDeviceDialogProps> = ({ open, ip, currentName, onClose, onSave }) => {
    const nativeRef = useRef<HTMLDialogElement>(null);
    const [name, setName] = useState(currentName);

    useEffect(() => {
        setName(currentName);
    }, [currentName]);

    useEffect(() => {
        if (open) {
            nativeRef.current?.showModal();
        } else {
            nativeRef.current?.close();
        }
    }, [open]);

    const handleSave = () => {
        onSave(name);
        onClose();
    };

    return (
        <dialog ref={nativeRef} className="
            bg-[#2b2930] text-[#e6e1e5] p-0 rounded-[28px]
            backdrop:bg-black/60 backdrop:backdrop-blur-[2px]
            shadow-2xl border border-white/5 outline-none
            min-w-[320px] max-w-[90vw]
            open:animate-in open:fade-in open:zoom-in-95 duration-200
            fixed inset-0 m-auto z-[100]
        " onClose={onClose}>
            <div className="flex flex-col w-full overflow-hidden">
                <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
                    <span className="text-[24px] leading-8 text-on-surface">Сохранение</span>
                    <m3e-icon-button density="-1" onClick={onClose} className="text-on-surface-variant">
                        <m3e-icon name="close"></m3e-icon>
                    </m3e-icon-button>
                </div>

                <div className="px-6 pb-2 flex flex-col gap-4 overflow-y-auto max-h-[60vh] w-full box-border">
                     <div className="flex flex-col gap-4 pt-2">
                        {/* IP Field */}
                        <div className="flex flex-col gap-1">
                            <div className="relative bg-surface-variant/30 rounded-t-lg rounded-b-none border-b border-outline-variant hover:bg-surface-variant/50 transition-colors h-14 px-4 flex flex-col justify-center opacity-60">
                                <span className="text-[12px] text-primary font-medium leading-4">IP Адрес</span>
                                <input type="text" value={ip} readOnly
                                    className="bg-transparent border-none outline-none text-on-surface text-body-large font-mono p-0 pointer-events-none" />
                                <m3e-icon name="wifi" className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"></m3e-icon>
                            </div>
                        </div>

                        {/* Name Field */}
                        <div className="flex flex-col gap-1">
                            <div className="relative bg-surface-variant/30 rounded-t-lg rounded-b-none border-b border-on-surface hover:bg-surface-variant/50 focus-within:bg-surface-variant/50 transition-colors h-14 px-4 flex flex-col justify-center group">
                                <span className="text-[12px] text-on-surface-variant group-focus-within:text-primary font-medium leading-4 transition-colors">Название устройства</span>
                                <input type="text" placeholder="Например: Люстра" value={name} onChange={e => setName(e.target.value)}
                                    className="bg-transparent border-none outline-none text-on-surface text-body-large p-0 placeholder:text-on-surface-variant/30" />
                                <m3e-icon name="edit" className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors"></m3e-icon>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 flex justify-end gap-2 shrink-0">
                    <m3e-button variant="text" onClick={onClose}>Отмена</m3e-button>
                    <m3e-button variant="filled" onClick={handleSave}>Сохранить</m3e-button>
                </div>
            </div>
        </dialog>
    );
};
""",
    "packages/client/src/layouts/MainLayout.tsx": r"""
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useDevice } from '../context/DeviceContext';
import { EditDeviceDialog } from '../components/EditDeviceDialog';

const NAV_ITEMS = [
    { id: 'scenes', icon: 'auto_awesome', label: 'Сцены', path: '/' },
    { id: 'color', icon: 'palette', label: 'Цвет', path: '/color' },
    { id: 'temp', icon: 'thermostat', label: 'Белый', path: '/temp' },
    { id: 'music', icon: 'mic', label: 'Музыка', path: '/music' },
    { id: 'builder', icon: 'build', label: 'Сборка', path: '/builder' },
    { id: 'settings', icon: 'settings', label: 'Настр.', path: '/settings' },
];

export const MainLayout: React.FC = () => {
    const { theme } = useTheme();
    const { ip, setIp, state, isOnline, sync, actions, deviceNames, saveDeviceName } = useDevice();
    const navigate = useNavigate();
    const location = useLocation();

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [ipInput, setIpInput] = useState(ip);

    const switchRef = useRef<any>(null);

    // Sync IP input if context updates (e.g. from localstorage init)
    useEffect(() => {
        if(ip !== ipInput) setIpInput(ip);
    }, [ip]);

    const currentTab = NAV_ITEMS.find(item => item.path === location.pathname)?.id || 'scenes';

    // Switch sync logic
    useEffect(() => {
        if (switchRef.current) {
            const isOn = state?.[0] === 'on';
            if (switchRef.current.selected !== isOn) {
                switchRef.current.selected = isOn;
            }

            // Re-attach listener to avoid stale closures if needed, or just handle event
            switchRef.current.onchange = (e: any) => {
                 // Prevent loop if value matches
                 if (e.target.selected !== (state?.[0] === 'on')) {
                     actions.toggle();
                 }
            };
        }
    }, [state, actions]);

    return (
        <m3e-theme
            scheme={theme.scheme}
            color={theme.color}
            density={theme.density}
            motion={theme.motion}
            className="flex h-screen w-full bg-background text-on-surface overflow-hidden relative flex-col md:flex-row transition-colors duration-500"
            id="mainTheme"
        >
            {/* RAIL (Desktop) */}
            <m3e-nav-rail id="mainRail" className="hidden md:flex border-r border-outline-variant/10">
                <m3e-icon-button slot="menu-button" toggle>
                    <m3e-icon name="menu"></m3e-icon>
                    <m3e-icon slot="selected" name="menu_open"></m3e-icon>
                    <m3e-nav-rail-toggle for="mainRail"></m3e-nav-rail-toggle>
                </m3e-icon-button>
                {NAV_ITEMS.map(item => (
                    <m3e-nav-item
                        key={item.id}
                        active={currentTab === item.id ? '' : undefined}
                        onClick={() => navigate(item.path)}
                    >
                        <m3e-icon slot="icon" name={item.icon}></m3e-icon>
                        {item.label}
                    </m3e-nav-item>
                ))}
            </m3e-nav-rail>

            <div className="flex-1 flex flex-col h-full min-w-0 bg-background transition-all overflow-hidden">
                {/* HEADER */}
                <header className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-outline-variant/10 bg-surface gap-4 shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <span className="text-title-medium md:text-title-large font-bold whitespace-nowrap hidden sm:block">Yeelight</span>
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-variant/50 border border-outline-variant/10">
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-error'}`}></span>
                            <span className={`text-xs font-mono opacity-70 uppercase tracking-widest ${isOnline ? 'text-green-200' : ''}`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-1 justify-end">
                        <m3e-icon-button variant="standard" className="text-on-surface-variant hidden sm:flex" onClick={sync}>
                            <m3e-icon name="refresh"></m3e-icon>
                        </m3e-icon-button>

                        <div className="flex items-center bg-surface-variant rounded-xl px-3 h-10 md:h-12 border border-outline-variant/20 hover:border-outline/50 transition-colors w-32 md:w-48 group focus-within:border-primary">
                            <input
                                type="text"
                                className={`bg-transparent border-none outline-none text-sm font-mono text-on-surface-variant w-full text-center placeholder:text-on-surface-variant/30 ${!isOnline && ipInput ? 'text-error' : ''}`}
                                placeholder="192.168.1.X"
                                value={ipInput}
                                onChange={(e) => {
                                    setIpInput(e.target.value);
                                    const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                                    if(IP_REGEX.test(e.target.value.trim())) {
                                        setIp(e.target.value.trim());
                                    }
                                }}
                            />
                        </div>

                        <m3e-icon-button variant="tonal" className="shrink-0" title="Сохранить устройство" onClick={() => setEditDialogOpen(true)}>
                            <m3e-icon name="save"></m3e-icon>
                        </m3e-icon-button>

                        <div className="w-px h-8 bg-outline-variant/20 mx-1 hidden sm:block"></div>

                        <div className="flex items-center gap-2 bg-surface-container-high rounded-full pl-4 pr-1 py-1 border border-outline-variant/10">
                            <span className="text-label-small font-bold uppercase tracking-wider mr-1 hidden sm:block">Свет</span>
                            <m3e-switch
                                icons="selected"
                                ref={switchRef}
                            ></m3e-switch>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar pb-24 md:pb-8">
                    <Outlet />
                </main>
            </div>

            {/* BAR (Mobile) */}
            <m3e-nav-bar className="md:hidden border-t border-outline-variant/10 shrink-0 z-20">
                {NAV_ITEMS.map(item => (
                    <m3e-nav-item
                        key={item.id}
                        active={currentTab === item.id ? '' : undefined}
                        onClick={() => navigate(item.path)}
                    >
                        <m3e-icon slot={currentTab === item.id ? 'active-icon' : 'icon'} name={item.icon}></m3e-icon>
                        {currentTab === item.id && <m3e-icon slot="icon" name={item.icon}></m3e-icon>}
                        {item.label}
                    </m3e-nav-item>
                ))}
            </m3e-nav-bar>

            <EditDeviceDialog
                open={editDialogOpen}
                ip={ip}
                currentName={deviceNames[ip] || ''}
                onClose={() => setEditDialogOpen(false)}
                onSave={(name) => saveDeviceName(ip, name)}
            />
        </m3e-theme>
    );
};
""",
    "packages/client/src/pages/ScenesPage.tsx": r"""
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
""",
    "packages/client/src/pages/ColorPage.tsx": r"""
import React, { useEffect, useRef, useState } from 'react';
import { useDevice } from '../context/DeviceContext';
import { ColorPicker } from '../components/ColorPicker';
import { debounce } from '../utils/timing';

export const ColorPage: React.FC = () => {
    const { state, actions } = useDevice();
    const [hex, setHex] = useState('FFFFFF');
    const [bright, setBright] = useState(50);

    // Debounced actions
    const debouncedColor = useRef(debounce((val: string) => actions.setColor(parseInt(val, 16)), 200)).current;
    const debouncedBri = useRef(debounce((val: number) => actions.setBright(val), 300)).current;

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

    const handleBriChange = (e: any) => {
        const val = parseInt(e.target.value);
        setBright(val);
        debouncedBri(val);
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
                <m3e-slider min="1" max="100" step="1" style={{width: '100%', display: 'block'}} onInput={handleBriChange} value={bright}>
                    <m3e-slider-thumb value={bright}></m3e-slider-thumb>
                </m3e-slider>
            </div>
        </div>
    );
};
""",
    "packages/client/src/pages/TempPage.tsx": r"""
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
""",
    "packages/client/src/pages/MusicPage.tsx": r"""
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
                            <m3e-slider
                                min="0" max="100" step="1" className="w-full" style={{display:'block', width:'100%'}}
                                onInput={(e: any) => {
                                    const thumbs = Array.from(e.target.querySelectorAll('m3e-slider-thumb')) as any[];
                                    const v1 = parseInt(thumbs[0].value);
                                    const v2 = parseInt(thumbs[1].value);
                                    updateParam('freqRange', [Math.min(v1, v2), Math.max(v1, v2)]);
                                }}
                            >
                                <m3e-slider-thumb value={params.freqRange[0]}></m3e-slider-thumb>
                                <m3e-slider-thumb value={params.freqRange[1]}></m3e-slider-thumb>
                            </m3e-slider>
                        </div>

                        {/* Sensitivity & Smoothing */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                                    <span>Порог</span>
                                    <span>{params.sensitivity}</span>
                                </div>
                                <m3e-slider min="1" max="250" step="1" value={params.sensitivity} className="w-full" style={{display:'block', width:'100%'}}
                                    onInput={(e: any) => updateParam('sensitivity', parseInt(e.target.value))}>
                                    <m3e-slider-thumb value={params.sensitivity}></m3e-slider-thumb>
                                </m3e-slider>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-2">
                                    <span>Сглаж.</span>
                                    <span>{Math.round(params.smoothing * 100)}%</span>
                                </div>
                                <m3e-slider min="0" max="95" step="1" value={params.smoothing * 100} className="w-full" style={{display:'block', width:'100%'}}
                                    onInput={(e: any) => updateParam('smoothing', parseInt(e.target.value) / 100)}>
                                    <m3e-slider-thumb value={params.smoothing * 100}></m3e-slider-thumb>
                                </m3e-slider>
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
                                    <m3e-slider min="0" max="360" step="1" value={params.hueOffset} className="w-full" style={{display:'block', width:'100%'}}
                                         onInput={(e: any) => updateParam('hueOffset', parseInt(e.target.value))}>
                                        <m3e-slider-thumb value={params.hueOffset}></m3e-slider-thumb>
                                    </m3e-slider>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] uppercase opacity-50 mb-1">
                                        <span>Плотность спектра</span>
                                        <span>{params.hueDensity}°</span>
                                    </div>
                                    <m3e-slider min="0" max="360" step="5" value={params.hueDensity} className="w-full" style={{display:'block', width:'100%'}}
                                        onInput={(e: any) => updateParam('hueDensity', parseInt(e.target.value))}>
                                        <m3e-slider-thumb value={params.hueDensity}></m3e-slider-thumb>
                                    </m3e-slider>
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
                                onChange={(e: any) => {
                                     // For segmented button we have to find checked child
                                     const segments = Array.from(e.target.querySelectorAll('m3e-button-segment')) as any[];
                                     const sel = segments.find(s => s.checked);
                                     if(sel) updateParam('colorMode', sel.value);
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
                                    onChange={(e: any) => {
                                         const segments = Array.from(e.target.querySelectorAll('m3e-button-segment')) as any[];
                                         const sel = segments.find(s => s.checked);
                                         if(sel) updateParam('audioSourceType', sel.value);
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
                                <m3e-slider min="0" max="5" step="1" value={Math.log2(params.fftSize) - 6} discrete className="flex-1" style={{display:'block'}}
                                    onChange={(e: any) => {
                                        const map = [64, 128, 256, 512, 1024, 2048];
                                        updateParam('fftSize', map[parseInt(e.target.value)]);
                                    }}
                                >
                                    <m3e-slider-thumb></m3e-slider-thumb>
                                </m3e-slider>
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
""",
    "packages/client/src/pages/BuilderPage.tsx": r"""
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
""",
    "packages/client/src/pages/SettingsPage.tsx": r"""
import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
    const { theme, updateTheme } = useTheme();

    return (
        <div className="flex flex-col gap-6 animate-fade-in w-full max-w-2xl mx-auto p-4 h-full overflow-y-auto custom-scrollbar pb-24">
            <m3e-heading variant="headline" size="medium">Настройки интерфейса</m3e-heading>

            {/* 1. COLOR SCHEME */}
            <m3e-card variant="outlined" className="flex flex-col gap-4">
                <m3e-heading slot="header" variant="title" size="medium">Цветовая схема</m3e-heading>
                <div slot="content" className="flex flex-col gap-4">

                    <div className="flex flex-col gap-2">
                        <span className="text-label-large">Основной цвет (Seed Color)</span>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                className="w-16 h-12 bg-transparent cursor-pointer border-0 p-0"
                                value={theme.color}
                                onChange={(e) => updateTheme({ color: e.target.value })}
                            />
                            <span className="text-body-medium font-mono opacity-70">{theme.color}</span>
                        </div>
                    </div>

                    <m3e-divider></m3e-divider>

                    <div className="flex flex-col gap-2">
                        <span className="text-label-large">Режим</span>
                        <m3e-segmented-button className="w-full"
                            onChange={(e: any) => {
                                const segments = Array.from(e.target.querySelectorAll('m3e-button-segment')) as any[];
                                const sel = segments.find(s => s.checked);
                                if(sel) updateTheme({ scheme: sel.value });
                            }}
                        >
                            <m3e-button-segment value="auto" selected={theme.scheme === 'auto' ? '' : undefined} icon="brightness_auto">Auto</m3e-button-segment>
                            <m3e-button-segment value="light" selected={theme.scheme === 'light' ? '' : undefined} icon="light_mode">Light</m3e-button-segment>
                            <m3e-button-segment value="dark" selected={theme.scheme === 'dark' ? '' : undefined} icon="dark_mode">Dark</m3e-button-segment>
                        </m3e-segmented-button>
                    </div>
                </div>
            </m3e-card>

            {/* 2. DENSITY & MOTION */}
            <m3e-card variant="outlined" className="flex flex-col gap-4">
                <m3e-heading slot="header" variant="title" size="medium">Интерфейс</m3e-heading>
                <div slot="content" className="flex flex-col gap-6">

                    {/* Density */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                            <span className="text-label-large">Плотность (Density)</span>
                            <span className="text-label-medium opacity-70">{theme.density}</span>
                        </div>
                        <m3e-slider min="-3" max="1" step="1" value={theme.density} discrete labelled style={{width:'100%', display:'block'}}
                            onChange={(e: any) => updateTheme({ density: parseInt(e.target.value) })}
                        >
                            <m3e-slider-thumb></m3e-slider-thumb>
                        </m3e-slider>
                        <div className="flex justify-between text-label-small opacity-50 px-1">
                            <span>Compact</span>
                            <span>Spacious</span>
                        </div>
                    </div>

                    {/* Motion */}
                    <div className="flex flex-col gap-2">
                        <span className="text-label-large">Анимации (Motion)</span>
                        <m3e-segmented-button className="w-full"
                             onChange={(e: any) => {
                                const segments = Array.from(e.target.querySelectorAll('m3e-button-segment')) as any[];
                                const sel = segments.find(s => s.checked);
                                if(sel) updateTheme({ motion: sel.value });
                            }}
                        >
                            <m3e-button-segment value="standard" selected={theme.motion === 'standard' ? '' : undefined}>Standard</m3e-button-segment>
                            <m3e-button-segment value="expressive" selected={theme.motion === 'expressive' ? '' : undefined}>Expressive</m3e-button-segment>
                        </m3e-segmented-button>
                    </div>

                </div>
            </m3e-card>

            {/* 3. PREVIEW */}
            <m3e-card variant="filled" className="flex flex-col gap-4">
                <m3e-heading slot="header" variant="title" size="medium">Предпросмотр</m3e-heading>
                <div slot="content" className="flex flex-wrap gap-4 items-center justify-center py-4">
                    <m3e-button variant="filled">Filled</m3e-button>
                    <m3e-button variant="tonal">Tonal</m3e-button>
                    <m3e-button variant="outlined">Outlined</m3e-button>
                    <m3e-fab variant="primary" size="medium"><m3e-icon name="edit"></m3e-icon></m3e-fab>
                    <m3e-switch checked icons="both"></m3e-switch>
                </div>
            </m3e-card>
        </div>
    );
};
""",
    "packages/client/src/App.tsx": r"""
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DeviceProvider } from './context/DeviceContext';
import { MainLayout } from './layouts/MainLayout';
import { ScenesPage } from './pages/ScenesPage';
import { ColorPage } from './pages/ColorPage';
import { TempPage } from './pages/TempPage';
import { MusicPage } from './pages/MusicPage';
import { BuilderPage } from './pages/BuilderPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
    return (
        <ThemeProvider>
            <DeviceProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<ScenesPage />} />
                            <Route path="color" element={<ColorPage />} />
                            <Route path="temp" element={<TempPage />} />
                            <Route path="music" element={<MusicPage />} />
                            <Route path="builder" element={<BuilderPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </DeviceProvider>
        </ThemeProvider>
    );
};
""",
    "packages/client/src/main.tsx": r"""
/// <reference path="./vite-env.d.ts" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

// Core
import '@m3e/theme';
// Components
import '@m3e/button';
import '@m3e/card';
import '@m3e/dialog';
import '@m3e/fab';
import '@m3e/form-field';
import '@m3e/icon';
import '@m3e/icon-button';
import '@m3e/segmented-button';
import '@m3e/slider';
import '@m3e/switch';
import '@m3e/nav-rail';
import '@m3e/nav-bar';
import '@m3e/divider';
import '@m3e/heading';

import { App } from './App';

ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
"""
}

# Directories to ensure exist
dirs = [
    "packages/client/src/utils",
    "packages/client/src/context",
    "packages/client/src/components",
    "packages/client/src/layouts",
    "packages/client/src/pages",
]

# Files to delete
to_delete = [
    "packages/client/src/main.ts",
    "packages/client/src/components/App.ts",
    "packages/client/src/components/NativeDialog.ts",
]

# 1. Create Directories
for d in dirs:
    os.makedirs(d, exist_ok=True)

# 2. Write Files
for path, content in files.items():
    with open(path, "w") as f:
        f.write(content.strip())

# 3. Delete Files
for path in to_delete:
    if os.path.exists(path):
        os.remove(path)

# 4. Remove recursive directory
import shutil
if os.path.exists("packages/client/src/views"):
    shutil.rmtree("packages/client/src/views")

# 5. Patch HTML
html_path = "packages/client/index.html"
with open(html_path, "r") as f:
    html = f.read()

html = html.replace('/src/main.ts', '/src/main.tsx')

with open(html_path, "w") as f:
    f.write(html)

print("Restoration complete.")
