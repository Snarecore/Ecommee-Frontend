import Image from "next/image";
import React from "react";

interface OrderCardProps {
    imageSrc: string;
    title: string;
    onViewProduct: () => void;
    onDownloadProduct: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
    imageSrc,
    title,
    onViewProduct,
    onDownloadProduct,
}) => {
    return (
        <div className="border border-gray-200 p-4 rounded-lg mt-3 flex items-center flex-wrap justify-between">
            <div className="flex items-start gap-4">
                <div className="w-24">
                    <Image src={imageSrc || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={title} className="object-cover w-full" width={500} height={500} />
                </div>
                <div>
                    <p className="font-semibold text-[var(--color-green-primary)]">{title}</p>
                    <div className="flex items-center flex-wrap gap-2 lg:gap-4 text-sm mt-10 lg:mt-8">
                        <button
                            onClick={onViewProduct}
                            className="border border-[var(--color-green-primary)] text-[var(--color-green-primary)]  px-4 py-2 rounded-md cursor-pointer font-semibold"
                        >
                            View Product
                        </button>
                        <button
                            onClick={onDownloadProduct}
                            className="px-4 py-2 bg-[var(--color-green-secondary)] rounded-md cursor-pointer font-semibold"
                        >
                            Download Product
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
