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