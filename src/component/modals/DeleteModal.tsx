import React from "react";
import { FiTrash2 } from "react-icons/fi";

interface DeleteModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	onClose: () => void;
	onDelete: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
	isOpen,
	title,
	message,
	onClose,
	onDelete
}) => {
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
			className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-[9999] p-4 transition-opacity duration-200"
			onClick={onClose}
		>
			<div
				className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-scaleUp"
				role="dialog"
				aria-labelledby="delete-modal-title"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex flex-col items-center text-center">
					<div className="bg-red-100 dark:bg-red-900/40 p-3.5 rounded-full mb-2">
						<FiTrash2 className="text-2xl text-red-600 dark:text-red-400" />
					</div>
					<h2 id="delete-modal-title" className="text-lg font-bold text-gray-900 dark:text-white mt-1">{title}</h2>
					<p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{message}</p>
				</div>
				<div className="flex items-center justify-center gap-3 mt-6">
					<button
						onClick={onClose}
						className="flex-1 py-2.5 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition"
					>
						Cancel
					</button>
					<button
						onClick={onDelete}
						className="flex-1 py-2.5 px-4 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer transition shadow-xs"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteModal;
