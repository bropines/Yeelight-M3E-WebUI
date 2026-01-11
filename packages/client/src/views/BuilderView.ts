import jsyaml from 'js-yaml';
import iro from '@jaames/iro'; // Вернули Iro.js
import { BUILDER_CONFIG } from '@yeelight/shared';

export class BuilderView {
    private steps: any[] = [];
    private yamlEditor: HTMLTextAreaElement | null = null;
    private isLooping: boolean = false;
    
    // Ссылки на элементы диалога
    private activeEditTarget: { idx: number, key: string } | null = null;
    private nativeDialog: HTMLDialogElement | null = null;
    private iroPicker: any = null; // Экземпляр iro.js

    constructor(root: HTMLElement) {
        const container = document.createElement('div');
        container.className = "flex flex-col md:flex-row h-full gap-6 animate-fade-in pb-20 md:pb-0"; 
        
        // --- LEFT: Visual Builder ---
        const leftPanel = document.createElement('div');
        leftPanel.className = "flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden relative";
        
        // Toolbar
        let toolbarHtml = `<div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar shrink-0">`;
        BUILDER_CONFIG.forEach(item => {
            toolbarHtml += `
            <button class="add-step-btn bg-surface-container-high border border-white/10 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition shrink-0 active:scale-95" data-id="${item.id}">
                <m3e-icon name="${item.icon}" class="${item.color}"></m3e-icon>
                <span class="text-xs font-bold uppercase tracking-wider">${item.label}</span>
            </button>`;
        });
        toolbarHtml += `</div>`;
        
        // --- NATIVE DIALOG (iro.js version) ---
        const dialogHtml = `
            <dialog id="nativeColorDialog" class="bg-surface-container-high text-on-surface p-0 rounded-3xl backdrop:bg-black/60 shadow-2xl border border-white/10 outline-none open:animate-in open:fade-in open:zoom-in-95 duration-200">
                <div class="flex flex-col w-[340px] overflow-hidden">
                    
                    <!-- Header -->
                    <div class="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <span class="text-title-medium font-bold">Выбор цвета</span>
                        <m3e-icon-button id="btnHeaderClose" density="-1">
                            <m3e-icon name="close"></m3e-icon>
                        </m3e-icon-button>
                    </div>

                    <!-- Content -->
                    <div class="flex flex-col items-center gap-6 py-6 px-6">
                        <!-- Контейнер для Iro.js -->
                        <div class="p-4 bg-black/20 rounded-full border border-white/5 shadow-inner">
                            <div id="iroMountPoint"></div>
                        </div>
                        
                        <div class="flex items-center gap-3 bg-surface-variant/50 px-4 py-3 rounded-xl border border-white/5 w-full">
                            <span class="text-gray-500 font-bold text-lg">#</span>
                            <input type="text" id="builderHexInput" class="bg-transparent border-none outline-none font-mono text-xl w-full text-center uppercase text-white placeholder-white/20" maxlength="6">
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="px-6 py-4 flex justify-end gap-2 border-t border-white/5 bg-surface-container/50">
                        <m3e-button variant="text" id="btnCancelColor">Отмена</m3e-button>
                        <m3e-button variant="filled" id="btnSaveColor">Применить</m3e-button>
                    </div>
                </div>
            </dialog>
        `;

        leftPanel.innerHTML = `
            ${toolbarHtml}
            <div id="stepsList" class="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar rounded-2xl pb-4"></div>
            ${dialogHtml}
        `;

        // --- RIGHT: Config & YAML ---
        const rightPanel = document.createElement('div');
        rightPanel.className = "w-full md:w-80 flex flex-col bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden shadow-xl shrink-0 h-64 md:h-auto";
        rightPanel.innerHTML = `
            <div class="bg-surface-container px-4 py-3 text-xs font-bold text-gray-400 border-b border-white/5 flex justify-between items-center shrink-0">
                <span>CONFIG</span>
                <div class="flex gap-2">
                    <m3e-icon-button class="text-error" id="btnStopFlow" title="Остановить и сбросить">
                        <m3e-icon name="stop_circle"></m3e-icon>
                    </m3e-icon-button>
                    <m3e-button variant="filled" class="scale-90 origin-right" id="btnRunFlow">
                        <m3e-icon slot="icon" name="play_arrow"></m3e-icon>
                        ЗАПУСК
                    </m3e-button>
                </div>
            </div>
            
            <div class="p-4 border-b border-white/5 bg-surface-container/50">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-bold text-on-surface flex items-center gap-2">
                        <m3e-icon name="all_inclusive" class="text-primary"></m3e-icon>
                        Бесконечный повтор
                    </label>
                    <m3e-switch id="loopSwitch"></m3e-switch>
                </div>
            </div>

            <div class="flex-1 relative">
                <textarea id="yamlArea" class="w-full h-full bg-transparent p-4 text-xs font-mono text-gray-300 outline-none resize-none leading-relaxed absolute inset-0" spellcheck="false" placeholder="YAML Code..."></textarea>
            </div>
        `;

        container.appendChild(leftPanel);
        container.appendChild(rightPanel);
        root.appendChild(container);

        this.yamlEditor = rightPanel.querySelector('#yamlArea');
        this.nativeDialog = leftPanel.querySelector('#nativeColorDialog');
        
        // Listeners
        this.initDialogListeners(leftPanel);
        this.initListeners(leftPanel, rightPanel);
    }

