import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";

interface HeroSliderItem {
    id: string;
    image: string;
    link: string;
}

interface PromotionItem {
    id: string;
    image: string;
    link: string;
}

interface Props {
    heroSliderList?: HeroSliderItem[];
    promotionList?: PromotionItem[];
}

const Banner: React.FC<Props> = ({ heroSliderList = [], promotionList = [] }) => {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [isSliderPaused, setIsSliderPaused] = useState(false);

    useEffect(() => {
        if (!isSliderPaused && heroSliderList.length > 0) {
            const slideInterval = setInterval(() => {
                setActiveSlideIndex((prevIndex) => (prevIndex + 1) % heroSliderList.length);
            }, 3000);

            return () => clearInterval(slideInterval);
        }
    }, [isSliderPaused, heroSliderList.length]);

    const handleNextSlide = () => {
        setActiveSlideIndex((prevIndex) => (prevIndex + 1) % heroSliderList.length);
    };

    const handlePrevSlide = () => {
        setActiveSlideIndex((prevIndex) =>
            prevIndex === 0 ? heroSliderList.length - 1 : prevIndex - 1
        );
    };

    const [promotionStartIndex, setPromotionStartIndex] = useState(0);

    useEffect(() => {
        if (promotionList.length > 3) {
            const interval = setInterval(() => {
                setPromotionStartIndex((prevIndex) =>
                    (prevIndex + 1) % promotionList.length
                );
            }, 4000);

            return () => clearInterval(interval);
        }
    }, [promotionList]);

    return (
        <div className="max-w-screen-2xl mx-auto px-4 my-8">
            <div
                className="flex flex-col md:flex-row gap-4 justify-between"
                onMouseEnter={() => setIsSliderPaused(true)}
                onMouseLeave={() => setIsSliderPaused(false)}
            >
                <div className="relative w-full md:w-8/12 lg:w-9/12">
                    <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg shadow-lg relative">
                        {heroSliderList.length === 1 ? (
                            <Image src={heroSliderList[0].image} alt="Slider image" className="w-full h-full object-cover" width={500} height={500} />
                        ) : (
                            <>
                                <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${activeSlideIndex * 100}%)` }}>
                                    {heroSliderList.map((slide) => {
                                        return (
                                            <div key={slide.id} className="w-full h-full flex-shrink-0">
                                                <Link to={slide.link} className="block w-full h-full">
                                                    <Image src={slide.image} alt={`Slider image`} className="w-full h-full" width={500} height={500} />
                                                </Link>
                                            </div>
                                        )
                                    })}
                                </div>
                                <button
                                    onClick={handlePrevSlide}
                                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 cursor-pointer"
                                >
                                    <FaChevronLeft />
                                </button>
                                <button
                                    onClick={handleNextSlide}
                                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 cursor-pointer"
                                >
                                    <FaChevronRight />
                                </button>
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                    {heroSliderList.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveSlideIndex(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${activeSlideIndex === index ? "bg-white w-6" : "bg-white/50 hover:bg-white/75"}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="w-full md:w-4/12 lg:w-3/12 h-[100px] sm:h-[100px] md:h-[500px] lg:h-[600px] flex md:flex-col gap-4">
                    {promotionList.length <= 3 ? (
                        promotionList.map((promotion) => (
                            <div
                                key={promotion.id}
                                className="flex-1 relative overflow-hidden rounded-lg shadow-lg group"
                            >
                                <Link to={promotion.link}>
                                    <Image src={promotion.image} alt="Promotion image" className="w-full h-full object-cover transition-all duration-500" width={500} height={500} />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <>
                            {[0, 1, 2].map((offset) => {
                                const index = (promotionStartIndex + offset) % promotionList.length;
                                const promotion = promotionList[index];
                                return (
                                    <div
                                        key={promotion.id}
                                        className="flex-1 relative overflow-hidden rounded-lg shadow-lg group "
                                    >
                                        <Link to={promotion.link}>
                                            <Image src={promotion.image} alt="Promotion image" className="w-full h-full object-cover transition-all duration-500" width={500} height={500} />
                                        </Link>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Banner;

