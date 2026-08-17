import {
	MdOutlineArrowBackIos,
	MdOutlineArrowForwardIos
} from "react-icons/md";
import ReactPaginate from "react-paginate";

interface PaginationProps {
	pageCount: number;
	currentPageNumber: number;
	handlePagination: (selectedItem: { selected: number }) => void;
}

const Pagination: React.FC<PaginationProps> = ({
	pageCount,
	currentPageNumber,
	handlePagination
}) => {
	return (
		<ReactPaginate
			pageCount={pageCount || 1}
			forcePage={currentPageNumber - 1 || 0}
			onPageChange={handlePagination}
			breakLabel="..."
			nextLabel={<MdOutlineArrowForwardIos size={16} />}
			previousLabel={<MdOutlineArrowBackIos size={16} />}
			pageRangeDisplayed={3}
			marginPagesDisplayed={1}
			containerClassName="flex items-center justify-center gap-2 mt-8 mb-4 text-md font-semibold list-none"
			pageClassName="flex cursor-pointer rounded-full bg-[#e5e7eb]"
			pageLinkClassName="w-8 h-8 flex items-center justify-center"
			activeClassName="bg-[var(--color-green-primary)] font-bold"
			activeLinkClassName="text-[var(--color-white-primary)] font-bold"
			previousClassName="mr-2 cursor-pointer rounded-full flex items-center justify-center w-8 h-8 bg-gray-100"
			nextClassName="mr-2 cursor-pointer rounded-full flex items-center justify-center w-8 h-8 bg-gray-100"
			previousLinkClassName="px-3 py-2 text-xl text-[var(--color-black-primary)]"
			nextLinkClassName="px-3 py-2 text-xl text-[var(--color-black-primary)]"
			disabledClassName="opacity-50 pointer-events-none"
			breakClassName="mx-1"
			breakLinkClassName="px-2 py-1.5"
		/>
	);
};

export default Pagination;
