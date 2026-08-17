import Image from "next/image";
import Link from "next/link";;
import { mainCategoriesAtom, isLoadingAtom } from '../../store/global-store';
import { useAtom } from 'jotai';
import EmptyComponent from "../empty-component";
import MainCategorySkeleton from "../skeleton/MainCategorySkeleton";

interface ProductCategoryProps {
    contentData: any;
}

const ProductCategory: React.FC<ProductCategoryProps> = ({ contentData }) => {
    const [mainCategories] = useAtom(mainCategoriesAtom);
    const [isLoading] = useAtom(isLoadingAtom);

    return (
        <div className="max-w-screen-2xl mx-auto px-4 py-4 my-4">
            <div className="text-center mb-6">
                <h2 className="text-4xl font-bold mb-4 text-[var(--color-green-primary)]">
                    {contentData?.categorySectionTitle}
                </h2>
            </div>
            {isLoading ? (
                <MainCategorySkeleton />
            ) : mainCategories?.length > 0 ? (
                <div className="flex items-center justify-center flex-wrap gap-6">
                    {mainCategories.map((category) => (
                        <Link
                            href={`/shop?mainCategoryId=${category?.id}&pageNumber=1`}
                            key={category?.id}
                            className="group h-[150px] w-[220px] p-1.5 md:p-3 bg-white rounded-2xl shadow-sm transform transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[var(--color-primary)]/20 flex flex-col items-center justify-center"
                        >
                            <div className="pb-2 rounded-xl group-hover:from-[var(--color-primary)]/10 group-hover:to-transparent transition-all duration-300">
                                <Image src={category?.image} alt={category?.name} className="w-18 group-hover:scale-110 transition-transform duration-300" width={72} height={72} />
                            </div>
                            <h2 className="text-base sm:text-md font-medium text-[var(--color-green-primary)] transition-colors duration-300 text-center">
                                {category?.name}
                            </h2>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className='col-span-2 md:col-span-3 xl:col-span-4 2xl:col-span-5 flex justify-center items-center'>
                    <EmptyComponent message="Currently there are no products available." />
                </div>
            )}
        </div>
    );
};

export default ProductCategory;
