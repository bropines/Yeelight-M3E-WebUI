import { serve } from "bun";
import { YeelightDevice } from "./lib/device";
import { DiscoveryService } from "./lib/discovery";
import { MusicService } from "./lib/music";
import { generateFireSequence, Presets } from "./lib/flows";
import { BUILDER_CONFIG } from "../../shared";

const devices = new Map<string, YeelightDevice>();
const discovery = new DiscoveryService();
const musicService = new MusicService();

// --- STATE MANAGEMENT ---
const activeIPs = new Set<string>(); // Список IP для опроса
const stateCache = new Map<string, any>(); // Кэш состояний
const runningFlows = new Map<string, boolean>(); // Флаги циклов

// Helper
const getDevice = (ip: string) => {
    if (!devices.has(ip)) devices.set(ip, new YeelightDevice(ip));
    // Добавляем в список опроса, если пришел запрос
    activeIPs.add(ip); 
    return devices.get(ip)!;
};

// --- BACKGROUND POLLING LOOP (1 sec) ---
setInterval(async () => {
    for (const ip of activeIPs) {
        try {
            // Если включен музыкальный режим или сложный флоу, опрос может мешать,
            // но для простоты опрашиваем всегда.
            const dev = getDevice(ip);
            // Используем таймаут поменьше для опроса
            const props = await dev.send("get_prop", ["power", "bright", "ct", "rgb", "color_mode"]);
            if (props) {
                stateCache.set(ip, props);
            }
        } catch (e) {
            // Если ошибка — можно пометить как оффлайн в кэше
            // stateCache.delete(ip); 
        }
    }
}, 5000);

// --- HELPERS ---
const parseColor = (val: string | number): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.startsWith('#')) {
        return parseInt(val.substring(1), 16);
    }
    return 0xFFFFFF;
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// --- SERVER ---
serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

        const ip = url.searchParams.get("ip");

        // 1. Config & Discovery
        if (url.pathname === "/api/builder/config") return Response.json(BUILDER_CONFIG, { headers: corsHeaders });
        
        if (url.pathname === "/api/discover") {
            const ips = await discovery.scan();
            // Добавляем найденные в опрос
            ips.forEach(i => activeIPs.add(i));
            return Response.json(ips, { headers: corsHeaders });
        }

        // 2. Status (INSTANT CACHE)
        if (url.pathname === "/api/status") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            
            // Регистрируем IP для поллинга
            activeIPs.add(ip);
            
            // Отдаем кэш или пустой массив, если данных еще нет
            const cached = stateCache.get(ip);
            if (cached) {
                return Response.json(cached, { headers: corsHeaders });
            } else {
                // Если кэша нет, пробуем получить синхронно 1 раз
                try {
                    const dev = getDevice(ip);
                    const props = await dev.send("get_prop", ["power", "bright", "ct", "rgb", "color_mode"]);
                    stateCache.set(ip, props);
                    return Response.json(props, { headers: corsHeaders });
                } catch {
                    return new Response("Error", { status: 500, headers: corsHeaders });
                }
            }
        }

        // 3. Actions
        if (url.pathname === "/api/act") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            const dev = getDevice(ip);
            const type = url.searchParams.get("type");
            const val = url.searchParams.get("val");

            runningFlows.set(ip, false); // Stop flows on manual action

            // Optimistic update of cache (optional, but good for UI responsiveness)
            // Мы обновляем кэш вручную, чтобы поллинг не перетер его старым значением мгновенно
            const currentCache = stateCache.get(ip) || [];
            
            if (type === "toggle") {
                await dev.send("toggle");
                // Инвертируем кэш для мгновенной реакции UI при следующем опросе
                if (currentCache[0]) currentCache[0] = currentCache[0] === 'on' ? 'off' : 'on';
            }
            else if (type === "bright") {
                const v = parseInt(val!);
                await dev.send("set_bright", [v, "smooth", 500]);
                currentCache[1] = v.toString();
            }
            else if (type === "temp") {
                const v = parseInt(val!);
                await dev.send("set_ct_abx", [v, "smooth", 500]);
                currentCache[2] = v.toString();
            }
            else if (type === "color") {
                const v = parseInt(val!);
                await dev.send("set_rgb", [v, "smooth", 500]);
                currentCache[3] = v.toString();
            }
            else if (type === "stop") await dev.send("stop_cf");
            
            stateCache.set(ip, currentCache);
            return new Response("OK", { headers: corsHeaders });
        }

        // 4. Scenes
        if (url.pathname === "/api/scene") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            runningFlows.set(ip, false);
            const name = url.searchParams.get("name");
            const dev = getDevice(ip);

            if (name === "fire") await dev.send("start_cf", [0, 1, generateFireSequence()]);
            else if (name && Presets[name]) await dev.send("start_cf", [0, 1, Presets[name]()]);
            
            return new Response("OK", { headers: corsHeaders });
        }

        // 5. Custom Flow (Loop)
        if (url.pathname === "/api/custom_flow" && req.method === "POST") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            try {
                const body = await req.json();
                const steps = body.steps;
                const isLoop = body.loop === true;

                if (!Array.isArray(steps)) return new Response("Invalid steps", { status: 400, headers: corsHeaders });

                runningFlows.set(ip, true);

                (async () => {
                    const dev = getDevice(ip);
                    await dev.send("stop_cf");
                    do {
                        for (const step of steps) {
                            if (runningFlows.get(ip) === false) return;
                            const dur = Math.max(100, parseInt(step.dur) || 1000);
                            const bri = Math.max(1, parseInt(step.bri) || 100);

                            try {
                                switch (step.type) {
                                    case 'color':
                                        await dev.send("set_rgb", [parseColor(step.val), "smooth", dur]);
                                        break;
                                    case 'gradient':
                                        await dev.send("set_rgb", [parseColor(step.start), "sudden", 0]);
                                        await dev.send("set_bright", [bri, "sudden", 0]);
                                        await dev.send("set_rgb", [parseColor(step.end), "smooth", dur]);
                                        break;
                                    case 'flash':
                                    case 'pulse':
                                        const color = parseColor(step.val);
                                        const half = Math.max(50, Math.floor(dur / 2));
                                        const endBri = step.type === 'pulse' ? Math.max(1, Math.floor(bri * 0.3)) : 1;
                                        const flow = `${half},1,${color},${bri},${half},1,${color},${endBri}`;
                                        await dev.send("start_cf", [1, 1, flow]);
                                        break;
                                }
                                await sleep(dur);
                            } catch (e) {}
                        }
                    } while (isLoop && runningFlows.get(ip) === true);
                })();

                return new Response("Flow Started", { headers: corsHeaders });
            } catch (e) { return new Response("Err", { status: 500, headers: corsHeaders }); }
        }

        // 6. Music Mode
        if (url.pathname === "/api/music/start") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            const dev = getDevice(ip);
            await dev.send("set_music", [1, musicService.getHost(), musicService.getPort()]);
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