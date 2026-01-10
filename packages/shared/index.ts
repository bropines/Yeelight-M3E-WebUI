export type YeelightMethod = 
    | "get_prop" | "set_default" | "set_power" | "toggle" | "set_bright" 
    | "start_cf" | "stop_cf" | "set_scene" | "cron_add" | "cron_get" 
    | "cron_del" | "set_ct_abx" | "set_rgb" | "set_hsv" | "set_adjust" 
    | "set_music" | "set_name";

export interface DeviceState {
    ip: string;
    port: number;
    name: string;
    power: boolean;
    bright: number;
    ct: number;
    rgb: number;
    connected: boolean;
}

export interface BuilderConfig {
    id: string;
    label: string;
    icon: string;
    color: string;
    defaults: any;
}

// Конфигурация для билдера (общая)
export const BUILDER_CONFIG: BuilderConfig[] = [
    { id: 'color', label: 'Цвет', icon: 'palette', color: 'text-pink-300', defaults: { type: 'color', dur: 1000, val: '#FF0000', bri: 100 } },
    { id: 'gradient', label: 'Градиент', icon: 'gradient', color: 'text-blue-300', defaults: { type: 'gradient', dur: 2000, start: '#FF0000', end: '#0000FF', bri: 100 } },
    { id: 'flash', label: 'Вспышка', icon: 'flash_on', color: 'text-yellow-300', defaults: { type: 'flash', dur: 100, val: '#FFFFFF', bri: 100 } },
    { id: 'pulse', label: 'Пульс', icon: 'radio_button_checked', color: 'text-green-300', defaults: { type: 'pulse', dur: 2000, val: '#00FF00', bri: 100 } },
    { id: 'sleep', label: 'Пауза', icon: 'bedtime', color: 'text-gray-400', defaults: { type: 'sleep', dur: 1000, val: 0, bri: 0 } }
];