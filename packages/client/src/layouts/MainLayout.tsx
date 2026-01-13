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