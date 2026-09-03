'use client';

import Image from "next/image";
import Link from "next/link";
import { formatImageUrl } from "../../../utils/product-utils";
import defaultSellerBanner from "../../../assets/become-a-seller-benner.png";

interface BecomeSellerProps {
  contentData?: {
    bannerImage?: string;
    bannerImageLink?: string;
  };
}

const BecomeSeller: React.FC<BecomeSellerProps> = ({ contentData }) => {
  const imageUrl = contentData?.bannerImage 
    ? formatImageUrl(contentData.bannerImage) 
    : defaultSellerBanner;

  return (
    <section className="px-4 sm:px-6 my-8 sm:my-12">
      <div className="max-w-screen-2xl mx-auto">
        <Link 
          href={contentData?.bannerImageLink || "#"} 
          target={contentData?.bannerImageLink ? "_blank" : "_self"}
          rel="noopener noreferrer" 
          className="block w-full group relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500"
        >
          <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#f5efe9] dark:bg-slate-900">
            <Image 
              src={imageUrl} 
              alt="Become a Seller Banner" 
              className="w-full h-auto object-contain sm:object-cover sm:object-top transform group-hover:scale-[1.01] transition-transform duration-500" 
              width={1920} 
              height={650} 
              priority 
              sizes="(max-width: 1536px) 100vw, 1536px"
            />
          </div>
        </Link>
      </div>
    </section>
  );
};

export default BecomeSeller;