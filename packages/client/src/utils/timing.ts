// Ограничивает частоту вызова (раз в limit мс)
// Подходит для: обновления UI, визуализатора музыки
export function throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Откладывает вызов до тех пор, пока поток событий не прекратится на delay мс
// Подходит для: отправки команд на лампу при движении слайдера
export function debounce(func: Function, delay: number) {
    let timeoutId: any;
    return function(this: any, ...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    }
}