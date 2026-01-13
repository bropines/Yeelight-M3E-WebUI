import { Socket } from "net";

interface QueueItem {
    id: number;
    method: string;
    params: any[];
    resolve: (val: any) => void;
    reject: (err: any) => void;
}

export class YeelightDevice {
    private socket: Socket | null = null;
    private msgId = 1;
    private connected = false;
    private queue: QueueItem[] = [];
    private isProcessing = false;
    private pendingRequests = new Map<number, QueueItem>(); // Ждут ответа от лампы

    // ПАУЗА МЕЖДУ КОМАНДАМИ (мс)
    // 250мс = 4 команды в секунду. Это безопасно.
    private readonly RATE_LIMIT = 250; 

    constructor(private ip: string, private port = 55443) {}

    // Публичный метод — просто кладет в очередь
    send(method: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = this.msgId++;
            this.queue.push({ id, method, params, resolve, reject });
            this.processQueue();
        });
    }

    private async connect(): Promise<void> {
        if (this.connected && this.socket && !this.socket.destroyed) return;

        return new Promise((resolve, reject) => {
            this.socket = new Socket();
            this.socket.setTimeout(5000);
            
            this.socket.connect(this.port, this.ip, () => {
                console.log(`[${this.ip}] Connected via TCP`);
                this.connected = true;
                resolve();
            });

            this.socket.on('data', (data) => this.handleData(data));
            
            this.socket.on('error', (err) => {
                console.error(`[${this.ip}] Socket Error:`, err.message);
                this.disconnect();
                reject(err);
            });

            this.socket.on('close', () => {
                this.connected = false;
            });
        });
    }

    private disconnect() {
        if (this.socket) {
            this.socket.destroy();
            this.socket = null;
        }
        this.connected = false;
        this.isProcessing = false;
    }

    // "Сердце" класса - обработчик очереди
    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (!task) break;

            try {
                await this.connect();
                
                const payload = JSON.stringify({ id: task.id, method: task.method, params: task.params }) + "\r\n";
                
                if (this.socket && !this.socket.destroyed) {
                    this.socket.write(payload);
                    // Запоминаем, что мы ждем ответ на этот ID
                    this.pendingRequests.set(task.id, task);
                    
                    // Если это специфичные команды без ответа, можно резолвить сразу, 
                    // но лучше ждать ответа лампы.
                } else {
                    throw new Error("Socket not writable");
                }

                // Ждем паузу перед отправкой СЛЕДУЮЩЕЙ команды, чтобы не зафлудить лампу
                await new Promise(r => setTimeout(r, this.RATE_LIMIT));

            } catch (e) {
                console.error(`[${this.ip}] Send failed:`, e);
                task.reject(e);
                this.disconnect();
                // Пауза перед ретраем следующей команды
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        this.isProcessing = false;
    }

    private handleData(data: Buffer) {
        const lines = data.toString().split('\r\n');
        
        lines.forEach(line => {
            if (!line) return;
            try {
                const msg = JSON.parse(line);
                
                // 1. Это ответ на команду?
                if (msg.id && this.pendingRequests.has(msg.id)) {
                    const req = this.pendingRequests.get(msg.id)!;
                    this.pendingRequests.delete(msg.id);
                    
                    if (msg.error) {
                        console.error(`[${this.ip}] Yeelight Error:`, msg.error);
                        req.reject(msg.error);
                    } else {
                        req.resolve(msg.result);
                    }
                }
                
                // 2. Это уведомление (props changed)?
                if (msg.method === 'props') {
                    // В будущем тут можно обновлять кэш без опроса
                    // console.log(`[${this.ip}] Props update:`, msg.params);
                }

            } catch (e) {
                // Игнорируем битые JSON пакеты
            }
        });
    }
}