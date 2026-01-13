import React, { useRef, useEffect, useState } from 'react';

interface EditDeviceDialogProps {
    open: boolean;
    ip: string;
    currentName: string;
    onClose: () => void;
    onSave: (name: string) => void;
}

export const EditDeviceDialog: React.FC<EditDeviceDialogProps> = ({ open, ip, currentName, onClose, onSave }) => {
    const nativeRef = useRef<HTMLDialogElement>(null);
    const [name, setName] = useState(currentName);

    useEffect(() => {
        setName(currentName);
    }, [currentName]);

    useEffect(() => {
        if (open) {
            nativeRef.current?.showModal();
        } else {
            nativeRef.current?.close();
        }
    }, [open]);

    const handleSave = () => {
        onSave(name);
        onClose();
    };

    return (
        <dialog ref={nativeRef} className="
            bg-[#2b2930] text-[#e6e1e5] p-0 rounded-[28px]
            backdrop:bg-black/60 backdrop:backdrop-blur-[2px]
            shadow-2xl border border-white/5 outline-none
            min-w-[320px] max-w-[90vw]
            open:animate-in open:fade-in open:zoom-in-95 duration-200
            fixed inset-0 m-auto z-[100]
        " onClose={onClose}>
            <div className="flex flex-col w-full overflow-hidden">
                <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
                    <span className="text-[24px] leading-8 text-on-surface">Сохранение</span>
                    <m3e-icon-button density="-1" onClick={onClose} className="text-on-surface-variant">
                        <m3e-icon name="close"></m3e-icon>
                    </m3e-icon-button>
                </div>

                <div className="px-6 pb-2 flex flex-col gap-4 overflow-y-auto max-h-[60vh] w-full box-border">
                     <div className="flex flex-col gap-4 pt-2">
                        {/* IP Field */}
                        <div className="flex flex-col gap-1">
                            <div className="relative bg-surface-variant/30 rounded-t-lg rounded-b-none border-b border-outline-variant hover:bg-surface-variant/50 transition-colors h-14 px-4 flex flex-col justify-center opacity-60">
                                <span className="text-[12px] text-primary font-medium leading-4">IP Адрес</span>
                                <input type="text" value={ip} readOnly
                                    className="bg-transparent border-none outline-none text-on-surface text-body-large font-mono p-0 pointer-events-none" />
                                <m3e-icon name="wifi" className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"></m3e-icon>
                            </div>
                        </div>

                        {/* Name Field */}
                        <div className="flex flex-col gap-1">
                            <div className="relative bg-surface-variant/30 rounded-t-lg rounded-b-none border-b border-on-surface hover:bg-surface-variant/50 focus-within:bg-surface-variant/50 transition-colors h-14 px-4 flex flex-col justify-center group">
                                <span className="text-[12px] text-on-surface-variant group-focus-within:text-primary font-medium leading-4 transition-colors">Название устройства</span>
                                <input type="text" placeholder="Например: Люстра" value={name} onChange={e => setName(e.target.value)}
                                    className="bg-transparent border-none outline-none text-on-surface text-body-large p-0 placeholder:text-on-surface-variant/30" />
                                <m3e-icon name="edit" className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors"></m3e-icon>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 flex justify-end gap-2 shrink-0">
                    <m3e-button variant="text" onClick={onClose}>Отмена</m3e-button>
                    <m3e-button variant="filled" onClick={handleSave}>Сохранить</m3e-button>
                </div>
            </div>
        </dialog>
    );
};