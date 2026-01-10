// --- Генератор огня v2 (Optimized) ---
export function generateFireSequence(count = 0): string {
    const steps = [];
    
    // Палитра огня (HEX Int)
    // Глубокий красный, Оранжево-красный, Оранжевый, Золотой
    const colors = [0xFF0000, 0xFF4500, 0xFF8C00, 0xFFD700];
    
    // Генерируем всего 15 шагов. Лампа зациклит их сама через параметр count в start_cf.
    // Большое количество шагов переполняет буфер команд и эффект не запускается.
    const stepsToGen = 15;

    for (let i = 0; i < stepsToGen; i++) {
        // Случайный цвет из палитры
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Случайная яркость (мерцание)
        // Огонь никогда не бывает статичным по яркости
        const bri = Math.floor(Math.random() * (70 - 10) + 10); // 10% - 70%
        
        // Случайная длительность перехода
        // От 300мс до 800мс для плавности
        const dur = Math.floor(Math.random() * (800 - 300) + 300);

        // Format: duration, mode(1=rgb), value, brightness
        steps.push(`${dur},1,${color},${bri}`);
    }

    return steps.join(",");
}

// --- Хелпер для пресетов ---
class FlowBuilder {
    private steps: string[] = [];

    rgb(duration: number, r: number, g: number, b: number, brightness: number) {
        const colorInt = (r << 16) + (g << 8) + b;
        this.steps.push(`${duration},1,${colorInt},${brightness}`);
        return this;
    }

    temp(duration: number, kelvin: number, brightness: number) {
        this.steps.push(`${duration},2,${kelvin},${brightness}`);
        return this;
    }

    build(): string {
        return this.steps.join(",");
    }
}

// --- Пресеты ---
export const Presets: Record<string, () => string> = {
    police: () => new FlowBuilder()
        .rgb(200, 255, 0, 0, 100)
        .rgb(200, 0, 0, 255, 100)
        .rgb(100, 0, 0, 0, 1) // короткая пауза
        .rgb(200, 255, 0, 0, 100)
        .rgb(200, 0, 0, 255, 100)
        .build(),
        
    sunrise: () => new FlowBuilder()
        .rgb(3000, 255, 0, 0, 1) 
        .rgb(5000, 255, 100, 0, 30)
        .rgb(5000, 255, 200, 50, 60)
        .temp(5000, 4000, 80)
        .build(),
        
    disco: () => new FlowBuilder()
        .rgb(300, 255, 0, 255, 80)
        .rgb(300, 0, 255, 255, 80)
        .rgb(300, 255, 255, 0, 80)
        .rgb(300, 0, 255, 0, 80)
        .rgb(300, 255, 0, 0, 80)
        .build()
};