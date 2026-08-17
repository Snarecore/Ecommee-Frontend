import EmptyComponent from "../../../../component/empty-component";
import Button from "../../../../component/buttons/ButtonStyleOne";
import { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import WalletForm from "./WalletForm";
import Pagination from "../../../../component/pagination";
import { formatPrettyDateWithTime } from "../../../../utils/date-utils";
import { FiDownload } from "react-icons/fi";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { Link } from "react-router-dom";

interface WalletDataProps {
    vendorId: string;
    amount: string;
    status: string;
    approvedAt: string;
    paidAt: string;
    invoiceUrl: string;
    paymentRef: string;
    gateway: string;
    notes: string;
    createdAt: string;
}

interface WalletTableProps {
    dataList: WalletDataProps[];
    fetchWalletData: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    pageCount: number;
    currentPageNumber: number;
    handlePagination: (paginationData: { selected: number }) => void;
    availabeBalance: number;
}

const WalletTable = ({
    dataList,
    fetchWalletData,
    // isLoading,
    // isFetching,
    pageCount, currentPageNumber, handlePagination, availabeBalance
}: WalletTableProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { fetchData } = useAPI();
    const [bankInfoCheck, setBankInfoCheck] = useState();

    useEffect(() => {
        const checkBankInfo = async () => {
            const response = await fetchData({ apiUrl: apiConfig.people.vendor })
            setBankInfoCheck(response?.profile.accountHolderName || response?.profile.paypalEmailAddress)
        }
        checkBankInfo();
    }, [])

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };


    const WalletTableHeader = [
        "Amount",
        "Status",
        "Requested At",
        "Approved At",
        "Paid At",
        "Invoice",
    ];

    const hasActiveRequest = dataList.some(
        (item) => item.status === "PENDING" || item.status === "APPROVED"
    );

    return (
        <>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between p-2 border-b border-gray-200">
                    <p className="text-xl font-bold mb-4">Payment Requests</p>
                    {
                        bankInfoCheck ? (
                            <div
                                title={
                                    hasActiveRequest
                                        ? 'Finish current request first'
                                        : 'Requrest for payout'
                                }
                            >
                                <Button
                                    label="New Request"
                                    onClick={() => openModal()}
                                    color="var(--color-primary)"
                                    hoverColor="var(--color-primary-hover)"
                                    disabled={hasActiveRequest}
                                    icon={<IoMdAddCircleOutline size={18} />}
                                />
                            </div>

                        ) : (
                            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded px-4 py-2 text-yellow-800 text-sm font-medium">
                                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                                </svg>
                                <span>
                                    Please&nbsp;
                                    <Link
                                        to="/vendor-bank-information"
                                        className="underline text-yellow-700 hover:text-yellow-900 font-semibold transition-colors"
                                    >
                                        add your bank information
                                    </Link>
                                    &nbsp;to request a payout.
                                </span>
                            </div>
                        )
                    }
                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr>
                                <th className="p-3 text-left">
                                    Sl
                                </th>
                                {WalletTableHeader.map((header, index) => (
                                    <th key={index} className="p-3 text-left">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dataList?.length > 0 ? (
                                dataList.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="border-y border-gray-200">
                                        <td className="p-3 text-left">
                                            {rowIndex + 1}
                                        </td>
                                        <td className="p-3">${row.amount}</td>
                                        <td className="p-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : row.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}
                                            >
                                                {row.status}
                                            </span>
                                        </td>

                                        <td className="p-3">{formatPrettyDateWithTime(row.createdAt)}</td>
                                        <td className="p-3">
                                            {row.approvedAt ? formatPrettyDateWithTime(row.approvedAt) : "N/A"}
                                        </td>
                                        <td className="p-3">{row.paidAt ? formatPrettyDateWithTime(row.paidAt) : "N/A"}</td>

                                        <td className="p-3">
                                            {row.invoiceUrl ? (
                                                <a href={row.invoiceUrl} download target="_blank" rel="noopener noreferrer">
                                                    <FiDownload className="cursor-pointer text-blue-500 hover:text-blue-700" size={20} />
                                                </a>
                                            ) : (
                                                "N/A"
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyComponent message="No payment request yet!" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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

            <WalletForm
                isOpen={isModalOpen}
                onClose={closeModal}
                fetchWalletData={fetchWalletData}
                availabeBalance={availabeBalance}
            />
        </>
    );
};

export default WalletTable;
