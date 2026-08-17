import { FiRefreshCcw } from "react-icons/fi";

interface RefreshButtonProps {
	onClick: () => void;
}

const RefreshButton = ({ onClick }: RefreshButtonProps) => {
	return (
		<div 
			onClick={onClick}
			className="bg-[var(--color-primary)] text-white cursor-pointer hover:bg-[var(--color-primary-hover)] w-10 h-[34px] flex justify-center items-center rounded-md transition-all ease-in duration-300"
		>
			<FiRefreshCcw size={14} />
		</div>
	);
};

export default RefreshButton;
