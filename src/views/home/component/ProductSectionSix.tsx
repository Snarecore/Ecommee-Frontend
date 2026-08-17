import ProductCardTwo from '../../../component/card/product/ProductCardTwo';
import EmptyComponent from '../../../component/empty-component';
import { Product } from '../../../interface/product.interface';

interface ProductSectionSixProps {
    productList: Product[];
    contentData: any;
}

const ProductSectionSix: React.FC<ProductSectionSixProps> = ({ productList, contentData }) => {
    if (!contentData?.isProductSectionSixVisible) return null;

    return (
        <div className='max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto px-4'>
            <div className="mt-6 mb-4">
                <p className="text-4xl font-bold bg-[var(--color-green-primary)] text-white rounded-md p-2 text-center"
                style={{
                    backgroundColor: contentData?.productSectionSixBackgroundColor,
                    color: contentData?.productSectionSixFontColor,
                }}
                >
                    {contentData?.productSectionSixTitle}
                </p>
            </div>
            <div className="max-w-screen-2xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 py-4">
                    {productList?.length > 0 ? (
                        <>
                            {productList.map((product) => (
                                <div key={product.id}>
                                    <ProductCardTwo product={product} />
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className='col-span-2 md:col-span-3 xl:col-span-4 2xl:col-span-5 flex justify-center items-center'>
                            <EmptyComponent message="Currently there are no products available." />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductSectionSix;
