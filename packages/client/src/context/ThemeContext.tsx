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