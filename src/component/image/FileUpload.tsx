import React, { useState, useId } from "react";
import { IoCloseSharp, IoCloudUploadOutline } from "react-icons/io5";
// @ts-ignore
interface FileUploadProps {
	value: string | null;
	onChange: (file: File | null) => void;
}
// @ts-ignore
const FileUpload: React.FC<FileUploadProps> = ({ value, onChange }) => {
	const id = useId();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	// const [preview, setPreview] = useState<string | null>(value);

	// useEffect(() => {
	// 	if (!selectedFile) {
	// 		setPreview(value || null);
	// 		return;
	// 	}
	// 	const objectUrl = URL.createObjectURL(selectedFile);
	// 	setPreview(objectUrl);

	// 	return () => URL.revokeObjectURL(objectUrl);
	// }, [selectedFile, value]);

	const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) {
			setSelectedFile(null);
			return;
		}
		const file = e.target.files[0];
		if (file.type !== 'application/pdf') {
			alert('Please select a PDF file');
			return;
		}
		setSelectedFile(file);
		onChange(file);
	};

	const removeFile = () => {
		setSelectedFile(null);
		onChange(null);
	};

	return (
		<div className="flex flex-col space-y-3">
			<div className="flex flex-row items-start space-x-3">
				<label htmlFor={`${id}-file-upload`} className="w-[120px] h-[120px] flex items-center justify-center flex-col gap-2 border border-dashed border-[#e6eaed] text-sm rounded-md cursor-pointer hover:border-[var(--color-primary)] transition-all ease-in-out duration-300 mt-2">
					<IoCloudUploadOutline size={20} />
					<p className="font-semibold">Upload PDF</p>
				</label>
				<input
					id={`${id}-file-upload`}
					type="file"
					className="hidden"
					onChange={onSelectFile}
					accept=".pdf"
				/>
			</div>
	
			{selectedFile && (
				<div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
					<p className="text-sm text-gray-700 flex-1 break-all">
						{selectedFile.name}
					</p>
					<button
						onClick={removeFile}
						className="flex-shrink-0 bg-red-500 text-white p-1 rounded-md cursor-pointer hover:bg-red-600 transition-all duration-300"
					>
						<IoCloseSharp size={16} />
					</button>
				</div>
			)}

			{!selectedFile && typeof value === "string" && (
				<div className="bg-gray-50 p-3 rounded-lg">
					<p className="text-sm text-gray-700 break-all">
						{value.split('/').pop()}
					</p>
				</div>
			)}
		</div>
	);
};

export default FileUpload;
