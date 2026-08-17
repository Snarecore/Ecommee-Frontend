import React from 'react';
import { IoClose } from 'react-icons/io5';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-opacity-50 bg-[#000000b6] flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition cursor-pointer">
                    <IoClose size={22} />
                </button>
                {title && <h2 className="text-xl font-bold mb-4 text-black">{title}</h2>}
                {children}
            </div>
        </div>
    );
};

export default Modal;
