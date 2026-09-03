import React from 'react';
import { IoClose } from 'react-icons/io5';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center px-4 transition-opacity duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl p-6 relative animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                    aria-label="Close Modal"
                >
                    <IoClose size={22} />
                </button>
                {title && <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>}
                {children}
            </div>
        </div>
    );
};

export default Modal;
