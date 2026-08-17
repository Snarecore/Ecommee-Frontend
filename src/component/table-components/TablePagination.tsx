interface TablePaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
}

const TablePagination = ({
	currentPage,
	totalPages,
	// totalItems,
	// itemsPerPage,
	onPageChange,
}: TablePaginationProps) => {
	// const indexOfLastItem = currentPage * itemsPerPage;
	// const indexOfFirstItem = indexOfLastItem - itemsPerPage;

	return (
		<div className="flex flex-col items-end gap-4 bg-white px-4 py-1 sm:px-6 mt-3 cursor-pointer">
			<nav className="isolate inline-flex gap-2 rounded-md" aria-label="Pagination">
				<button
					onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
					disabled={currentPage === 1}
					className={`relative inline-flex items-center justify-center w-6 h-6 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'
						}`}
				>
					<span className="sr-only">Previous</span>
					<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
					</svg>
				</button>

				{/* Page numbers */}
				{[...Array(totalPages)].map((_, index) => (
					<button
						key={index + 1}
						onClick={() => onPageChange(index + 1)}
						className={`relative inline-flex items-center justify-center w-6 h-6 text-sm font-semibold cursor-pointer ${currentPage === index + 1
								? 'z-10 bg-[var(--color-primary)] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]'
								: 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
							}`}
					>
						{index + 1}
					</button>
				))}

				{/* Next button */}
				<button
					onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
					disabled={currentPage === totalPages}
					className={`relative inline-flex items-center justify-center w-6 h-6 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'cursor-not-allowed' : 'cursor-pointer'
						}`}
				>
					<span className="sr-only">Next</span>
					<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
					</svg>
				</button>
			</nav>


		</div>
	);
};

export default TablePagination;