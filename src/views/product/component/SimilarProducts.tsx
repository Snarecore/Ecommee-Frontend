import { useState } from "react";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import ProductCardOne from "../../../component/card/product/ProductCardOne";

interface SimilarProductsProps {
  relatedProducts: any[];
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ relatedProducts }) => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className=" mt-8">
      <div className="relative group">
        {/* Prev Button */}
        <button
          className={`absolute top-1/2 md:-left-10 z-10 swiper-button-prev w-8 h-8 bg-[var(--color-green-primary)] text-white grid place-items-center rounded-full transform -translate-y-1/2 cursor-pointer ${
            isBeginning ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isBeginning}
          onClick={() => swiperInstance?.slidePrev()}
        >
          <MdArrowBackIosNew />
        </button>

        {/* Next Button */}
        <button
          className={`absolute top-1/2 -right-0 md:-right-10 z-10 swiper-button-next w-8 h-8 bg-[var(--color-green-primary)] text-white grid place-items-center rounded-full transform -translate-y-1/2 cursor-pointer ${
            isEnd ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isEnd}
          onClick={() => swiperInstance?.slideNext()}
        >
          <MdArrowForwardIos />
        </button>

        <p className="text-2xl font-bold text-[var(--color-black-primary)]">Similar Products</p>

        <div className="w-full overflow-hidden">
          <Swiper
            modules={[Navigation]}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            spaceBetween={20}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 10 },
              480: { slidesPerView: 2, spaceBetween: 15 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 20 },
            }}
            onSwiper={(swiper) => setSwiperInstance(swiper)}
            onSlideChange={handleSlideChange}
            className="mt-6"
            watchOverflow
            observer
            observeParents
          >
            {relatedProducts.map((product, index) => (
              <SwiperSlide key={index} className="overflow-visible flex-shrink-0">
                <ProductCardOne product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default SimilarProducts;
