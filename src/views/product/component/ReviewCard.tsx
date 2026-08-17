import Image from "next/image";
import { IoMdStar, IoMdStarHalf, IoMdStarOutline } from "react-icons/io";
import React from "react";

interface ReviewCardProps {
    name: string;
    avatar: string;
    date: string;
    review: string;
    details: string;
    rating: number;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ name, avatar, date, review, details, rating }) => {
    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        for (let i = 0; i < fullStars; i++) stars.push(<IoMdStar key={`full-${i}`} />);
        if (hasHalfStar) stars.push(<IoMdStarHalf key="half" />);
        for (let i = 0; i < emptyStars; i++) stars.push(<IoMdStarOutline key={`empty-${i}`} />);

        return <div className="flex items-center text-yellow-500">{stars}</div>;
    };

    return (
        <div className="bg-white py-4 border-b border-gray-300">
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <Image src={avatar} alt={name} className="h-10 w-10 rounded-full border border-[var(--color-green-primary)]" width={40} height={40} />
                    <div>
                        <p className="font-medium">{name}</p>
                        <div className="flex items-center gap-1 text-yellow-500">
                            {renderStars()}
                            <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-500">{date}</p>
            </div>

            <div className="mt-4 space-y-2">
                <p className="font-semibold">{review}</p>
                <p className="text-sm text-gray-700">{details}</p>
            </div>
        </div>

    );
};

export default ReviewCard;
