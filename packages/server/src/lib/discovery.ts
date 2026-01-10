import { createSocket } from "dgram";
import { networkInterfaces } from "os";

export class DiscoveryService {
    private foundIPs = new Set<string>();

    scan(duration = 3000): Promise<string[]> {
        return new Promise((resolve) => {
            console.log("🔍 [Discovery] --- ЗАПУСК ПОИСКА (BURST MODE) ---");
            
            const socket = createSocket("udp4");
            this.foundIPs.clear();

            const msg = Buffer.from(
                'M-SEARCH * HTTP/1.1\r\n' +
                'HOST: 239.255.255.250:1982\r\n' +
                'MAN: "ssdp:discover"\r\n' +
                'ST: wifi_bulb\r\n'
            );

            socket.on("message", (msg, rinfo) => {
                const msgStr = msg.toString();
                if (msgStr.includes("M-SEARCH")) return; // Игнорируем свои запросы

                if (!this.foundIPs.has(rinfo.address)) {
                    if (msgStr.includes("wifi_bulb") || msgStr.includes("yeelight") || msgStr.includes("Location")) {
                        console.log(`✅ [MATCH] ЛАМПА НАЙДЕНА: ${rinfo.address}`);
                        this.foundIPs.add(rinfo.address);
                    }
                }
            });

            socket.on("error", (err) => console.error(`❌ Socket Error: ${err.message}`));
            
            socket.bind(() => {
                socket.setBroadcast(true);
                
                const nets = networkInterfaces();
                const targetInterfaces: string[] = [];

                // 1. Собираем подходящие интерфейсы
                for (const name of Object.keys(nets)) {
                    for (const net of nets[name]!) {
                        if (net.family === 'IPv4' && !net.internal) {
                            targetInterfaces.push(net.address);
                        }
                    }
                }

                if (targetInterfaces.length === 0) {
                    console.error("❌ [ERROR] Нет сетевых интерфейсов!");
                    return;
                }

                // 2. Функция отправки "очередью" (3 раза с паузой 200мс)
                const sendBurst = (count: number) => {
                    if (count <= 0) return;
                    
                    targetInterfaces.forEach(addr => {
                        try {
                            socket.setMulticastInterface(addr);
                            socket.send(msg, 0, msg.length, 1982, "239.255.255.250");
                        } catch (e) { /* игнор ошибок интерфейса */ }
                    });
                    
                    console.log(`📡 [TX] Отправка пакета поиска (${count} remain)`);
                    setTimeout(() => sendBurst(count - 1), 200);
                };

                // Запускаем серию из 3 запросов
                sendBurst(3);
            });

            setTimeout(() => {
                console.log(`🏁 [Discovery] Стоп. Итого: ${this.foundIPs.size}`);
                try { socket.close(); } catch {}
                resolve(Array.from(this.foundIPs));
            }, duration);
        });
    }
}