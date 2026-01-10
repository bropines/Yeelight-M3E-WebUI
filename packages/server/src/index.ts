import { serve } from "bun";
import { YeelightDevice } from "./lib/device";
import { DiscoveryService } from "./lib/discovery";
import { MusicService } from "./lib/music";
import { generateFireSequence, Presets } from "./lib/flows";
import { BUILDER_CONFIG } from "../../shared";

const devices = new Map<string, YeelightDevice>();
const discovery = new DiscoveryService();
const musicService = new MusicService();

// Helper
const getDevice = (ip: string) => {
    if (!devices.has(ip)) devices.set(ip, new YeelightDevice(ip));
    return devices.get(ip)!;
};

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

        // 3. Actions
        if (url.pathname === "/api/act") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            const dev = getDevice(ip);
            const type = url.searchParams.get("type");
            const val = url.searchParams.get("val");

            if (type === "toggle") await dev.send("toggle");
            else if (type === "bright") await dev.send("set_bright", [parseInt(val!), "smooth", 500]);
            else if (type === "temp") await dev.send("set_ct_abx", [parseInt(val!), "smooth", 500]);
            else if (type === "color") await dev.send("set_rgb", [parseInt(val!), "smooth", 500]);
            else if (type === "stop") await dev.send("stop_cf");
            
            return new Response("OK", { headers: corsHeaders });
        }

        // 4. Scenes
        if (url.pathname === "/api/scene") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            const name = url.searchParams.get("name");
            const dev = getDevice(ip);

            if (name === "fire") await dev.send("start_cf", [0, 2, generateFireSequence()]);
            else if (name && Presets[name]) await dev.send("start_cf", [0, 2, Presets[name]()]);
            
            return new Response("OK", { headers: corsHeaders });
        }

        // 5. Music Mode
        if (url.pathname === "/api/music/start") {
            if (!ip) return new Response("IP Missing", { status: 400, headers: corsHeaders });
            const dev = getDevice(ip);
            // IP сервера музыки (хоста)
            const myIp = musicService.getHost();
            const myPort = musicService.getPort();
            console.log(`🎵 Connecting lamp ${ip} to music server at ${myIp}:${myPort}`);
            await dev.send("set_music", [1, myIp, myPort]);
            return new Response("OK", { headers: corsHeaders });
        }

        if (url.pathname === "/api/music/update") {
            // Быстрый UDP-подобный поток через TCP музыку
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