import jsyaml from 'js-yaml';
import { BUILDER_CONFIG } from '@yeelight/shared';

export class BuilderView {
    private steps: any[] = [];
    private yamlEditor: HTMLTextAreaElement | null = null;

    constructor(root: HTMLElement) {
        const container = document.createElement('div');
        container.className = "flex h-full gap-6 animate-fade-in";
        
        // --- LEFT: Visual Builder ---
        const leftPanel = document.createElement('div');
        leftPanel.className = "flex-1 flex flex-col gap-4";
        
        // Toolbar
        let toolbarHtml = `<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">`;
        BUILDER_CONFIG.forEach(item => {
            toolbarHtml += `
            <button class="add-step-btn bg-surface-container border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-white/5 transition" data-id="${item.id}">
                <span class="material-symbols-rounded text-sm ${item.color}">${item.icon}</span>
                <span class="text-xs font-bold">${item.label}</span>
            </button>`;
        });
        toolbarHtml += `</div>`;
        
        leftPanel.innerHTML = `
            ${toolbarHtml}
            <div id="stepsList" class="flex-1 overflow-y-auto space-y-2 pr-2">
                <div class="text-center opacity-30 mt-10 text-sm">Добавьте шаги</div>
            </div>
        `;

        // --- RIGHT: YAML Editor ---
        const rightPanel = document.createElement('div');
        rightPanel.className = "w-96 flex flex-col bg-black/30 rounded-2xl border border-white/5 overflow-hidden hidden md:flex";
        rightPanel.innerHTML = `
            <div class="bg-surface-container px-4 py-2 text-xs font-bold text-gray-500 border-b border-white/5 flex justify-between">
                <span>YAML CONFIG</span>
                <m3e-button id="btnRunFlow" class="scale-75">ЗАПУСК</m3e-button>
            </div>
            <textarea id="yamlArea" class="flex-1 bg-transparent p-4 text-xs font-mono text-gray-400 outline-none resize-none" spellcheck="false"></textarea>
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
                    this.renderSteps(false); // don't update yaml back
                }
            } catch(e) {}
        });

        rightPanel.querySelector('#btnRunFlow')?.addEventListener('click', () => this.run());
    }

    renderSteps(updateYaml = true) {
        const list = document.getElementById('stepsList');
        if(!list) return;
        list.innerHTML = '';

        this.steps.forEach((step, idx) => {
            const conf = BUILDER_CONFIG.find(c => c.id === step.type);
            const el = document.createElement('div');
            el.className = "bg-surface-container p-3 rounded-xl border border-white/5 flex items-center gap-3 group";
            el.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <span class="material-symbols-rounded text-sm ${conf?.color}">${conf?.icon}</span>
                </div>
                <div class="flex-1 grid grid-cols-3 gap-2">
                    <input type="number" class="bg-black/20 rounded p-1 text-center text-xs text-white outline-none border border-transparent focus:border-primary step-input" 
                        data-idx="${idx}" data-key="dur" value="${step.dur}">
                    
                    ${step.val !== undefined ? 
                        `<input type="text" class="bg-black/20 rounded p-1 text-center text-xs text-white outline-none step-input" data-idx="${idx}" data-key="val" value="${step.val}">` 
                        : '<div></div>'}
                </div>
                <button class="text-red-400 opacity-0 group-hover:opacity-100 transition del-btn" data-idx="${idx}">
                    <span class="material-symbols-rounded text-sm">close</span>
                </button>
            `;
            list.appendChild(el);
        });

        // Re-attach listeners for inputs
        list.querySelectorAll('.step-input').forEach(inp => {
            inp.addEventListener('change', (e: any) => {
                const idx = parseInt(e.target.dataset.idx);
                const key = e.target.dataset.key;
                this.steps[idx][key] = e.target.value;
                if(key === 'dur') this.steps[idx][key] = parseInt(e.target.value);
                this.renderSteps(true);
            });
        });

        // Delete btns
        list.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', (e: any) => {
                const idx = parseInt(btn.getAttribute('data-idx')!);
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