import Image from "next/image";
import Link from "next/link";
import { mainCategoriesAtom, isLoadingAtom } from '../../store/global-store';
import { useAtom } from 'jotai';
import EmptyComponent from "../empty-component";
import MainCategorySkeleton from "../skeleton/MainCategorySkeleton";

interface ProductCategoryProps {
    contentData: any;
    featuredCategories?: any[];
}

const ProductCategory: React.FC<ProductCategoryProps> = ({ contentData, featuredCategories }) => {
    const [mainCategories] = useAtom(mainCategoriesAtom);
    const [isLoading] = useAtom(isLoadingAtom);

    const categoriesToRender = featuredCategories && featuredCategories.length > 0 ? featuredCategories : mainCategories;

    return (
        <div className="max-w-screen-2xl mx-auto px-4 py-8 my-4">
            <div className="text-center mb-8 relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[var(--color-green-primary)] dark:text-green-400">
                    {contentData?.categorySectionTitle}
                </h2>
                <div className="w-16 h-1 bg-[var(--color-green-primary)] dark:bg-green-400 mx-auto rounded-full"></div>
            </div>
            {isLoading ? (
                <MainCategorySkeleton />
            ) : categoriesToRender?.length > 0 ? (
                <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center sm:flex-wrap gap-3 sm:gap-6 md:gap-8">
                    {categoriesToRender.map((category) => {
                        const isSubCategory = !!category?.mainCategoryId;
                        const linkHref = isSubCategory 
                            ? `/shop?firstCategoryId=${category.id}&pageNumber=1`
                            : `/shop?mainCategoryId=${category.id}&pageNumber=1`;
                        const imgSource = category?.image || category?.bannerImage;

                        return (
                            <Link
                                href={linkHref}
                                key={category?.id}
                                className="group relative w-full sm:w-[200px] md:w-[220px] lg:w-[240px] h-[220px] sm:h-[270px] md:h-[320px] rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all duration-500 ease-out cursor-pointer flex flex-col justify-end hover:-translate-y-1.5"
                            >
                                <div className="absolute inset-0 w-full h-full">
                                    <Image 
                                        src={imgSource || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} 
                                        alt={category?.name} 
                                        className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105" 
                                        width={300} 
                                        height={400} 
                                        priority={true}
                                    />
                                </div>

                                <div className="relative z-10 p-3 sm:p-5 text-center w-full">
                                    <h2 className="text-white font-semibold text-sm sm:text-base md:text-lg tracking-wide group-hover:scale-102 transition-transform duration-300 drop-shadow-md">
                                        {category?.name}
                                    </h2>
                                </div>
                            </Link>
                        );
                    })}
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
