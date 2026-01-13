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