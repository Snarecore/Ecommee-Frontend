import { useState } from "react";

interface UsePaginationResult {
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
	getTotalPages: (totalItems: number, itemsPerPage: number) => number;
	handlePageChange: (event: { selected: number }) => void;
	startIndex: number;
	setStartIndex: React.Dispatch<React.SetStateAction<number>>;
	endIndex: number;
	setEndIndex: React.Dispatch<React.SetStateAction<number>>;
	calculatePageRange: (totalItems: number, itemsPerPage: number) => void;
}

const usePagination = (): UsePaginationResult => {
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [startIndex, setStartIndex] = useState<number>(0);
	const [endIndex, setEndIndex] = useState<number>(0);

	const getTotalPages = (totalItems: number, itemsPerPage: number): number => {
		return Math.ceil(totalItems / itemsPerPage);
	};

	const handlePageChange = (event: { selected: number }): void => {
		setCurrentPage(event.selected + 1);
	};

	const calculatePageRange = (totalItems: number, itemsPerPage: number): void => {
		const totalPages = getTotalPages(totalItems, itemsPerPage);

		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
			return;
		}

		const calculatedStart = (currentPage - 1) * itemsPerPage;
		const calculatedEnd = calculatedStart + itemsPerPage;

		setStartIndex(calculatedStart);
		setEndIndex(calculatedEnd);
	};

	return {
		currentPage,
		setCurrentPage,
		getTotalPages,
		handlePageChange,
		startIndex,
		setStartIndex,
		endIndex,
		setEndIndex,
		calculatePageRange
	};
};

export default usePagination;
