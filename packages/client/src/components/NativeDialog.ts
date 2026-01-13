export class NativeDialog {
    private dialog: HTMLDialogElement;
    private resolvePromise: ((value: string | null) => void) | null = null;

    constructor(
        title: string, 
        contentHtml: string, 
        actions: { label: string, value: string, variant?: 'text'|'tonal'|'filled'|'outlined' }[]
    ) {
        this.dialog = document.createElement('dialog');
        
        // FIX: Убрали top-1/2 left-1/2 transform...
        // Добавили m-auto и inset-0. Браузер сам отцентрирует showModal().
        this.dialog.className = `
            bg-[#2b2930] text-[#e6e1e5] p-0 rounded-[28px] 
            backdrop:bg-black/60 backdrop:backdrop-blur-[2px] 
            shadow-2xl border border-white/5 outline-none 
            min-w-[320px] max-w-[90vw] 
            open:animate-in open:fade-in open:zoom-in-95 duration-200 
            fixed inset-0 m-auto z-[100]
        `;

        const actionsHtml = actions.map(a => 
            `<m3e-button variant="${a.variant || 'text'}" data-val="${a.value}">${a.label}</m3e-button>`
        ).join('');

        this.dialog.innerHTML = `
            <div class="flex flex-col w-full overflow-hidden">
                
                <!-- HEADER -->
                <div class="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
                    <span class="text-[24px] leading-8 text-on-surface">${title}</span>
                    <m3e-icon-button density="-1" id="dlgCloseBtn" class="text-on-surface-variant">
                        <m3e-icon name="close"></m3e-icon>
                    </m3e-icon-button>
                </div>

                <!-- CONTENT -->
                <div class="px-6 pb-2 flex flex-col gap-4 overflow-y-auto max-h-[60vh] w-full box-border">
                    ${contentHtml}
                </div>

                <!-- ACTIONS -->
                <div class="px-6 py-6 flex justify-end gap-2 shrink-0">
                    ${actionsHtml}
                </div>
            </div>
        `;

        // ВАЖНО: Добавляем внутрь темы
        const themeContainer = document.getElementById('mainTheme') || document.body;
        themeContainer.appendChild(this.dialog);

        // --- Event Listeners ---

        this.dialog.querySelectorAll('m3e-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val');
                this.close(val);
            });
        });

        this.dialog.querySelector('#dlgCloseBtn')?.addEventListener('click', () => {
            this.close(null);
        });

        this.dialog.addEventListener('click', (e) => {
            const rect = this.dialog.getBoundingClientRect();
            if (e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right) {
                this.close(null);
            }
        });
    }

    public open(): Promise<string | null> {
        this.dialog.showModal();
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    public close(result: string | null) {
        this.dialog.close();
        if (this.resolvePromise) this.resolvePromise(result);
        setTimeout(() => this.dialog.remove(), 150); 
    }

    public getElement(selector: string): HTMLElement | null {
        return this.dialog.querySelector(selector);
    }
}