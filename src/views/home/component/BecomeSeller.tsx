import Image from "next/image";
import Link from "next/link";

interface BecomeSellerProps {
  contentData: {
    bannerImage: string;
    bannerImageLink: string;
  }
}

const BecomeSeller: React.FC<BecomeSellerProps> = ({ contentData }) => {
  return (
    <div className="px-6 mt-8">
      <div className="max-w-screen-2xl mx-auto">
        <Link href={contentData?.bannerImageLink || ""} target="_blank" rel="noopener noreferrer">
          {contentData?.bannerImage && (
            <Image src={contentData.bannerImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt="Become a Seller" className="w-full h-60 rounded-[15px] object-cover" width={500} height={240} />
          )}
        </Link>
      </div>
    </div>
  )
}

export default BecomeSeller