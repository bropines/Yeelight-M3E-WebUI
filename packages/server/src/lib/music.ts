import { Server, Socket } from "net";
import { networkInterfaces } from "os";

export class MusicService {
    private server: Server;
    private activeSockets: Set<Socket> = new Set();
    private localIP: string = "";
    private readonly PORT = 3050;

    constructor() {
        this.detectLocalIP();
        this.server = new Server((socket) => {
            console.log("🎵 Lamp connected to Music Stream");
            this.activeSockets.add(socket);
            socket.on("close", () => this.activeSockets.delete(socket));
            socket.on("error", () => this.activeSockets.delete(socket));
        });
        this.server.listen(this.PORT, "0.0.0.0");
    }

    private detectLocalIP() {
        const nets = networkInterfaces();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]!) {
                if (net.family === 'IPv4' && !net.internal && net.address.startsWith("192.168.")) {
                    this.localIP = net.address;
                    return;
                }
            }
        }
        // Fallback
        this.localIP = Object.values(nets).flat().find(n => n?.family === 'IPv4' && !n.internal)?.address || "127.0.0.1";
    }

    public getHost() { return this.localIP; }
    public getPort() { return this.PORT; }

    public send(method: string, params: any[]) {
        const msg = JSON.stringify({ id: 999, method, params }) + "\r\n";
        this.activeSockets.forEach(s => {
            if (!s.destroyed) s.write(msg);
        });
    }
}