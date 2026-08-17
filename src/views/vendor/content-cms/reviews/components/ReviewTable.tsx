import Image from "next/image";
import { useState } from "react";
import { FiTrash2, FiStar, FiEye } from "react-icons/fi";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import TableSkeleton from "../../../../../component/skeleton/TableSkeleton";
import EmptyComponent from "../../../../../component/empty-component";
import DeleteModal from "../../../../../component/modals/DeleteModal";
import Pagination from "../../../../../component/pagination";
import Modal from "../../../../../component/modals/Modal";

interface ReviewDataProps {
    id: string;
    user: {
        name: string;
        email: string;
        phone: string;
    };
    product: {
        name: string;
        featuredImage: string;
    };
    rating: string | number;
    comment?: string;
    status?: "pending" | "approved";
    isApprove: string;
    created_at?: string;
}

const requiredFields: any = [
    { key: "reviewId", value: "review id", label: "text" },
    { key: "isApprove", value: "is approve", label: "text" },
];

interface ReviewTableProps {
    dataList: ReviewDataProps[];
    fetchData: () => void;
    pageCount: number;
    currentPageNumber: number;
    handlePagination: (paginationData: { selected: number }) => void;
    isLoading?: boolean;
    isFetching?: boolean;
}

const StarRating = ({ rating }: { rating: string | number }) => {
    const starCount = Math.max(0, Math.min(5, parseInt(String(rating || 0), 10)));
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
                <FiStar
                    key={index}
                    className={`w-4 h-4 ${index < starCount ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
            ))}
        </div>
    );
};

const ReviewTable = ({
    dataList,
    fetchData,
    pageCount,
    currentPageNumber,
    handlePagination,
    isLoading,
    isFetching,
}: ReviewTableProps) => {
    const { handleDeleteAPI, handleApiMutation, patchMutation } = useAPI() as any;
    const apiUrl = apiConfig.vendor.vendorProductReviewUrl;

    const tableHeaders = [
        { key: "sl", label: "Sl" },
        { key: "name", label: "Name" },
        { key: "product", label: "Product" },
        { key: "rating", label: "Rating" },
        { key: "status", label: "Status" },
        { key: "action", label: "Action" },
    ];

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ReviewDataProps | null>(null);

    // View modal state
    const [viewComment, setViewComment] = useState(false);
    const [viewReview, setViewReview] = useState<ReviewDataProps | null>(null);
    const [changingStatus, setChangingStatus] = useState(false);

    const openDeleteModal = (data: ReviewDataProps) => {
        setSelectedReview(data);
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedReview(null);
    };

    const handleDelete = async () => {
        if (!selectedReview) return;
        const apiResponse = await handleDeleteAPI({
            url: `${apiUrl}/${selectedReview.id}`,
            showSuccessMessage: true,
        });
        if (apiResponse) {
            fetchData();
            closeDeleteModal();
        }
    };

    // Open/close view modal
    const openViewModal = (data: ReviewDataProps) => {
        setViewReview(data);
        setViewComment(true);
    };
    const closeViewModal = () => {
        setViewComment(false);
        setViewReview(null);
    };

    const updateStatus = async (approve: boolean) => {
        if (!viewReview?.id) return;
        setChangingStatus(true);
        try {
            const payload = {
                reviewId: viewReview.id,
                isApprove: approve,
            };

            const result = await handleApiMutation({
                mutation: patchMutation,
                url: apiUrl,
                body: payload,
                invalidateQueryKey: [],
                showSuccessMessage: true,
                showErrorMessage: true,
                requiredFields,
            });

            if (result?.success) {
                fetchData();
                closeViewModal();
            }
        } finally {
            setChangingStatus(false);
        }
    };

    if (isFetching || isLoading) return <TableSkeleton />;

    return (
        <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="mt-4 w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-gray-100">
                        <tr className="text-gray-600 text-sm border-b border-gray-200">
                            {tableHeaders.map(({ key, label }) => (
                                <th key={key} className="px-6 py-4 text-left text-[#000000e0]">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 rounded-lg">
                        {dataList?.length > 0 ? (
                            dataList.map((data, index) => (
                                <tr
                                    key={data.id}
                                    className="border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition duration-300"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-800">{index + 1}</td>
                                    <td className="px-6 py-4">{data?.user?.name}</td>
                                    <td className="px-6 py-4">{data?.product?.name}</td>
                                    <td className="px-6 py-4">
                                        <StarRating rating={data?.rating} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${data?.isApprove
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {data?.isApprove ? "Approved" : "Pending"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {/* VIEW */}
                                            <button
                                                onClick={() => openViewModal(data)}
                                                className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-2 rounded-md transition duration-300"
                                                title="View"
                                            >
                                                <FiEye />
                                            </button>
                                            {/* DELETE */}
                                            <button
                                                onClick={() => openDeleteModal(data)}
                                                className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-2 rounded-md transition duration-300"
                                                title="Delete"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="px-6 py-4 text-center italic">
                                    <EmptyComponent />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete modal */}
            {selectedReview && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete Review"
                    message={`Are you sure you want to delete review?`}
                    onClose={closeDeleteModal}
                    onDelete={handleDelete}
                />
            )}

            {/* View modal */}
            {/* Modal */}
            <Modal
                isOpen={viewComment}
                title="View Comment"
                onClose={closeViewModal}
            >
                {!viewReview ? (
                    <div className="p-6 text-center text-gray-500">Loading…</div>
                ) : (
                    <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-base font-semibold">
                                    {viewReview?.product?.name ?? "—"}
                                </div>

                                <div className="mt-1">
                                    <StarRating rating={viewReview?.rating ?? 0} />
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    <p
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${!!viewReview?.isApprove
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {!!viewReview?.isApprove ? "Approved" : "Pending"}
                                    </p>

                                </div>
                            </div>

                            {/* Images */}
                            <div className="flex gap-2 flex-wrap justify-end">
                                {viewReview?.product?.featuredImage && (
                                    <Image src={viewReview.product.featuredImage || null} alt={viewReview?.product?.name ?? "Product image"} className="rounded-md" width={100} height={500} />
                                )}
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Comment</div>
                            <div className="p-3 rounded-md border border-gray-300 bg-gray-50 text-sm whitespace-pre-wrap">
                                {viewReview?.comment || "—"}
                            </div>
                        </div>

                        {/* User info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-gray-500">User</div>
                                <div className="font-medium">{viewReview?.user?.name ?? "—"}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Email</div>
                                <div className="font-medium break-all">{viewReview?.user?.email ?? "—"}</div>
                            </div>
                        </div>

                        {/* Approve/Reject */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={closeViewModal}
                                disabled={changingStatus}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-60 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => updateStatus(true)}
                                disabled={changingStatus || !!viewReview?.isApprove}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white bg-green-600 cursor-pointer hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                                {changingStatus ? "Saving..." : !!viewReview?.isApprove ? "Approved" : "Approve"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>


            {/* Pagination */}
            {pageCount > 1 && (
                <div className="flex justify-center">
                    <Pagination
                        pageCount={pageCount}
                        currentPageNumber={currentPageNumber}
                        handlePagination={handlePagination}
                    />
                </div>
            )}
        </div>
    );
};

export default ReviewTable;
