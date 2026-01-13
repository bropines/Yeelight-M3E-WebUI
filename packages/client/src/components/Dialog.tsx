import React, { useRef, useEffect } from 'react';

interface DialogProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, title, onClose, children, actions }) => {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [open]);

    return (
        <dialog ref={ref} className="
            bg-[#2b2930] text-[#e6e1e5] p-0 rounded-[28px]
            backdrop:bg-black/60 backdrop:backdrop-blur-[2px]
            shadow-2xl border border-white/5 outline-none
            min-w-[320px] max-w-[90vw]
            open:animate-in open:fade-in open:zoom-in-95 duration-200
            fixed inset-0 m-auto z-[100]
        " onClose={onClose} onClick={(e) => {
             const rect = ref.current?.getBoundingClientRect();
             if (rect && (e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right)) {
                 onClose();
             }
        }}>
            <div className="flex flex-col w-full overflow-hidden">
                <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
                    <span className="text-[24px] leading-8 text-on-surface">{title}</span>
                    <m3e-icon-button density="-1" onClick={onClose} className="text-on-surface-variant">
                        <m3e-icon name="close"></m3e-icon>
                    </m3e-icon-button>
                </div>

                <div className="px-6 pb-2 flex flex-col gap-4 overflow-y-auto max-h-[60vh] w-full box-border">
                    {children}
                </div>

                {actions && (
                    <div className="px-6 py-6 flex justify-end gap-2 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </dialog>
    );
};