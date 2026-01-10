import jsyaml from 'js-yaml';
import { BUILDER_CONFIG } from '@yeelight/shared';

export class BuilderView {
    private steps: any[] = [];
    private yamlEditor: HTMLTextAreaElement | null = null;

    constructor(root: HTMLElement) {
        const container = document.createElement('div');
        container.className = "flex flex-col md:flex-row h-full gap-6 animate-fade-in";
        
        // --- LEFT: Visual Builder ---
        const leftPanel = document.createElement('div');
        leftPanel.className = "flex-1 flex flex-col gap-4 min-w-0"; // min-w-0 fixes flex overflow
        
        // Toolbar (FIXED ICONS)
        let toolbarHtml = `<div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">`;
        BUILDER_CONFIG.forEach(item => {
            toolbarHtml += `
            <button class="add-step-btn bg-surface-container-high border border-white/10 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition shrink-0" data-id="${item.id}">
                <m3e-icon name="${item.icon}" class="${item.color}"></m3e-icon>
                <span class="text-xs font-bold uppercase tracking-wider">${item.label}</span>
            </button>`;
        });
        toolbarHtml += `</div>`;
        
        leftPanel.innerHTML = `
            ${toolbarHtml}
            <div id="stepsList" class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar bg-black/10 rounded-2xl p-2 border border-white/5">
                <div class="text-center opacity-30 mt-20 text-sm flex flex-col items-center gap-2">
                    <m3e-icon name="playlist_add" class="text-4xl"></m3e-icon>
                    <span>Добавьте шаги из меню выше</span>
                </div>
            </div>
        `;

        // --- RIGHT: YAML ---
        const rightPanel = document.createElement('div');
        rightPanel.className = "w-full md:w-96 flex flex-col bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden shadow-xl";
        rightPanel.innerHTML = `
            <div class="bg-surface-container px-4 py-3 text-xs font-bold text-gray-400 border-b border-white/5 flex justify-between items-center">
                <span>YAML CONFIG</span>
                <m3e-button variant="tonal" class="scale-75" id="btnRunFlow">ЗАПУСК</m3e-button>
            </div>
            <textarea id="yamlArea" class="flex-1 bg-transparent p-4 text-xs font-mono text-gray-300 outline-none resize-none leading-relaxed" spellcheck="false"></textarea>
        `;

        container.appendChild(leftPanel);
        container.appendChild(rightPanel);
        root.appendChild(container);

        this.yamlEditor = rightPanel.querySelector('#yamlArea');
        
        // Listeners
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
    }

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
            el.className = "bg-surface-container p-3 rounded-xl border border-white/5 flex items-center gap-3 group animate-fade-in relative overflow-hidden";
            
            // Value display logic (color box or text)
            let valDisplay = '';
            if (step.val && step.val.startsWith('#')) {
                valDisplay = `<div class="w-full h-full rounded bg-[${step.val}] border border-white/10"></div>`;
            }

            el.innerHTML = `
                <div class="absolute left-0 top-0 bottom-0 w-1 ${conf?.color.replace('text-', 'bg-')}"></div>
                <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <m3e-icon name="${conf?.icon}" class="${conf?.color} text-lg"></m3e-icon>
                </div>
                
                <div class="flex-1 grid grid-cols-2 gap-2">
                    <div class="flex flex-col">
                        <label class="text-[10px] text-gray-500 font-bold uppercase">Время (мс)</label>
                        <input type="number" class="bg-black/20 rounded p-1.5 text-center text-xs text-white outline-none border border-transparent focus:border-primary step-input font-mono" 
                            data-idx="${idx}" data-key="dur" value="${step.dur}">
                    </div>
                    
                    ${step.val !== undefined ? 
                        `<div class="flex flex-col">
                            <label class="text-[10px] text-gray-500 font-bold uppercase">Значение</label>
                            <div class="relative">
                                <input type="text" class="w-full bg-black/20 rounded p-1.5 text-center text-xs text-white outline-none step-input font-mono" data-idx="${idx}" data-key="val" value="${step.val}">
                                ${step.val.toString().startsWith('#') ? 
                                    `<div class="absolute right-1 top-1 bottom-1 w-4 rounded" style="background:${step.val}"></div>` : ''}
                            </div>
                        </div>` 
                        : '<div></div>'}
                </div>

                <m3e-icon-button class="del-btn text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" data-idx="${idx}">
                    <m3e-icon name="close"></m3e-icon>
                </m3e-icon-button>
            `;
            list.appendChild(el);
        });

        // Listeners
        list.querySelectorAll('.step-input').forEach(inp => {
            inp.addEventListener('change', (e: any) => {
                const idx = parseInt(e.target.dataset.idx);
                const key = e.target.dataset.key;
                let val = e.target.value;
                if(key === 'dur') val = parseInt(val);
                this.steps[idx][key] = val;
                this.renderSteps(true);
            });
        });

        list.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', (e: any) => {
                // Find closest btn in case of icon click
                const target = e.target.closest('.del-btn');
                const idx = parseInt(target.getAttribute('data-idx')!);
                this.steps.splice(idx, 1);
                this.renderSteps(true);
            });
        });

        if(updateYaml && this.yamlEditor) {
            this.yamlEditor.value = jsyaml.dump(this.steps);
        }
    }

    async run() {
        const ip = localStorage.getItem('bulb_ip');
        if(!ip) return;
        await fetch(`/api/custom_flow?ip=${ip}`, {
            method: 'POST',
            body: JSON.stringify({ steps: this.steps })
        });
    }
}