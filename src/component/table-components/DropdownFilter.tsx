import React from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

interface OptionType {
	label: string;
	value: string;
}

interface DropdownFilterProps {
	title: string;
	//@ts-ignore
	options: OptionType[];
	selectedOption: OptionType | null;
	onSelect: (option: OptionType) => void;
	isOpen: boolean; 
	onToggle: () => void; 
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({
	title,
	options,
	selectedOption,
	onSelect,
	isOpen,
	onToggle,
}) => {
	return (
		<div className="relative">
			<div
				className={`border border-gray-200 px-3 py-2 rounded-md cursor-pointer flex justify-between items-center w-fit h-[34px] ${isOpen
						? "bg-[var(--color-primary)] text-white"
						: "hover:bg-[var(--color-primary)] hover:text-white transition-all ease-in duration-300"
					}`}
				onClick={onToggle} 
			>
				{selectedOption ? selectedOption.label : title}
				<RiArrowDropDownLine size={20} />
			</div>

			{isOpen && (
				<div className="absolute left-0 right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md z-50">
					{options.map((option) => (
						<div
							key={option.value}
							className={`px-4 py-2 cursor-pointer ${
								selectedOption?.value === option.value
									? "text-[var(--color-primary)] font-semibold rounded-sm"
									: "hover:text-[var(--color-primary)]"
							}`}
							onClick={() => onSelect(option)}
						>
							{option.label}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default DropdownFilter;
