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