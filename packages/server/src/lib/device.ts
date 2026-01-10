import { Socket } from "net";

export class YeelightDevice {
    private socket: Socket | null = null;
    private msgId = 1;
    private connected = false;

    constructor(private ip: string, private port = 55443) {}

    private connect(): Promise<void> {
        if (this.connected && this.socket && !this.socket.destroyed) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            this.socket = new Socket();
            this.socket.setTimeout(2000);
            this.socket.connect(this.port, this.ip, () => {
                this.connected = true;
                resolve();
            });
            this.socket.on('error', (e) => {
                this.disconnect();
                // Не реджектим, чтобы не валить сервер, просто логируем
                console.error(`[${this.ip}] Error: ${e.message}`);
            });
            this.socket.on('close', () => this.disconnect());
        });
    }

    disconnect() {
        if (this.socket) this.socket.destroy();
        this.socket = null;
        this.connected = false;
    }

    async send(method: string, params: any[] = []): Promise<any> {
        try {
            await this.connect();
            return await this._write(method, params);
        } catch (e) {
            console.error(`[${this.ip}] Cmd Failed: ${method}`);
            return null;
        }
    }

    private _write(method: string, params: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.socket) return reject("No socket");
            const id = this.msgId++;
            const payload = JSON.stringify({ id, method, params }) + "\r\n";
            
            const onData = (data: Buffer) => {
                const str = data.toString();
                if(str.includes(`"id":${id}`)) {
                    this.socket?.removeListener('data', onData);
                    try { resolve(JSON.parse(str).result); } catch { resolve(null); }
                }
            };

            this.socket.on('data', onData);
            this.socket.write(payload);
        });
    }
}