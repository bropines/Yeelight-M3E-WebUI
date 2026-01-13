export function debounce(func: Function, wait: number) {
  let timeout: any;
  return function(...args: any[]) {
    // @ts-ignore
    const context = this;
    const later = () => {
      clearTimeout(timeout);
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}