    // --- COLOR PICKER LOGIC ---

    initDialogListeners(panel: HTMLElement) {
        const mountPoint = panel.querySelector('#iroMountPoint') as HTMLElement;
        const hexInput = panel.querySelector('#builderHexInput') as HTMLInputElement;

        // Lazy Init Iro.js (чтобы не создавать, пока не нужно)
        // Но создадим один раз и будем переиспользовать
        this.iroPicker = new iro.ColorPicker(mountPoint, {
            width: 220, // Размер круга
            layout: [{ component: iro.ui.Wheel }],
            borderWidth: 3,
            borderColor: "#ffffff40",
            color: "#FFFFFF"
        });

        // 1. Picker -> Input
        this.iroPicker.on('input:move', (c: any) => {
            hexInput.value = c.hexString.substring(1).toUpperCase();
        });

        // 2. Input -> Picker
        hexInput?.addEventListener('input', (e: any) => {
            const hex = e.target.value;
            if(/^[0-9A-Fa-f]{6}$/.test(hex)) {
                this.iroPicker.color.hexString = "#" + hex;
            }
        });

        const closeDialog = () => {
            this.nativeDialog?.close();
        };

        // 3. Save
        panel.querySelector('#btnSaveColor')?.addEventListener('click', () => {
            if (this.activeEditTarget && this.iroPicker) {
                const { idx, key } = this.activeEditTarget;
                this.steps[idx][key] = this.iroPicker.color.hexString.toUpperCase();
                this.renderSteps(true);
                closeDialog();
            }
        });

        // 4. Close Actions
        panel.querySelector('#btnCancelColor')?.addEventListener('click', closeDialog);
        panel.querySelector('#btnHeaderClose')?.addEventListener('click', closeDialog);
        
        // Close on backdrop click
        this.nativeDialog?.addEventListener('click', (e) => {
            const rect = this.nativeDialog!.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
              rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                this.nativeDialog!.close();
            }
        });
    }

    openColorPicker(idx: number, key: string, currentColor: string) {
        this.activeEditTarget = { idx, key };
        const safeColor = (currentColor && currentColor.startsWith('#')) ? currentColor : '#FFFFFF';
        
        // Обновляем состояние пикера
        if (this.iroPicker) {
            this.iroPicker.color.hexString = safeColor;
        }
        
        // Обновляем инпут
        const hexInput = this.nativeDialog?.querySelector('#builderHexInput') as HTMLInputElement;
        if (hexInput) hexInput.value = safeColor.substring(1).toUpperCase();

        this.nativeDialog?.showModal();
        
        // Костыль для iro.js: Иногда при открытии в display:none контейнере (диалоге)
        // он может некорректно посчитать размеры. Делаем resize после отрисовки.
        requestAnimationFrame(() => {
            if (this.iroPicker) this.iroPicker.resize(220);
        });
    }

    // --- RENDER STEPS (COMPACT ROW LAYOUT) ---

    renderSteps(updateYaml = true) {
        const list = document.getElementById('stepsList');
        if(!list) return;
        
        if (this.steps.length === 0) {
             list.innerHTML = `<div class="text-center opacity-30 mt-20 text-sm flex flex-col items-center gap-2"><m3e-icon name="playlist_add" class="text-4xl"></m3e-icon><span>Добавьте шаги</span></div>`;
             if(updateYaml && this.yamlEditor) this.yamlEditor.value = '';
             return;
        }

        list.innerHTML = '';

        this.steps.forEach((step, idx) => {
            const conf = BUILDER_CONFIG.find(c => c.id === step.type);
            const el = document.createElement('div');
            
            el.className = "bg-surface-container px-4 py-3 rounded-xl border border-white/5 flex flex-wrap md:flex-nowrap items-center gap-4 group animate-fade-in hover:border-white/20 hover:bg-surface-container-high transition-all shadow-sm";
            
            // 1. Icon & Type
            const typeCol = `
                <div class="flex items-center gap-3 w-40 shrink-0">
                    <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                        <m3e-icon name="${conf?.icon}" class="${conf?.color} text-[20px]"></m3e-icon>
                    </div>
                    <div class="flex flex-col overflow-hidden">
                        <span class="text-sm font-bold uppercase tracking-wider text-on-surface truncate" title="${conf?.label}">${conf?.label || step.type}</span>
                        <span class="text-[10px] opacity-40 font-mono">STEP ${idx + 1}</span>
                    </div>
                </div>
            `;

            // 2. Middle Controls (Fluid)
            let controlsHtml = '';

            if (step.type === 'color' || step.type === 'flash' || step.type === 'pulse') {
                controlsHtml += this.renderColorTrigger(idx, 'val', step.val);
            } 
            else if (step.type === 'gradient') {
                controlsHtml += `
                    <div class="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5 w-full max-w-[300px]">
                        ${this.renderColorTrigger(idx, 'start', step.start, true)}
                        <div class="flex-1 h-1 bg-gradient-to-r from-white/10 to-white/10 rounded-full mx-2 relative">
                             <div class="absolute inset-0 rounded-full opacity-50" style="background: linear-gradient(to right, ${step.start}, ${step.end})"></div>
                        </div>
                        <button class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition swap-btn shrink-0" data-idx="${idx}" title="Поменять местами">
                            <m3e-icon name="sync_alt" class="text-[16px]"></m3e-icon>
                        </button>
                        ${this.renderColorTrigger(idx, 'end', step.end, true)}
                    </div>
                `;
            }

            // 3. Parameters
            const paramsHtml = `
                <div class="flex items-center gap-3 ml-auto shrink-0">
                    <div class="flex items-center bg-black/20 rounded-lg px-3 h-10 border border-white/5 focus-within:border-primary/50 transition-colors group/inp" title="Длительность">
                        <m3e-icon name="timer" class="text-[16px] opacity-40 mr-2 group-focus-within/inp:text-primary"></m3e-icon>
                        <input type="number" class="bg-transparent w-16 text-sm text-white outline-none font-mono text-right step-input" 
                            data-idx="${idx}" data-key="dur" value="${step.dur}">
                        <span class="text-[10px] opacity-40 ml-1 font-bold">MS</span>
                    </div>

                    ${step.type !== 'sleep' ? `
                    <div class="flex items-center bg-black/20 rounded-lg px-3 h-10 border border-white/5 focus-within:border-primary/50 transition-colors group/inp" title="Яркость">
                        <m3e-icon name="brightness_6" class="text-[16px] opacity-40 mr-2 group-focus-within/inp:text-primary"></m3e-icon>
                        <input type="number" min="1" max="100" class="bg-transparent w-12 text-sm text-white outline-none font-mono text-center step-input" 
                            data-idx="${idx}" data-key="bri" value="${step.bri || 100}">
                        <span class="text-[10px] opacity-40 ml-1 font-bold">%</span>
                    </div>` : ''}
                </div>
            `;

            // 4. Actions
            const actionsHtml = `
                <div class="flex items-center gap-1 border-l border-white/10 pl-3 ml-2 shrink-0">
                    <button class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-on-surface-variant transition active:scale-90 dup-btn" title="Дублировать" data-idx="${idx}">
                        <m3e-icon name="content_copy" class="text-[20px]"></m3e-icon>
                    </button>
                    <button class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-400 transition active:scale-90 del-btn" title="Удалить" data-idx="${idx}">
                        <m3e-icon name="delete" class="text-[20px]"></m3e-icon>
                    </button>
                </div>
            `;

            el.innerHTML = typeCol + `<div class="flex-1 flex items-center gap-4 overflow-x-auto custom-scrollbar min-w-0">${controlsHtml}</div>` + paramsHtml + actionsHtml;
            list.appendChild(el);
        });

        this.attachRowListeners(list);

        if(updateYaml && this.yamlEditor) {
            this.yamlEditor.value = jsyaml.dump(this.steps);
        }
    }

    renderColorTrigger(idx: number, key: string, value: string, compact = false) {
        if(compact) {
            return `
                <button class="color-trigger w-8 h-8 rounded-lg border border-white/20 shadow-sm hover:scale-105 transition-transform cursor-pointer shrink-0" 
                    style="background-color: ${value}" 
                    data-idx="${idx}" data-key="${key}" title="${value}">
                </button>
            `;
        }
        return `
            <button class="color-trigger h-10 pl-1.5 pr-4 rounded-xl border border-white/10 bg-black/20 flex items-center gap-3 hover:bg-white/5 transition-all cursor-pointer group active:scale-95" 
                data-idx="${idx}" data-key="${key}">
                <div class="w-7 h-7 rounded-lg shadow-sm border border-white/20 group-hover:scale-105 transition-transform" style="background-color: ${value}"></div>
                <span class="text-sm font-mono text-white/90 uppercase tracking-widest">${value}</span>
            </button>
        `;
    }

    initListeners(leftPanel: HTMLElement, rightPanel: HTMLElement) {
        leftPanel.querySelectorAll('.add-step-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const conf = BUILDER_CONFIG.find(c => c.id === id);
                if(conf) {
                    this.steps.push(JSON.parse(JSON.stringify(conf.defaults)));
                    this.renderSteps();
                }
            });
        });

        this.yamlEditor?.addEventListener('input', () => {
            try {
                const parsed = jsyaml.load(this.yamlEditor!.value);
                if(Array.isArray(parsed)) {
                    this.steps = parsed;
                    this.renderSteps(false);
                }
            } catch(e) {}
        });

        rightPanel.querySelector('#btnRunFlow')?.addEventListener('click', () => this.run());
        rightPanel.querySelector('#btnStopFlow')?.addEventListener('click', () => {
            const ip = localStorage.getItem('bulb_ip');
            if(ip) fetch(`/api/act?ip=${ip}&type=stop`);
        });

        const loopSwitch = rightPanel.querySelector('#loopSwitch') as any;
        loopSwitch?.addEventListener('change', (e: any) => {
            this.isLooping = e.target.checked;
        });
    }

    attachRowListeners(list: HTMLElement) {
        list.querySelectorAll('.step-input').forEach(inp => {
            inp.addEventListener('change', (e: any) => {
                const idx = parseInt(e.target.dataset.idx);
                const key = e.target.dataset.key;
                let val = parseInt(e.target.value);
                this.steps[idx][key] = val;
                this.renderSteps(true); 
            });
        });

        list.querySelectorAll('.color-trigger').forEach(btn => {
            btn.addEventListener('click', (e: any) => {
                const target = e.target.closest('.color-trigger');
                const idx = parseInt(target.getAttribute('data-idx'));
                const key = target.getAttribute('data-key');
                const currentColor = this.steps[idx][key];
                this.openColorPicker(idx, key, currentColor);
            });
        });

        list.querySelectorAll('.swap-btn').forEach(btn => {
            btn.addEventListener('click', (e: any) => {
                const target = e.target.closest('.swap-btn');
                const idx = parseInt(target.getAttribute('data-idx'));
                const temp = this.steps[idx].start;
                this.steps[idx].start = this.steps[idx].end;
                this.steps[idx].end = temp;
                this.renderSteps(true);
            });
        });

        list.querySelectorAll('.dup-btn').forEach(btn => {
            btn.addEventListener('click', (e: any) => {
                const target = e.target.closest('.dup-btn');
                const idx = parseInt(target.getAttribute('data-idx'));
                const clone = JSON.parse(JSON.stringify(this.steps[idx]));
                this.steps.splice(idx + 1, 0, clone);
                this.renderSteps(true);
            });
        });

        list.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', (e: any) => {
                const target = e.target.closest('.del-btn');
                const idx = parseInt(target.getAttribute('data-idx'));
                this.steps.splice(idx, 1);
                this.renderSteps(true);
            });
        });
    }

    async run() {
        const ip = localStorage.getItem('bulb_ip');
        if(!ip) return;
        await fetch(`/api/custom_flow?ip=${ip}`, {
            method: 'POST',
            body: JSON.stringify({ 
                steps: this.steps,
                loop: this.isLooping 
            })
        });
    }
}