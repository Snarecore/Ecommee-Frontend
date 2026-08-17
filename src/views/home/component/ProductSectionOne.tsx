import ProductCardOne from '../../../component/card/product/ProductCardOne';
import EmptyComponent from '../../../component/empty-component';
import { Product } from '../../../interface/product.interface';

interface productSectionOneProps {
    productList: Product[];
    contentData: any;
}

const ProductSectionOne: React.FC<productSectionOneProps> = ({ productList, contentData }) => {
    if (!contentData?.isProductSectionOneVisible) return null;

    return (
        <div className='max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto px-4'>
            <div className="mt-6 mb-4">
                <h2
                    className="text-4xl font-bold rounded-md p-2 text-center"
                    style={{
                        backgroundColor: contentData?.productSectionOneBackgroundColor,
                        color: contentData?.productSectionOneFontColor,
                    }}
                >
                    {contentData?.productSectionOneTitle}
                </h2>
            </div>
            <div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 py-4">
                    {productList?.length > 0 ? (
                        <>
                            {productList.map((product) => (
                                <div key={product.id}>
                                    <ProductCardOne product={product} />
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

export default ProductSectionOne;
