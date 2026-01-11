import { Socket } from "net";

// Интерфейс для задачи в очереди
interface QueueTask {
    payload: string;
    id: number;
    resolve: (val: any) => void;
    reject: (err: any) => void;
}

export class YeelightDevice {
    private socket: Socket | null = null;
    private msgId = 1;
    private connected = false;
    
    // Очередь команд
    private commandQueue: QueueTask[] = [];
    private isSending = false;

    // ЗАДЕРЖКА МЕЖДУ КОМАНДАМИ (мс)
    // 100мс - безопасно для обычного режима.
    // Если включен Music Mode, этот механизм лучше обходить (см. music.ts).
    private readonly CMD_DELAY = 100; 

    constructor(private ip: string, private port = 55443) {}

    // ... (метод connect оставляем как был) ...
    private connect(): Promise<void> {
        if (this.connected && this.socket && !this.socket.destroyed) return Promise.resolve();
        return new Promise((resolve, reject) => {
            this.socket = new Socket();
            this.socket.setTimeout(3000); // Таймаут соединения
            this.socket.connect(this.port, this.ip, () => {
                this.connected = true;
                resolve();
            });
            this.socket.on('data', (data) => this.handleMessage(data));
            this.socket.on('error', (e) => {
                console.error(`[${this.ip}] Err: ${e.message}`);
                this.disconnect();
            });
            this.socket.on('close', () => this.disconnect());
        });
    }

    disconnect() {
        if (this.socket) this.socket.destroy();
        this.socket = null;
        this.connected = false;
        this.isSending = false;
    }

    // Публичный метод отправки теперь просто кладет в очередь
    async send(method: string, params: any[] = []): Promise<any> {
        const id = this.msgId++;
        const payload = JSON.stringify({ id, method, params }) + "\r\n";

        return new Promise((resolve, reject) => {
            this.commandQueue.push({ payload, id, resolve, reject });
            this.processQueue();
        });
    }

    // Обработчик очереди
    private async processQueue() {
        if (this.isSending || this.commandQueue.length === 0) return;

        this.isSending = true;
        
        // Берем первую задачу
        const task = this.commandQueue[0]; 

        try {
            await this.connect();
            
            // Отправляем
            if(this.socket && !this.socket.destroyed) {
                this.socket.write(task.payload);
            } else {
                throw new Error("Socket closed");
            }

            // Ждем ответа (логика ожидания должна быть внутри handleMessage, 
            // но для простоты здесь мы просто делаем паузу перед следующим выстрелом)
            
            // ВАЖНО: Искусственная задержка, чтобы лампа успела "прожевать"
            await new Promise(r => setTimeout(r, this.CMD_DELAY));

        } catch (e) {
            // Если ошибка отправки, реджектим текущую задачу
            task.reject(e);
            this.commandQueue.shift(); // Удаляем
        } finally {
            this.isSending = false;
            // Рекурсивно запускаем обработку следующей задачи
            if (this.commandQueue.length > 0) this.processQueue();
        }
    }

    // Обработка входящих сообщений от лампы
    private handleMessage(data: Buffer) {
        const str = data.toString();
        // Пытаемся найти ID в ответе и разрезолвить задачу
        try {
            const msgs = str.split('\r\n');
            msgs.forEach(msg => {
                if(!msg) return;
                const json = JSON.parse(msg);
                
                // Находим задачу в очереди, которая соответствует ID ответа
                // Примечание: в реальной сложной очереди порядок может сбиться, 
                // если лампа отвечает асинхронно, но Yeelight обычно отвечает FIFO.
                const taskIndex = this.commandQueue.findIndex(t => t.id === json.id);
                
                if (taskIndex !== -1) {
                    const task = this.commandQueue[taskIndex];
                    if (json.error) task.reject(json.error);
                    else task.resolve(json.result);
                    
                    // Удаляем выполненную задачу из очереди
                    this.commandQueue.splice(taskIndex, 1);
                }
            });
        } catch (e) {}
    }
}