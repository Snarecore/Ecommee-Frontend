import Image from "next/image";
import { FiTag } from "react-icons/fi";
import EmptyComponent from "../../../../component/empty-component";
import { Link } from "react-router-dom";

type TopSellingProduct = {
    productId: string;
    productImage: string;
    productName: string;
    price: number;
    sales: number;
};

interface TopProductListDataProps {
    title: string;
    topSellingProducts: TopSellingProduct[];
}

const TopProductListTable = ({ title, topSellingProducts }: TopProductListDataProps) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center p-2">
                <p className="text-2xl font-bold flex items-center gap-2 mb-4 text-gray-800">
                    <span className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
                        <FiTag size={20} />
                    </span>
                    {title}
                </p>
            </div>

            <div>
                {topSellingProducts?.length > 0 ? (
                    topSellingProducts.map((row) => (
                        <div key={row.productId} className="border-y border-gray-200 flex justify-between">
                            <div className="p-3">
                                <div className="flex flex-col">
                                    <div className="flex gap-4">
                                        <Link to={`/product-details/${row.productId}`}>
                                            <Image src={row.productImage} alt={row.productName} className="w-12 h-12 rounded-md" width={48} height={48} />
                                        </Link>
                                        <div>
                                            <Link to={`/product-details/${row.productId}`}>
                                                <p className="font-semibold">{row.productName}</p>
                                            </Link>
                                            <p className="text-gray-700">{`$${row.price}`}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-gray-600 text-sm">Sales</p>
                                <p className="font-semibold">{row.sales}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>
                        <EmptyComponent message="No products found. Start by adding your first product to your store!" />
                    </div>
                )}
            </div>
        </div>

    );
};

export default TopProductListTable;
