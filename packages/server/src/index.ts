import { serve } from "bun";
import { YeelightDevice } from "./lib/device";
import { DiscoveryService } from "./lib/discovery";
import { MusicService } from "./lib/music";
import { generateFireSequence, Presets } from "./lib/flows";
import { BUILDER_CONFIG } from "../../shared";

const devices = new Map<string, YeelightDevice>();
const discovery = new DiscoveryService();
const musicService = new MusicService();

// Хранилище флагов для остановки бесконечных циклов
const runningFlows = new Map<string, boolean>();

// Helper
const getDevice = (ip: string) => {
    if (!devices.has(ip)) devices.set(ip, new YeelightDevice(ip));
    return devices.get(ip)!;
};

// Хелпер для парсинга цветов
const parseColor = (val: string | number): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.startsWith('#')) {
        return parseInt(val.substring(1), 16);
    }
    return 0xFFFFFF;
};

// Функция паузы
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// CORS Headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        
        // Handle CORS preflight
        if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

        const ip = url.searchParams.get("ip");

        // --- API ROUTES ---

        // 1. Config & Discovery
        if (url.pathname === "/api/builder/config") return Response.json(BUILDER_CONFIG, { headers: corsHeaders });
        
        if (url.pathname === "/api/discover") {
            const ips = await discovery.scan();
            return Response.json(ips, { headers: corsHeaders });
        }

        // 2. Status
        if (url.pathname === "/api/status") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            try {
                const dev = getDevice(ip);
                const props = await dev.send("get_prop", ["power", "bright", "ct", "rgb", "color_mode"]);
                return Response.json(props, { headers: corsHeaders });
            } catch (e) { return new Response("Error", { status: 500, headers: corsHeaders }); }
        }

        // 3. Actions (Simple)
        if (url.pathname === "/api/act") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            const dev = getDevice(ip);
            const type = url.searchParams.get("type");
            const val = url.searchParams.get("val");

            // При любой ручной команде останавливаем текущий цикл сервера
            runningFlows.set(ip, false);

            if (type === "toggle") await dev.send("toggle");
            else if (type === "bright") await dev.send("set_bright", [parseInt(val!), "smooth", 500]);
            else if (type === "temp") await dev.send("set_ct_abx", [parseInt(val!), "smooth", 500]);
            else if (type === "color") await dev.send("set_rgb", [parseInt(val!), "smooth", 500]);
            else if (type === "stop") await dev.send("stop_cf");
            
            return new Response("OK", { headers: corsHeaders });
        }

        // 4. Scenes (Presets)
        if (url.pathname === "/api/scene") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            runningFlows.set(ip, false); // Stop custom flows
            
            const name = url.searchParams.get("name");
            const dev = getDevice(ip);

            if (name === "fire") await dev.send("start_cf", [0, 1, generateFireSequence()]);
            else if (name && Presets[name]) await dev.send("start_cf", [0, 1, Presets[name]()]);
            
            return new Response("OK", { headers: corsHeaders });
        }

        // 5. Custom Flow Builder (SEQUENTIAL EXECUTOR + LOOP)
        if (url.pathname === "/api/custom_flow" && req.method === "POST") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            
            try {
                const body = await req.json();
                const steps = body.steps;
                const isLoop = body.loop === true; // Флаг бесконечного цикла

                if (!Array.isArray(steps) || steps.length === 0) {
                    return new Response("Invalid steps", { status: 400, headers: corsHeaders });
                }

                // Запускаем флаг работы
                runningFlows.set(ip, true);

                // Асинхронное выполнение
                (async () => {
                    const dev = getDevice(ip);
                    console.log(`[${ip}] Starting flow (Loop: ${isLoop})...`);

                    await dev.send("stop_cf");
                    
                    // Бесконечный цикл, если isLoop = true, иначе 1 раз
                    do {
                        for (const step of steps) {
                            // Проверяем флаг отмены перед каждым шагом
                            if (runningFlows.get(ip) === false) {
                                console.log(`[${ip}] Flow aborted by user.`);
                                return;
                            }

                            const dur = Math.max(100, parseInt(step.dur) || 1000);
                            const bri = Math.max(1, parseInt(step.bri) || 100);

                            try {
                                switch (step.type) {
                                    case 'color': {
                                        const color = parseColor(step.val);
                                        await dev.send("set_rgb", [color, "smooth", dur]);
                                        break;
                                    }
                                    case 'gradient': {
                                        const start = parseColor(step.start);
                                        const end = parseColor(step.end);
                                        // 1. Мгновенно начало
                                        await dev.send("set_rgb", [start, "sudden", 0]);
                                        await dev.send("set_bright", [bri, "sudden", 0]); // Убеждаемся в яркости
                                        // 2. Плавно конец
                                        await dev.send("set_rgb", [end, "smooth", dur]);
                                        break;
                                    }
                                    case 'flash': {
                                        const color = parseColor(step.val);
                                        const half = Math.max(50, Math.floor(dur / 2));
                                        // Вспышка через нативный CF
                                        const flow = `${half},1,${color},${bri},${half},1,${color},1`;
                                        await dev.send("start_cf", [1, 1, flow]);
                                        break;
                                    }
                                    case 'pulse': {
                                        const color = parseColor(step.val);
                                        const half = Math.max(50, Math.floor(dur / 2));
                                        const minBri = Math.max(1, Math.floor(bri * 0.3));
                                        const flow = `${half},1,${color},${bri},${half},1,${color},${minBri}`;
                                        await dev.send("start_cf", [1, 1, flow]);
                                        break;
                                    }
                                    case 'sleep': {
                                        break;
                                    }
                                }
                                await sleep(dur);

                            } catch (err) {
                                console.error(`[${ip}] Step failed:`, err);
                            }
                        }
                    } while (isLoop && runningFlows.get(ip) === true);

                    console.log(`[${ip}] Flow finished.`);
                })();

                return new Response("Flow Started", { headers: corsHeaders });

            } catch (e) {
                console.error(e);
                return new Response("Server Error", { status: 500, headers: corsHeaders });
            }
        }

        // 6. Music Mode
        if (url.pathname === "/api/music/start") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            const dev = getDevice(ip);
            const myIp = musicService.getHost();
            const myPort = musicService.getPort();
            await dev.send("set_music", [1, myIp, myPort]);
            return new Response("OK", { headers: corsHeaders });
        }

        if (url.pathname === "/api/music/update") {
            const bri = url.searchParams.get("bri");
            const color = url.searchParams.get("color");
            if (color) musicService.send("set_rgb", [parseInt(color), "sudden", 0]);
            if (bri) musicService.send("set_bright", [parseInt(bri), "sudden", 0]);
            return new Response("OK", { headers: corsHeaders });
        }

        return new Response("Not Found", { status: 404, headers: corsHeaders });
    }
});

console.log("💡 Server running on http://localhost:3000");