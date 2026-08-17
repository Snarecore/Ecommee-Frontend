import Image from "next/image";
import React from 'react';
import EmptyBox from "../../assets/empty-box.svg";

interface EmptyComponentProps {
    image?: string;
    message?: string;
}

const EmptyComponent: React.FC<EmptyComponentProps> = ({
    image = EmptyBox,
    message = "Currently there is no data available."
}) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <Image src={image} alt="" className="w-40 h-40" width={160} height={160} />
            <p className="text-gray-500 text-lg">{message}</p>
        </div>
    );
};

export default EmptyComponent;