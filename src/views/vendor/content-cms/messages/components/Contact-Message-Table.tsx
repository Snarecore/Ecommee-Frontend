import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import TableSkeleton from "../../../../../component/skeleton/TableSkeleton";
import EmptyComponent from "../../../../../component/empty-component";
import DeleteModal from "../../../../../component/modals/DeleteModal";
import Pagination from "../../../../../component/pagination";

interface MessageDataProps {
    id: string;
    name: string;
    email: string;
    message: string;
}

interface MessageTableProps {
    dataList: MessageDataProps[];
    fetchData: () => void;
    pageCount: number;
    currentPageNumber: number;
    handlePagination: (paginationData: { selected: number }) => void;
    isLoading?: boolean;
    isFetching?: boolean;
}

const MessageTable = ({ dataList, fetchData, pageCount,
    currentPageNumber,
    handlePagination, isLoading, isFetching }: MessageTableProps) => {
    const { handleDeleteAPI } = useAPI();
    const apiUrl = apiConfig.vendor.vendorMessageUrl;

    const tableHeaders = [
        { key: "sl", label: "Sl" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "message", label: "Message" },
        { key: "action", label: "Action" }
    ];

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageDataProps | null>(null);

    const openDeleteModal = (data: MessageDataProps) => {
        setSelectedMessage(data);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedMessage(null);
    };

    const handleDelete = async () => {
        if (!selectedMessage) return;
        const apiResponse = await handleDeleteAPI({
            url: `${apiUrl}/${selectedMessage.id}`,
            showSuccessMessage: true
        });
        if (apiResponse) {
            fetchData();
            closeDeleteModal();
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
                                <th key={key} className="px-6 py-4 text-left text-[#000000e0]">{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 rounded-lg">
                        {dataList?.length > 0 ? (
                            dataList?.map((data, index) => (
                                <tr key={data.id} className="border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition duration-300">
                                    <td className="px-6 py-4 font-medium text-gray-800">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        {data.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        {data.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        {data.message}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openDeleteModal(data)} className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-2 rounded-md transition duration-300">
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
            {selectedMessage && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete Message"
                    message={`Are you sure you want to delete message?`}
                    onClose={closeDeleteModal}
                    onDelete={handleDelete}
                />
            )}

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

export default MessageTable;
